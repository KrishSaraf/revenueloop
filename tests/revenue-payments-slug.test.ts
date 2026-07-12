import { describe, expect, it } from "vitest";
import { validateStripeWebhookPayload } from "@/lib/payments";
import { calculateMetrics } from "@/lib/revenue";
import { createInitialState } from "@/lib/seed";
import { createSlug } from "@/lib/slug";

describe("payments, revenue and slugs", () => {
  it("validates mock Stripe webhook payloads", () => {
    const result = validateStripeWebhookPayload({
      id: "evt_123",
      type: "checkout.session.completed",
      data: { object: { id: "cs_123" } },
    });

    expect(result.success).toBe(true);
  });

  it("calculates revenue, cost, profit and conversion", () => {
    const state = createInitialState();
    state.calls = [
      {
        id: "call-1",
        prospectId: "prospect-orchard-bloom",
        status: "Completed",
        durationSeconds: 60,
        sentiment: "positive",
        detectedObjections: [],
        priceDiscussed: 399,
        nextAction: "Pay",
        simulation: true,
      },
    ];
    state.payments = [
      {
        id: "payment-1",
        prospectId: "prospect-orchard-bloom",
        offerId: "offer-1",
        amount: 399,
        currency: "SGD",
        checkoutUrl: "/mock",
        status: "Paid",
        provider: "mock",
        createdAt: new Date().toISOString(),
      },
    ];
    state.costs = [
      {
        id: "cost-1",
        provider: "OpenAI",
        action: "Generate",
        amount: 1.5,
        createdAt: new Date().toISOString(),
      },
    ];

    const metrics = calculateMetrics(state);

    expect(metrics.revenue).toBe(399);
    expect(metrics.netProfit).toBe(397.5);
    expect(metrics.conversionRate).toBe(100);
  });

  it("deduplicates generated site slugs", () => {
    const slug = createSlug("Orchard Bloom Salon Demo", [
      "orchard-bloom-salon-demo",
    ]);

    expect(slug).toMatch(/^orchard-bloom-salon-demo-/);
  });
});
