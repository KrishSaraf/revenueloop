import { getEnv } from "@/lib/validation/env";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ShowcasePersona = "telebot" | "sales-agent" | "concierge";

const defaultGeminiModels = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3-flash-preview",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

const personaPrompts: Record<ShowcasePersona, string> = {
  telebot: `You are the appointment telebot for Toa Payoh Family Dental, a neighbourhood dental clinic in Singapore.
Help patients book check-ups, scaling, and emergency slots. Be warm, concise, and professional.
Offer concrete time slots (weekday afternoons). Confirm provisional bookings and mention NRIC verification on arrival.
Never invent prices — say the clinic will confirm fees on arrival. Keep replies under 80 words.`,

  "sales-agent": `You are VentureMint's automated Sales Agent calling the owner of New Nature Spa, a massage spa in Pandan Gardens, Singapore.
They have no website — only a Google Maps listing and phone bookings. You prepared a site preview for them.
Pitch the Launch Site Sprint: open at S$200 one-time + S$20/year (no monthly). Owner pushes back — settle at S$140 one-time + S$20/year. Handle objections naturally.
Sound human, confident, and brief. Ask for permission before sending checkout. Keep replies under 90 words.`,

  concierge: `You are the Brew Concierge for Bugis Brew Lab, a specialty coffee bar in Bugis, Singapore.
Help guests with table reservations, menu questions, and group orders. Mention seasonal pour-over, flat white, butter croissant.
Offer specific times for tables. Route orders to the counter. Be friendly and fast. Keep replies under 80 words.`,
};

export function getPersonaPrompt(persona: ShowcasePersona) {
  return personaPrompts[persona];
}

export function aiConfigured() {
  const env = getEnv();
  return Boolean(env.GEMINI_API_KEY || env.GROQ_API_KEY);
}

export function aiProviderName() {
  const env = getEnv();
  if (env.GEMINI_API_KEY) return "Google Gemini";
  if (env.GROQ_API_KEY) return "Groq";
  return null;
}

async function chatGeminiModel(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${model} ${response.status}: ${error.slice(0, 160)}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`${model} returned an empty response.`);
  return text;
}

async function chatGemini(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const env = getEnv();
  const models = env.GEMINI_MODEL
    ? [env.GEMINI_MODEL, ...defaultGeminiModels]
    : defaultGeminiModels;

  let lastError: Error | null = null;
  for (const model of [...new Set(models)]) {
    try {
      return await chatGeminiModel(apiKey, model, systemPrompt, messages);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("All Gemini models failed.");
}

async function chatGroq(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq error ${response.status}: ${error.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned an empty response.");
  return text;
}

export async function generateShowcaseReply(
  persona: ShowcasePersona,
  messages: ChatMessage[],
): Promise<{ reply: string; provider: string }> {
  const env = getEnv();
  const systemPrompt = getPersonaPrompt(persona);

  if (env.GEMINI_API_KEY) {
    const reply = await chatGemini(env.GEMINI_API_KEY, systemPrompt, messages);
    return { reply, provider: "gemini" };
  }

  if (env.GROQ_API_KEY) {
    const reply = await chatGroq(env.GROQ_API_KEY, systemPrompt, messages);
    return { reply, provider: "groq" };
  }

  throw new Error(
    "No AI API key configured. Set GEMINI_API_KEY in .env.local (local) or your host's environment variables (production).",
  );
}
