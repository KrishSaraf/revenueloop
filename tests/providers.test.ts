import { describe, expect, it } from "vitest";
import { createMockProviders } from "@/lib/providers/mock";
import { seededProspects } from "@/lib/seed";

describe("mock providers", () => {
  it("returns seeded prospects without contacting real businesses", async () => {
    const providers = createMockProviders();
    const result = await providers.businessSearch.search({
      location: "Singapore",
      category: "Any",
      maxProspects: 3,
      minimumRating: 4,
      websiteStatus: "either",
    });

    expect(result.data).toHaveLength(3);
    expect(result.data[0]?.id).toBe("prospect-new-nature-spa");
    expect(result.data[0]?.name).toBe("New Nature Spa");
    expect(result.logs.join(" ")).toContain("No real businesses");
  });

  it("creates a generated website with unverifiable info marked missing", async () => {
    const providers = createMockProviders();
    const prospect = seededProspects[0];
    const research = await providers.research.research(prospect);
    const website = await providers.website.generateWebsite(prospect, research.data);

    expect(website.data.sections[0].kind).toBe("hero");
    expect(website.data.missingInfo).toContain("Confirmed opening hours");
  });
});
