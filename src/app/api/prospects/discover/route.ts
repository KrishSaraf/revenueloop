import { NextResponse, type NextRequest } from "next/server";
import { createProviders } from "@/lib/providers";
import { ProviderNotConfiguredError } from "@/lib/providers/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEnv } from "@/lib/validation/env";
import { discoveryRequestSchema } from "@/lib/validation/discovery";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit("prospect-discovery", 6, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = discoveryRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const env = getEnv();
  const providers = createProviders();
  const providerMode = env.GOOGLE_PLACES_API_KEY ? "live" : "free";
  const providerName = env.GOOGLE_PLACES_API_KEY
    ? "Google Places"
    : "OpenStreetMap Overpass";

  try {
    const result = await providers.businessSearch.search(parsed.data);

    return NextResponse.json({
      ok: true,
      providerMode,
      providerName,
      prospects: result.data,
      logs: result.logs,
      cost: result.cost,
    });
  } catch (error) {
    const status = error instanceof ProviderNotConfiguredError ? 501 : 502;
    return NextResponse.json(
      {
        ok: false,
        providerMode,
        providerName,
        error:
          error instanceof Error
            ? error.message
            : "Prospect discovery failed.",
      },
      { status },
    );
  }
}
