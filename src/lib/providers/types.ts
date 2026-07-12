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

export interface ProviderResult<T> {
  data: T;
  cost: number;
  logs: string[];
}

export interface BusinessSearchInput {
  location: string;
  category: string;
  maxProspects: number;
  minimumRating: number;
  websiteStatus: "no_website" | "weak_website" | "either";
  query?: string;
  replace?: boolean;
}

export interface BusinessSearchProvider {
  search(input: BusinessSearchInput): Promise<ProviderResult<Prospect[]>>;
}

export interface BusinessResearchProvider {
  research(prospect: Prospect): Promise<ProviderResult<BusinessResearch>>;
}

export interface ContentGenerationProvider {
  createSalesStrategy(
    prospect: Prospect,
    research: BusinessResearch,
  ): Promise<ProviderResult<SalesStrategy>>;
}

export interface WebsiteGenerationProvider {
  generateWebsite(
    prospect: Prospect,
    research: BusinessResearch,
  ): Promise<ProviderResult<GeneratedWebsite>>;
}

export interface VoiceCallProvider {
  startCall(
    prospect: Prospect,
    strategy: SalesStrategy,
  ): Promise<ProviderResult<{ call: Call; transcript: CallTranscriptEntry[] }>>;
}

export interface PaymentProvider {
  createCheckout(
    prospect: Prospect,
    offer: Offer,
  ): Promise<ProviderResult<Payment>>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} is not configured. VentureMint is using the built-in adapter.`);
    this.name = "ProviderNotConfiguredError";
  }
}
