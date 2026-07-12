import { z } from "zod";

export const discoveryRequestSchema = z.object({
  location: z.string().trim().min(1).max(120).default("Singapore"),
  category: z.string().trim().min(1).max(80).default("Any"),
  maxProspects: z.number().int().min(1).max(20).default(5),
  minimumRating: z.number().min(0).max(5).default(4.2),
  websiteStatus: z.enum(["no_website", "weak_website", "either"]).default("either"),
});

export type DiscoveryRequest = z.infer<typeof discoveryRequestSchema>;
