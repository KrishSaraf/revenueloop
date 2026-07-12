"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { ShowcasePersona } from "@/lib/ai/chat";
import { cn } from "@/lib/utils";

interface ChatLine {
  role: "user" | "assistant";
  content: string;
}

interface ShowcaseChatProps {
  persona: ShowcasePersona;
  greeting: string;
  placeholder?: string;
  userLabel?: string;
  assistantLabel?: string;
  theme?: "light-blue" | "dark-emerald" | "light-amber";
}

const themes = {
  "light-blue": {
    user: "ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-sky-500 px-4 py-3 text-sm leading-relaxed text-white",
    assistant:
      "max-w-[88%] rounded-2xl rounded-tl-md bg-sky-50 px-4 py-3 text-sm leading-relaxed text-slate-800",
    input: "rounded-2xl border border-sky-100 bg-sky-50/60",
    send: "rounded-full bg-sky-500 text-white hover:bg-sky-600",
    banner: "border-sky-200 bg-sky-50 text-sky-900",
  },
  "dark-emerald": {
    user: "ml-8 rounded-2xl rounded-tr-md border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-zinc-300",
    assistant:
      "rounded-2xl rounded-tl-md border border-emerald-400/10 bg-emerald-400/[0.06] px-4 py-3 text-sm leading-relaxed text-zinc-200",
    input: "rounded-xl border border-white/[0.08] bg-black/30",
    send: "rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400",
    banner: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  "light-amber": {
    user: "ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-800",
    assistant:
      "max-w-[90%] rounded-2xl rounded-tl-md bg-amber-700 px-4 py-3 text-sm leading-relaxed text-white",
    input: "rounded-2xl border border-amber-100 bg-amber-50/60",
    send: "rounded-full bg-amber-700 text-white hover:bg-amber-800",
    banner: "border-amber-200 bg-amber-50 text-amber-950",
  },
};

export function ShowcaseChat({
  persona,
  greeting,
  placeholder = "Type a message…",
  userLabel = "You",
  assistantLabel = "Assistant",
  theme = "light-blue",
}: ShowcaseChatProps) {
  const styles = themes[theme];
  const [messages, setMessages] = useState<ChatLine[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/showcase/chat")
      .then((res) => res.json())
      .then((data: { configured: boolean; provider: string | null }) => {
        setConfigured(data.configured);
        setProvider(data.provider);
      })
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatLine[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/showcase/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, messages: nextMessages }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.reply) {
        throw new Error(data.error ?? "Could not get a reply.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-[22rem] flex-col">
      {configured === false ? (
        <div className={cn("mb-3 rounded-xl border px-3 py-2 text-xs", styles.banner)}>
          Add a free API key to <code className="font-mono">.env.local</code> —{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Gemini
          </a>{" "}
          or{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Groq
          </a>
          . Then restart the dev server.
        </div>
      ) : provider ? (
        <p className="mb-2 font-mono text-[10px] text-zinc-500">
          Powered by {provider}
        </p>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index}>
            {theme === "dark-emerald" ? (
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                {message.role === "assistant" ? assistantLabel : userLabel}
              </p>
            ) : null}
            <div className={message.role === "user" ? styles.user : styles.assistant}>
              {message.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className={styles.assistant}>
            <Loader2 size={14} className="inline animate-spin" /> Thinking…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 text-xs text-rose-400">{error}</p>
      ) : null}

      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className={cn(
            "flex-1 px-4 py-3 text-sm outline-none disabled:opacity-60",
            styles.input,
            theme === "dark-emerald" ? "text-zinc-100 placeholder:text-zinc-600" : "",
          )}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            styles.send,
          )}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send
        </button>
      </form>
    </div>
  );
}
