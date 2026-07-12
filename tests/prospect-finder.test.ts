import { describe, expect, it } from "vitest";
import { GooglePlacesBusinessSearchProvider } from "@/lib/providers/live";
import { OverpassBusinessSearchProvider } from "@/lib/providers/overpass";
import {
  classifyWebsiteHtml,
  type WebsiteProbeResult,
} from "@/lib/prospects/website-status";

describe("website status classifier", () => {
  it("marks sparse placeholder pages as weak websites", () => {
    const result = classifyWebsiteHtml(
      "https://example.com",
      "<html><head><title>Coming Soon</title></head><body>Under construction</body></html>",
    );

    expect(result.status).toBe("weak_website");
    expect(result.evidence.join(" ")).toMatch(/placeholder|little readable/i);
  });

  it("marks structured mobile pages as healthy", () => {
    const html = `
      <html>
        <head>
          <title>Good Salon Singapore</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <h1>Good Salon Singapore</h1>
          <p>${"Professional hair services, booking, location, contact and opening hours. ".repeat(30)}</p>
        </body>
      </html>
    `;

    expect(classifyWebsiteHtml("https://goodsalon.sg", html).status).toBe(
      "healthy_website",
    );
  });
});

describe("Google Places prospect finder", () => {
  it("maps Google Places results into scored prospects", async () => {
    const fetchImpl = async (input: string | URL | Request) => {
      const url = input.toString();

      if (url.includes("textsearch")) {
        return new Response(
          JSON.stringify({
            status: "OK",
            results: [
              {
                place_id: "abc123",
                name: "Real Test Salon",
                formatted_address: "Orchard Road, Singapore",
                rating: 4.7,
                user_ratings_total: 81,
                types: ["beauty_salon", "establishment"],
              },
            ],
          }),
        );
      }

      return new Response(
        JSON.stringify({
          status: "OK",
          result: {
            place_id: "abc123",
            name: "Real Test Salon",
            formatted_address: "Orchard Road, Singapore",
            formatted_phone_number: "+65 6000 9999",
            rating: 4.7,
            user_ratings_total: 81,
            types: ["beauty_salon", "establishment"],
          },
        }),
      );
    };

    const probe = async (): Promise<WebsiteProbeResult> => ({
      status: "no_website",
      reachable: false,
      evidence: ["No website returned by Google Places."],
    });

    const provider = new GooglePlacesBusinessSearchProvider(
      "test-key",
      fetchImpl,
      probe,
    );
    const result = await provider.search({
      location: "Singapore",
      category: "Salon",
      maxProspects: 5,
      minimumRating: 4.2,
      websiteStatus: "either",
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Real Test Salon");
    expect(result.data[0].websiteStatus).toBe("no_website");
    expect(result.data[0].opportunityScore).toBeGreaterThan(80);
  });
});

describe("OpenStreetMap Overpass prospect finder", () => {
  it("maps free OSM elements into prospects without ratings", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          elements: [
            {
              type: "node",
              id: 123,
              lat: 1.304,
              lon: 103.831,
              tags: {
                name: "Free Test Salon",
                shop: "hairdresser",
                phone: "+65 6000 1111",
              },
            },
          ],
        }),
      );
    const probe = async (): Promise<WebsiteProbeResult> => ({
      status: "no_website",
      reachable: false,
      evidence: ["No website tag found in OpenStreetMap."],
    });
    const provider = new OverpassBusinessSearchProvider(
      "https://overpass.test/api/interpreter",
      fetchImpl,
      probe,
    );

    const result = await provider.search({
      location: "Singapore",
      category: "Salon",
      maxProspects: 5,
      minimumRating: 4.2,
      websiteStatus: "either",
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Free Test Salon");
    expect(result.data[0].rating).toBe(0);
    expect(result.logs.join(" ")).toContain("No API key or billing required");
  });

  it("retries another free endpoint when the first Overpass endpoint times out", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls += 1;
      if (calls === 1) {
        return new Response("Gateway Timeout", { status: 504 });
      }

      return new Response(
        JSON.stringify({
          elements: [
            {
              type: "node",
              id: 456,
              lat: 1.304,
              lon: 103.831,
              tags: {
                name: "Retry Test Salon",
                shop: "hairdresser",
              },
            },
          ],
        }),
      );
    };
    const probe = async (): Promise<WebsiteProbeResult> => ({
      status: "no_website",
      reachable: false,
      evidence: ["No website tag found in OpenStreetMap."],
    });
    const provider = new OverpassBusinessSearchProvider(
      [
        "https://overpass-one.test/api/interpreter",
        "https://overpass-two.test/api/interpreter",
      ],
      fetchImpl,
      probe,
    );

    const result = await provider.search({
      location: "Singapore",
      category: "Salon",
      maxProspects: 1,
      minimumRating: 4.2,
      websiteStatus: "either",
    });

    expect(calls).toBe(2);
    expect(result.data[0].name).toBe("Retry Test Salon");
    expect(result.logs.join(" ")).toContain("Fallback endpoints were used");
  });
});
