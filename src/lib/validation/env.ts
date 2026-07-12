import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export function getEnv() {
  const parsed = envSchema.parse(process.env);
  const liveReady =
    parsed.SUPABASE_URL &&
    parsed.SUPABASE_ANON_KEY &&
    parsed.OPENAI_API_KEY &&
    parsed.GOOGLE_PLACES_API_KEY &&
    parsed.ELEVENLABS_API_KEY &&
    parsed.ELEVENLABS_AGENT_ID &&
    parsed.STRIPE_SECRET_KEY;

  return {
    ...parsed,
    mode: parsed.NEXT_PUBLIC_DEMO_MODE === "false" && liveReady ? "live" : "mock",
  } as const;
}
