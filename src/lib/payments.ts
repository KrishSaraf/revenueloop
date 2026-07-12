import { z } from "zod";

export const checkoutRequestSchema = z.object({
  prospectId: z.string().min(1),
  offerId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.literal("SGD"),
});

export const stripeWebhookSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({
    object: z.record(z.string(), z.unknown()),
  }),
});

export function validateStripeWebhookPayload(payload: unknown) {
  return stripeWebhookSchema.safeParse(payload);
}
