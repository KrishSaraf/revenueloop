import {
  createResearchForProspect,
  createSalesStrategyForProspect,
  createWebsiteForProspect,
  seededProspects,
} from "@/lib/seed";
import type {
  BusinessResearch,
  Call,
  CallTranscriptEntry,
  Offer,
  Payment,
  Prospect,
} from "@/lib/types";
import type {
  BusinessResearchProvider,
  BusinessSearchInput,
  BusinessSearchProvider,
  ContentGenerationProvider,
  PaymentProvider,
  ProviderResult,
  VoiceCallProvider,
  WebsiteGenerationProvider,
} from "@/lib/providers/types";

function providerResult<T>(data: T, cost: number, logs: string[]): ProviderResult<T> {
  return { data, cost, logs };
}

export class MockBusinessSearchProvider implements BusinessSearchProvider {
  async search(input: BusinessSearchInput) {
    const data = seededProspects
      .filter((prospect) => {
        const categoryMatches =
          input.category === "Any" ||
          prospect.category.toLowerCase().includes(input.category.toLowerCase());
        const locationMatches =
          input.location.trim().length === 0 ||
          prospect.location.toLowerCase().includes(input.location.toLowerCase()) ||
          prospect.address.toLowerCase().includes(input.location.toLowerCase());
        const ratingMatches = prospect.rating >= input.minimumRating;
        const websiteMatches =
          input.websiteStatus === "either" ||
          prospect.websiteStatus === input.websiteStatus;

        return categoryMatches && locationMatches && ratingMatches && websiteMatches;
      })
      .slice(0, input.maxProspects);

    return providerResult(data, 0.04, [
      "Mock Places search returned seeded Singapore SMBs.",
      "No real businesses were contacted or scraped.",
    ]);
  }
}

export class MockBusinessResearchProvider implements BusinessResearchProvider {
  async research(prospect: Prospect) {
    return providerResult(createResearchForProspect(prospect), 0.08, [
      "Mock research summarised public listing fields.",
    ]);
  }
}

export class MockContentGenerationProvider implements ContentGenerationProvider {
  async createSalesStrategy(prospect: Prospect) {
    return providerResult(createSalesStrategyForProspect(prospect), 0.11, [
      "Mock OpenAI strategy generated from structured prospect facts.",
    ]);
  }
}

export class MockWebsiteGenerationProvider implements WebsiteGenerationProvider {
  async generateWebsite(prospect: Prospect, _research?: BusinessResearch) {
    void _research;
    return providerResult(createWebsiteForProspect(prospect), 0.18, [
      "Mock website generated with placeholders for unverifiable details.",
    ]);
  }
}

export class MockVoiceCallProvider implements VoiceCallProvider {
  async startCall(prospect: Prospect) {
    const call: Call = {
      id: `call-${prospect.id}`,
      prospectId: prospect.id,
      status: "Completed",
      durationSeconds: 138,
      sentiment: "positive",
      detectedObjections: ["Wants to know monthly cost", "Needs owner approval"],
      priceDiscussed: prospect.estimatedDealValue,
      nextAction: "Send checkout link and preview URL.",
      outcome: "Owner interested in activating the preview site this week.",
      simulation: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    const timestamp = new Date().toISOString();
    const transcript: CallTranscriptEntry[] = [
      {
        id: `${call.id}-1`,
        callId: call.id,
        speaker: "system",
        text: "Simulation. No real outbound call was placed.",
        timestamp,
      },
      {
        id: `${call.id}-2`,
        callId: call.id,
        speaker: "ai",
        text: `Hi, this is RevenueLoop's AI assistant. I prepared a private website preview for ${prospect.name}. Is now an okay time for a quick explanation?`,
        timestamp,
        sentiment: "neutral",
      },
      {
        id: `${call.id}-3`,
        callId: call.id,
        speaker: "owner",
        text: "A preview website? We do not have one right now. What exactly did you build?",
        timestamp,
        sentiment: "positive",
      },
      {
        id: `${call.id}-4`,
        callId: call.id,
        speaker: "ai",
        text: "A mobile page with your services, location, review signals and a WhatsApp enquiry button. It only uses public information and placeholders that you approve.",
        timestamp,
        sentiment: "positive",
      },
      {
        id: `${call.id}-5`,
        callId: call.id,
        speaker: "owner",
        text: "Send it over. If the price is reasonable we can try it.",
        timestamp,
        sentiment: "positive",
      },
    ];

    return providerResult({ call, transcript }, 0.42, [
      "Mock ElevenLabs conversation completed.",
      "AI identified itself and labelled the transcript as simulation.",
    ]);
  }
}

export class MockPaymentProvider implements PaymentProvider {
  async createCheckout(prospect: Prospect, offer: Offer) {
    const payment: Payment = {
      id: `payment-${prospect.id}`,
      prospectId: prospect.id,
      offerId: offer.id,
      amount: offer.setupAmount,
      currency: "SGD",
      checkoutUrl: `/mock-checkout/${offer.id}`,
      status: "Paid",
      provider: "mock",
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };

    return providerResult(payment, 0.06, [
      "Mock Stripe checkout generated and paid.",
      "No card data is stored by RevenueLoop.",
    ]);
  }
}

export function createMockProviders() {
  return {
    businessSearch: new MockBusinessSearchProvider(),
    research: new MockBusinessResearchProvider(),
    content: new MockContentGenerationProvider(),
    website: new MockWebsiteGenerationProvider(),
    voice: new MockVoiceCallProvider(),
    payment: new MockPaymentProvider(),
  };
}
