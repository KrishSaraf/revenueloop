import { NextResponse } from "next/server";
import { getEnv } from "@/lib/validation/env";

export async function POST() {
  const env = getEnv();

  return NextResponse.json({
    ok: true,
    mode: env.mode,
    message:
      env.mode === "mock"
        ? "Client demo loop can run without external API keys."
        : "Live providers are configured. External actions still require human approval.",
  });
}
