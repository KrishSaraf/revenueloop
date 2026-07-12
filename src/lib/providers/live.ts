import type {
  BusinessResearchProvider,
  BusinessSearchProvider,
  BusinessSearchInput,
  ContentGenerationProvider,
  PaymentProvider,
  ProviderResult,
  VoiceCallProvider,
  WebsiteGenerationProvider,
} from "@/lib/providers/types";
import type {
  BusinessResearch,
  Call,
  CallTranscriptEntry,
  GeneratedWebsite,
  Offer,
  Payment,
  Prospect,
  SalesStrategy,
} from "@/lib/types";
import { ProviderNotConfiguredError } from "@/lib/providers/types";
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

interface GoogleTextSearchResponse {
  status: string;
  error_message?: string;
  results?: Array<{
    place_id?: string;
    name?: string;
    formatted_address?: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
    business_status?: string;
  }>;
}

interface GooglePlaceDetailsResponse {
  status: string;
  error_message?: string;
  result?: {
    place_id?: string;
    name?: string;
    formatted_address?: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    url?: string;
    rating?: number;
    user_ratings_total?: number;
    types?: string[];
    business_status?: string;
  };
}

function normalizeCategory(inputCategory: string, types: string[] = []) {
  if (inputCategory !== "Any") {
    return inputCategory;
  }

  const firstUsefulType = types.find(
    (type) => !["point_of_interest", "establishment"].includes(type),
  );

  return firstUsefulType
    ? firstUsefulType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Local business";
}

function createProspectFromPlace(input: {
  details: NonNullable<GooglePlaceDetailsResponse["result"]>;
  requestedCategory: string;
  location: string;
  websiteProbe: WebsiteProbeResult;
  existingSlugs: string[];
}): Prospect {
  const { details, requestedCategory, location, websiteProbe, existingSlugs } = input;
  const name = details.name ?? "Unnamed business";
  const category = normalizeCategory(requestedCategory, details.types);
  const placeId = details.place_id ?? crypto.randomUUID();
  const slug = createSlug(name, existingSlugs);
  const phone =
    details.formatted_phone_number ??
    details.international_phone_number ??
    "Unavailable";
  const rating = details.rating ?? 0;
  const reviewCount = details.user_ratings_total ?? 0;
  const estimatedDealValue = estimateDealValue(category);
  const onlineBookingValue = bookingValueFor(category);
  const createdAt = nowIso();

  const prospect: Prospect = {
    id: `google-${placeId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    slug,
    name,
    category,
    location,
    address: details.formatted_address ?? location,
    phone,
    rating,
    reviewCount,
    websiteStatus: websiteProbe.status,
    socialPresence: [],
    opportunityScore: 0,
    estimatedDealValue,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary: `${name} is a ${category.toLowerCase()} in ${location}. RevenueLoop found public listing data and checked the owned-website signal.`,
    whyGoodProspect:
      websiteProbe.status === "no_website"
        ? "Google Places did not return an official website, so an owned preview site could fill a clear discovery gap."
        : "The business has a website signal, but the homepage appears weak enough to justify a better conversion-focused preview.",
    onlineBookingValue,
    publicInfo: [
      `Google Places place ID: ${placeId}`,
      `${rating.toFixed(1)} rating across ${reviewCount} reviews.`,
      details.website
        ? `Official website from Google Places: ${details.website}`
        : "No official website returned by Google Places.",
      ...websiteProbe.evidence.map((item) => `Website probe: ${item}`),
    ],
    inferredInfo: [
      "Opportunity score is inferred from public listing strength, website gap and category fit.",
      "Social media presence is not checked by the first real prospect finder agent yet.",
    ],
    currentWebsiteUrl: details.website,
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

export class GooglePlacesBusinessSearchProvider implements BusinessSearchProvider {
  constructor(
    private readonly apiKey = process.env.GOOGLE_PLACES_API_KEY,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly websiteProbe = (url?: string) =>
      probeWebsiteStatus(url, fetchImpl),
  ) {}

  async search(input: BusinessSearchInput): Promise<ProviderResult<Prospect[]>> {
    if (!this.apiKey) {
      throw new ProviderNotConfiguredError("Google Places");
    }

    const query = `${input.category === "Any" ? "local businesses" : input.category} in ${input.location || "Singapore"}`;
    const searchUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
    );
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("region", "sg");
    searchUrl.searchParams.set("key", this.apiKey);

    const search = await this.fetchJson<GoogleTextSearchResponse>(searchUrl);

    if (search.status === "ZERO_RESULTS") {
      return {
        data: [],
        cost: 0,
        logs: [`Google Places returned zero results for "${query}".`],
      };
    }

    if (search.status !== "OK") {
      throw new Error(
        `Google Places search failed: ${search.error_message ?? search.status}`,
      );
    }

    const prospects: Prospect[] = [];
    const existingSlugs: string[] = [];
    const candidates = (search.results ?? [])
      .filter((result) => result.place_id && result.business_status !== "CLOSED_PERMANENTLY")
      .slice(0, Math.min(30, Math.max(input.maxProspects * 3, input.maxProspects)));

    for (const candidate of candidates) {
      if (!candidate.place_id || prospects.length >= input.maxProspects) {
        continue;
      }

      const details = await this.fetchPlaceDetails(candidate.place_id);
      if (!details || details.business_status === "CLOSED_PERMANENTLY") {
        continue;
      }

      const rating = details.rating ?? candidate.rating ?? 0;
      const reviewCount =
        details.user_ratings_total ?? candidate.user_ratings_total ?? 0;
      if (rating < input.minimumRating) {
        continue;
      }

      const websiteProbe = await this.websiteProbe(details.website);
      if (!websiteStatusMatches(input.websiteStatus, websiteProbe.status)) {
        continue;
      }

      const prospect = createProspectFromPlace({
        details: {
          ...candidate,
          ...details,
          rating,
          user_ratings_total: reviewCount,
        },
        requestedCategory: input.category,
        location: input.location || "Singapore",
        websiteProbe,
        existingSlugs,
      });
      existingSlugs.push(prospect.slug);
      prospects.push(prospect);
    }

    return {
      data: prospects,
      cost: 0,
      logs: [
        `Google Places Text Search query: "${query}".`,
        `Checked ${candidates.length} candidates and returned ${prospects.length} prospects with no or weak owned-site signals.`,
        "Homepage checker requests only the official website URL returned by Google Places; it does not crawl sites.",
      ],
    };
  }

  private async fetchPlaceDetails(placeId: string) {
    const detailsUrl = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    );
    detailsUrl.searchParams.set("place_id", placeId);
    detailsUrl.searchParams.set(
      "fields",
      [
        "place_id",
        "name",
        "formatted_address",
        "formatted_phone_number",
        "international_phone_number",
        "website",
        "url",
        "rating",
        "user_ratings_total",
        "types",
        "business_status",
      ].join(","),
    );
    detailsUrl.searchParams.set("key", this.apiKey ?? "");

    const details = await this.fetchJson<GooglePlaceDetailsResponse>(detailsUrl);

    if (details.status !== "OK") {
      return undefined;
    }

    return details.result;
  }

  private async fetchJson<T>(url: URL): Promise<T> {
    const response = await this.fetchImpl(url, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places HTTP ${response.status}.`);
    }

    return (await response.json()) as T;
  }
}

