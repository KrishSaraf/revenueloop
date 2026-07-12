import { NextResponse } from "next/server";
import { z } from "zod";
import {
  aiConfigured,
  aiProviderName,
  generateShowcaseReply,
  type ShowcasePersona,
} from "@/lib/ai/chat";

const requestSchema = z.object({
  persona: z.enum(["telebot", "sales-agent", "concierge"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

export async function GET() {
  return NextResponse.json({
    configured: aiConfigured(),
    provider: aiProviderName(),
    setup: {
      gemini: "https://aistudio.google.com/apikey",
      groq: "https://console.groq.com/keys",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const { reply, provider } = await generateShowcaseReply(
      body.persona as ShowcasePersona,
      body.messages,
    );

    return NextResponse.json({ ok: true, reply, provider });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate reply.";
    const status = message.includes("No AI API key") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
