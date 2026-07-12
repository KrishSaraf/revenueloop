import { describe, expect, it } from "vitest";
import { calculateOpportunityScore } from "@/lib/scoring";

describe("opportunity scoring", () => {
  it("prioritizes strong businesses with no website", () => {
    const result = calculateOpportunityScore({
      websiteStatus: "no_website",
      rating: 4.8,
      reviewCount: 80,
      hasPhone: true,
      hasAddress: true,
      socialPresenceCount: 1,
      onlineBookingValuable: true,
      category: "Salon",
    });

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.factors).toHaveLength(5);
  });

  it("keeps healthy websites lower priority", () => {
    const result = calculateOpportunityScore({
      websiteStatus: "healthy_website",
      rating: 4.8,
      reviewCount: 80,
      hasPhone: true,
      hasAddress: true,
      socialPresenceCount: 3,
      onlineBookingValuable: true,
      category: "Salon",
    });

    expect(result.score).toBeLessThan(75);
  });
});