export class OpenAIBusinessResearchProvider implements BusinessResearchProvider {
  async research(_prospect: Prospect): Promise<ProviderResult<BusinessResearch>> {
    void _prospect;
    throw new ProviderNotConfiguredError("OpenAI research");
  }
}

export class OpenAIContentGenerationProvider implements ContentGenerationProvider {
  async createSalesStrategy(
    _prospect: Prospect,
    _research: BusinessResearch,
  ): Promise<ProviderResult<SalesStrategy>> {
    void _prospect;
    void _research;
    throw new ProviderNotConfiguredError("OpenAI content generation");
  }
}

export class TemplateWebsiteGenerationProvider implements WebsiteGenerationProvider {
  async generateWebsite(
    _prospect: Prospect,
    _research: BusinessResearch,
  ): Promise<ProviderResult<GeneratedWebsite>> {
    void _prospect;
    void _research;
    throw new ProviderNotConfiguredError("Website generation");
  }
}

export class ElevenLabsVoiceCallProvider implements VoiceCallProvider {
  async startCall(
    _prospect: Prospect,
    _strategy: SalesStrategy,
  ): Promise<ProviderResult<{ call: Call; transcript: CallTranscriptEntry[] }>> {
    void _prospect;
    void _strategy;
    throw new ProviderNotConfiguredError("ElevenLabs Conversational AI");
  }
}

export class StripePaymentProvider implements PaymentProvider {
  async createCheckout(
    _prospect: Prospect,
    _offer: Offer,
  ): Promise<ProviderResult<Payment>> {
    void _prospect;
    void _offer;
    throw new ProviderNotConfiguredError("Stripe Checkout");
  }
}
