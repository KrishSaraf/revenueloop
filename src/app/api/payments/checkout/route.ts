import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { checkoutRequestSchema } from "@/lib/payments";
import { getEnv } from "@/lib/validation/env";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit("checkout");
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const env = getEnv();

  if (env.mode === "mock" || !env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      ok: true,
      mode: "mock",
      checkoutUrl: `/mock-checkout/${parsed.data.offerId}`,
      message: "Mock checkout link created. No card data is stored.",
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?payment=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?payment=cancelled`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: parsed.data.currency.toLowerCase(),
          unit_amount: Math.round(parsed.data.amount * 100),
          product_data: {
            name: "RevenueLoop Launch Site Sprint",
          },
        },
      },
    ],
    metadata: {
      prospectId: parsed.data.prospectId,
      offerId: parsed.data.offerId,
    },
  });

  return NextResponse.json({
    ok: true,
    mode: "live",
    checkoutUrl: session.url,
    sessionId: session.id,
  });
}
