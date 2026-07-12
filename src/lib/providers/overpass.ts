import type {
  BusinessSearchInput,
  BusinessSearchProvider,
  ProviderResult,
} from "@/lib/providers/types";
import type { Prospect } from "@/lib/types";
import { createSlug } from "@/lib/slug";
import { scoreProspect } from "@/lib/scoring";
import { nowIso } from "@/lib/utils";
import {
  bookingValueFor,
  estimateDealValue,
  websiteStatusMatches,
} from "@/lib/providers/shared";
import {
  probeWebsiteStatus,
  type WebsiteProbeResult,
} from "@/lib/prospects/website-status";

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
  remark?: string;
}

const singaporeBBox = "1.1304,103.6020,1.4707,104.0120";
const defaultOverpassEndpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const categorySelectors: Record<string, string[]> = {
  salon: [
    '["shop"="hairdresser"]',
    '["shop"="beauty"]',
    '["amenity"="beauty_salon"]',
  ],
  cafe: ['["amenity"="cafe"]', '["shop"="coffee"]', '["shop"="bakery"]'],
  "bicycle repair shop": [
    '["shop"="bicycle"]',
    '["service:bicycle:repair"="yes"]',
    '["name"~"bicycle|bike|cycle",i]',
  ],
  "tuition centre": [
    '["amenity"="school"]',
    '["amenity"="language_school"]',
    '["office"="educational_institution"]',
    '["name"~"tuition|learning|academy|education|tutor",i]',
  ],
  "independent wellness studio": [
    '["leisure"="fitness_centre"]',
    '["leisure"="sports_centre"]',
    '["shop"="massage"]',
    '["amenity"="spa"]',
    '["sport"="yoga"]',
    '["name"~"wellness|yoga|pilates|studio|therapy",i]',
  ],
  any: [
    '["shop"]["name"]',
    '["amenity"]["name"]',
    '["office"]["name"]',
    '["craft"]["name"]',
  ],
};

function selectorsFor(category: string) {
  return (
    categorySelectors[category.toLowerCase()] ??
    categorySelectors.any
  );
}

function requireNamedSelector(selector: string) {
  return selector.includes('["name"') ? selector : `${selector}["name"]`;
}

function buildOverpassQuery(input: BusinessSearchInput) {
  const selectors = selectorsFor(input.category);
  const limit = Math.min(Math.max(input.maxProspects * 3, 12), 40);
  const elementQueries = selectors
    .map((selector) => `nwr${requireNamedSelector(selector)}(${singaporeBBox});`)
    .join("\n");

  return `
    [out:json][timeout:15];
    (
      ${elementQueries}
    );
    out center tags ${limit};
  `;
}

function classifyCategory(inputCategory: string, tags: Record<string, string>) {
  if (inputCategory !== "Any") {
    return inputCategory;
  }

  if (tags.shop === "hairdresser" || tags.shop === "beauty") return "Salon";
  if (tags.amenity === "cafe" || tags.shop === "coffee") return "Cafe";
  if (tags.shop === "bicycle") return "Bicycle repair shop";
  if (/school|education|tuition|academy|tutor/i.test(tags.amenity ?? tags.name ?? "")) {
    return "Tuition centre";
  }
  if (/wellness|yoga|pilates|massage|fitness|spa/i.test(
    `${tags.name ?? ""} ${tags.shop ?? ""} ${tags.leisure ?? ""} ${tags.amenity ?? ""}`,
  )) {
    return "Independent wellness studio";
  }

  return tags.shop ?? tags.amenity ?? tags.office ?? "Local business";
}

function getWebsite(tags: Record<string, string>) {
  return tags.website ?? tags["contact:website"] ?? tags.url;
}

function getPhone(tags: Record<string, string>) {
  return (
    tags.phone ??
    tags["contact:phone"] ??
    tags.mobile ??
    tags["contact:mobile"] ??
    "Unavailable"
  );
}

function getAddress(tags: Record<string, string>, element: OverpassElement) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:unit"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat && lon) {
    return `OSM coordinates ${lat.toFixed(5)}, ${lon.toFixed(5)}, Singapore`;
  }

  return "Singapore";
}

