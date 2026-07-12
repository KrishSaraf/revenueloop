import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { validateStripeWebhookPayload } from "@/lib/payments";
import { getEnv } from "@/lib/validation/env";

export async function POST(request: NextRequest) {
  const env = getEnv();
  const rawBody = await request.text();

  if (env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET) {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { ok: false, error: "Missing Stripe signature." },
        { status: 400 },
      );
    }

    try {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );

      return NextResponse.json({
        ok: true,
        mode: "live",
        eventType: event.type,
      });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Webhook validation failed.",
        },
        { status: 400 },
      );
    }
  }

  const parsed = validateStripeWebhookPayload(JSON.parse(rawBody || "{}"));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "mock",
    eventType: parsed.data.type,
  });
}
