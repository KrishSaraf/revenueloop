import { getEnv } from "@/lib/validation/env";
import { createMockProviders } from "@/lib/providers/mock";
import {
  ElevenLabsVoiceCallProvider,
  GooglePlacesBusinessSearchProvider,
  OpenAIBusinessResearchProvider,
  OpenAIContentGenerationProvider,
  StripePaymentProvider,
  TemplateWebsiteGenerationProvider,
} from "@/lib/providers/live";
import { OverpassBusinessSearchProvider } from "@/lib/providers/overpass";

export function createProviders() {
  const env = getEnv();
  const mockProviders = createMockProviders();

  return {
    businessSearch: env.GOOGLE_PLACES_API_KEY
      ? new GooglePlacesBusinessSearchProvider(env.GOOGLE_PLACES_API_KEY)
      : new OverpassBusinessSearchProvider(),
    research: env.OPENAI_API_KEY
      ? new OpenAIBusinessResearchProvider()
      : mockProviders.research,
    content: env.OPENAI_API_KEY
      ? new OpenAIContentGenerationProvider()
      : mockProviders.content,
    website: env.OPENAI_API_KEY
      ? new TemplateWebsiteGenerationProvider()
      : mockProviders.website,
    voice:
      env.ELEVENLABS_API_KEY && env.ELEVENLABS_AGENT_ID
        ? new ElevenLabsVoiceCallProvider()
        : mockProviders.voice,
    payment: env.STRIPE_SECRET_KEY
      ? new StripePaymentProvider()
      : mockProviders.payment,
  };
}