function createProspectFromOsm(input: {
  element: OverpassElement;
  requestedCategory: string;
  websiteProbe: WebsiteProbeResult;
  existingSlugs: string[];
}): Prospect | undefined {
  const { element, requestedCategory, websiteProbe, existingSlugs } = input;
  const tags = element.tags ?? {};
  const name = tags.name?.trim();

  if (!name) {
    return undefined;
  }

  const category = classifyCategory(requestedCategory, tags);
  const slug = createSlug(name, existingSlugs);
  const createdAt = nowIso();
  const website = getWebsite(tags);
  const estimatedDealValue = estimateDealValue(category);
  const onlineBookingValue = bookingValueFor(category);
  const osmId = `${element.type}/${element.id}`;

  const prospect: Prospect = {
    id: `osm-${element.type}-${element.id}`,
    slug,
    name,
    category,
    location: "Singapore",
    address: getAddress(tags, element),
    phone: getPhone(tags),
    rating: 0,
    reviewCount: 0,
    websiteStatus: websiteProbe.status,
    socialPresence: [],
    opportunityScore: 0,
    estimatedDealValue,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary: `${name} is listed on OpenStreetMap as a ${category.toLowerCase()} in Singapore. RevenueLoop found public OSM data and checked the owned-website signal.`,
    whyGoodProspect:
      websiteProbe.status === "no_website"
        ? "OpenStreetMap has no website tag for this business, so an owned preview site could fill a discovery gap."
        : "OpenStreetMap has a website tag, but the homepage probe found weak-site signals worth improving.",
    onlineBookingValue,
    publicInfo: [
      `OpenStreetMap element: ${osmId}`,
      "Ratings and review counts are unavailable from OpenStreetMap and are not invented.",
      website
        ? `Website tag from OpenStreetMap: ${website}`
        : "No website tag found in OpenStreetMap.",
      ...Object.entries(tags)
        .filter(([key]) =>
          [
            "shop",
            "amenity",
            "office",
            "craft",
            "leisure",
            "sport",
            "opening_hours",
            "phone",
            "contact:phone",
          ].includes(key),
        )
        .slice(0, 8)
        .map(([key, value]) => `OSM tag ${key}: ${value}`),
      ...websiteProbe.evidence.map((item) => `Website probe: ${item}`),
    ],
    inferredInfo: [
      "Opportunity score is inferred without ratings because the free OSM provider does not include review data.",
      "OSM coverage depends on volunteer-contributed business tags, so leads should be manually verified before outreach.",
    ],
    currentWebsiteUrl: website,
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  };

  const scored = scoreProspect(prospect);
  return {
    ...prospect,
    opportunityScore: scored.score,
  };
}

export class OverpassBusinessSearchProvider implements BusinessSearchProvider {
  private readonly endpoints: string[];

  constructor(
    endpoint: string | string[] = defaultOverpassEndpoints,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly websiteProbe = (url?: string) =>
      probeWebsiteStatus(url, fetchImpl),
  ) {
    this.endpoints = Array.isArray(endpoint) ? endpoint : [endpoint];
  }

  async search(input: BusinessSearchInput): Promise<ProviderResult<Prospect[]>> {
    const query = buildOverpassQuery(input);
    const { payload, endpoint, errors } = await this.fetchOverpass(query);
    if (payload.remark) {
      throw new Error(`OpenStreetMap Overpass error: ${payload.remark}`);
    }

    const elements = (payload.elements ?? []).filter(
      (element) => element.tags?.name,
    );
    const prospects: Prospect[] = [];
    const existingSlugs: string[] = [];
    const seenNames = new Set<string>();

    for (const element of elements) {
      if (prospects.length >= input.maxProspects) {
        break;
      }

      const tags = element.tags ?? {};
      const nameKey = `${tags.name?.toLowerCase()}-${getAddress(tags, element).toLowerCase()}`;
      if (seenNames.has(nameKey)) {
        continue;
      }
      seenNames.add(nameKey);

      const website = getWebsite(tags);
      if (input.websiteStatus === "no_website" && website) {
        continue;
      }
      if (input.websiteStatus === "weak_website" && !website) {
        continue;
      }

      const websiteProbe = await this.websiteProbe(website);
      if (!websiteStatusMatches(input.websiteStatus, websiteProbe.status)) {
        continue;
      }

      const prospect = createProspectFromOsm({
        element,
        requestedCategory: input.category,
        websiteProbe,
        existingSlugs,
      });
      if (!prospect) {
        continue;
      }

      existingSlugs.push(prospect.slug);
      prospects.push(prospect);
    }

    return {
      data: prospects,
      cost: 0,
      logs: [
        "OpenStreetMap Overpass free provider used. No API key or billing required.",
        `Overpass endpoint: ${endpoint}.`,
        `Queried Singapore OSM tags for ${input.category}.`,
        `Checked ${elements.length} OSM elements and returned ${prospects.length} prospects with no or weak owned-site signals.`,
        errors.length > 0
          ? `Fallback endpoints were used after: ${errors.join(" | ")}.`
          : "Primary Overpass endpoint responded successfully.",
        "Rating filter is skipped because OpenStreetMap does not provide ratings or review counts.",
      ],
    };
  }

  private async fetchOverpass(query: string) {
    const errors: string[] = [];

    for (const endpoint of this.endpoints) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18_000);

      try {
        const response = await this.fetchImpl(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            accept: "application/json",
            "user-agent":
              "RevenueLoop/0.1 free-prospect-finder (OpenStreetMap Overpass)",
          },
          body: new URLSearchParams({ data: query }),
        });

        if (!response.ok) {
          errors.push(`${endpoint} returned HTTP ${response.status}`);
          continue;
        }

        return {
          payload: (await response.json()) as OverpassResponse,
          endpoint,
          errors,
        };
      } catch (error) {
        errors.push(
          `${endpoint} ${
            error instanceof Error && error.name === "AbortError"
              ? "timed out"
              : "failed"
          }`,
        );
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error(
      `OpenStreetMap Overpass is temporarily unavailable. ${errors.join(" | ")}`,
    );
  }
}
