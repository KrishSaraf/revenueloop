import type {
  AgentEvent,
  BusinessResearch,
  GeneratedWebsite,
  OpportunityScore,
  Prospect,
  RevenueLoopState,
  SalesStrategy,
  WebsiteSection,
} from "@/lib/types";
import { scoreProspect } from "@/lib/scoring";
import { createSlug } from "@/lib/slug";

const createdAt = "2026-07-12T01:00:00.000Z";

export const seededProspects: Prospect[] = [
  {
    id: "prospect-orchard-bloom",
    slug: "orchard-bloom-salon",
    name: "Orchard Bloom Salon",
    category: "Salon",
    location: "Orchard",
    address: "Mock address near Orchard Road, Singapore",
    phone: "+65 6000 0101",
    rating: 4.7,
    reviewCount: 84,
    websiteStatus: "no_website",
    socialPresence: ["Instagram"],
    opportunityScore: 91,
    estimatedDealValue: 399,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Independent salon with strong review signals and no detected website. A booking-focused website could convert search traffic into WhatsApp enquiries.",
    whyGoodProspect:
      "High rating, many public reviews and a service category where appointment requests are valuable.",
    onlineBookingValue:
      "Appointments, treatment enquiries and stylist availability can be captured through a simple booking CTA.",
    publicInfo: [
      "Category, address, phone, rating and review count are mock public listing data.",
      "Instagram is the only visible social presence in demo mode.",
    ],
    inferredInfo: [
      "Likely loses search traffic to nearby salons with booking pages.",
      "A simple services page and WhatsApp CTA would create measurable value.",
    ],
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "prospect-river-valley-tutors",
    slug: "river-valley-tutors",
    name: "River Valley Tutors",
    category: "Tuition centre",
    location: "River Valley",
    address: "Mock address near River Valley Road, Singapore",
    phone: "+65 6000 0202",
    rating: 4.6,
    reviewCount: 63,
    websiteStatus: "weak_website",
    socialPresence: ["Facebook"],
    opportunityScore: 82,
    estimatedDealValue: 499,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Neighbourhood tuition centre with strong parent reviews but an underdeveloped digital presence.",
    whyGoodProspect:
      "Parents compare tuition centres online, so a clearer programme and enquiry flow could increase leads.",
    onlineBookingValue:
      "Trial-class booking and level-based enquiry forms are likely to improve conversion.",
    publicInfo: [
      "Category, address, phone, rating and review count are mock public listing data.",
      "Facebook is visible but no structured programme pages were detected.",
    ],
    inferredInfo: [
      "Parents likely need details by subject and level before enquiring.",
      "A trial-class CTA would be more effective than a generic contact page.",
    ],
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "prospect-tiong-bahru-cycles",
    slug: "tiong-bahru-cycles",
    name: "Tiong Bahru Cycles",
    category: "Bicycle repair shop",
    location: "Tiong Bahru",
    address: "Mock address near Tiong Bahru Market, Singapore",
    phone: "+65 6000 0303",
    rating: 4.8,
    reviewCount: 41,
    websiteStatus: "no_website",
    socialPresence: [],
    opportunityScore: 87,
    estimatedDealValue: 349,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Highly rated repair shop with no owned web destination. Searchers need repair menu, hours and quick contact.",
    whyGoodProspect:
      "Repair intent is urgent and local, making a mobile landing page especially valuable.",
    onlineBookingValue:
      "Repair slots, tune-up requests and parts enquiries can be routed through WhatsApp.",
    publicInfo: [
      "Category, address, phone, rating and review count are mock public listing data.",
      "No social accounts are visible in demo mode.",
    ],
    inferredInfo: [
      "Mobile search traffic likely converts if hours, location and service types are clear.",
      "A fast quote request could reduce missed calls during busy repair periods.",
    ],
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "prospect-katong-knead",
    slug: "katong-knead-studio",
    name: "Katong Knead Studio",
    category: "Independent wellness studio",
    location: "Katong",
    address: "Mock address near East Coast Road, Singapore",
    phone: "+65 6000 0404",
    rating: 4.5,
    reviewCount: 52,
    websiteStatus: "weak_website",
    socialPresence: ["Instagram", "TikTok"],
    opportunityScore: 74,
    estimatedDealValue: 449,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Wellness studio with good reviews but unclear service packaging and weak booking flow.",
    whyGoodProspect:
      "Service clarity, packages and first-visit instructions can reduce friction for new customers.",
    onlineBookingValue:
      "Appointment enquiries and package questions are valuable online conversion points.",
    publicInfo: [
      "Category, address, phone, rating and review count are mock public listing data.",
      "Social accounts exist, but no strong owned booking page is visible.",
    ],
    inferredInfo: [
      "A service menu and client preparation section could improve trust.",
      "A packaged intro offer could make first contact easier.",
    ],
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "prospect-lavender-kopi",
    slug: "lavender-kopi-bar",
    name: "Lavender Kopi Bar",
    category: "Cafe",
    location: "Lavender",
    address: "Mock address near Lavender MRT, Singapore",
    phone: "+65 6000 0505",
    rating: 4.4,
    reviewCount: 37,
    websiteStatus: "no_website",
    socialPresence: ["Instagram"],
    opportunityScore: 78,
    estimatedDealValue: 299,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Small cafe with good discovery potential and no website for menu, hours or private event enquiries.",
    whyGoodProspect:
      "A menu and map-first mobile page can capture local searchers deciding where to go.",
    onlineBookingValue:
      "Table enquiries, group orders and event requests can be directed to WhatsApp.",
    publicInfo: [
      "Category, address, phone, rating and review count are mock public listing data.",
      "Instagram is visible but no owned menu page is detected.",
    ],
    inferredInfo: [
      "Menu and opening-hours pages would likely reduce abandoned searches.",
      "Corporate snack box enquiries could become a new lead source.",
    ],
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
  },
];

export function createResearchForProspect(prospect: Prospect): BusinessResearch {
  return {
    id: `research-${prospect.id}`,
    prospectId: prospect.id,
    publicSummary: prospect.summary,
    digitalPresenceAnalysis:
      prospect.websiteStatus === "no_website"
        ? "No owned website is visible in mock discovery data. The business depends on listings and social profiles."
        : "A weak website or social-only presence is visible, but the path from discovery to enquiry is not clear.",
    recommendedSections: [
      "Hero with clear category and location",
      "Services or packages",
      "Why customers choose this business",
      "Review highlights from public listings",
      "Location, hours and WhatsApp CTA",
    ],
    evidence: prospect.publicInfo,
    inferred: prospect.inferredInfo,
    confidence: prospect.opportunityScore >= 85 ? 0.89 : 0.76,
    createdAt: new Date().toISOString(),
  };
}

export function createScoreForProspect(prospect: Prospect): OpportunityScore {
  const scored = scoreProspect(prospect);

  return {
    id: `score-${prospect.id}`,
    prospectId: prospect.id,
    score: scored.score,
    factors: scored.factors,
    explanation: scored.explanation,
    createdAt: new Date().toISOString(),
  };
}

export function createWebsiteForProspect(
  prospect: Prospect,
  existingSlugs: string[] = [],
): GeneratedWebsite {
  const slug = createSlug(`${prospect.name} demo`, existingSlugs);
  const sections: WebsiteSection[] = [
    {
      id: `${prospect.id}-hero`,
      kind: "hero",
      title: `${prospect.name}`,
      body: `${prospect.category} in ${prospect.location}. A clean, mobile-first preview built from public listing information and editable placeholders.`,
    },
    {
      id: `${prospect.id}-overview`,
      kind: "overview",
      title: "A clearer path from search to enquiry",
      body: prospect.summary,
    },
    {
      id: `${prospect.id}-services`,
      kind: "services",
      title: "Services",
      body: "Primary service list to confirm: [Service 1], [Service 2], [Service 3]. These placeholders should be edited before publication.",
    },
    {
      id: `${prospect.id}-reasons`,
      kind: "reasons",
      title: "Why choose this business",
      body: `Public signals show a ${prospect.rating.toFixed(1)} rating across ${prospect.reviewCount} reviews. The page highlights location, trust and a faster contact flow without inventing unsupported claims.`,
    },
    {
      id: `${prospect.id}-reviews`,
      kind: "reviews",
      title: "Review signals",
      body: "Review text is not fabricated in demo mode. The live version can quote permitted public review snippets when available.",
    },
    {
      id: `${prospect.id}-location`,
      kind: "location",
      title: "Location and hours",
      body: `${prospect.address}. Opening hours are marked as [confirm hours] until verified by the owner.`,
    },
    {
      id: `${prospect.id}-cta`,
      kind: "cta",
      title: "Ready to enquire?",
      body: `Call ${prospect.phone} or use the WhatsApp booking placeholder once the owner confirms the preferred contact flow.`,
    },
  ];

  return {
    id: `website-${prospect.id}`,
    prospectId: prospect.id,
    slug,
    seoTitle: `${prospect.name} | ${prospect.category} in ${prospect.location}`,
    seoDescription: `${prospect.name} is a ${prospect.category.toLowerCase()} in ${prospect.location}. Preview site generated by RevenueLoop from public information.`,
    theme: {
      accent: "#39ff88",
      style: "emerald",
    },
    sections,
    missingInfo: [
      "Confirmed opening hours",
      "Final service names",
      "Owner-approved photos",
      "Booking link or WhatsApp preference",
    ],
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createSalesStrategyForProspect(
  prospect: Prospect,
): SalesStrategy {
  return {
    id: `strategy-${prospect.id}`,
    prospectId: prospect.id,
    personalizedOpening: `Hi, this is RevenueLoop's AI assistant. I found ${prospect.name} while reviewing ${prospect.location} ${prospect.category.toLowerCase()} businesses and prepared a private website preview for your team to inspect.`,
    identifiedProblem:
      prospect.websiteStatus === "no_website"
        ? "The business appears to rely on listings and social profiles without a dedicated site that can convert searchers."
        : "The current web presence does not clearly guide a new customer from discovery to enquiry.",
    valueProposition:
      "A mobile-first website with services, trust signals, location details and a WhatsApp enquiry CTA can turn existing search demand into measurable leads.",
    packageName: "Launch Site Sprint",
    proposedPrice: prospect.estimatedDealValue,
    monthlyPrice: 79,
    objectionResponses: [
      "If budget is the concern, we can activate the page first and keep edits lightweight for the first month.",
      "If you already use social media, the website acts as the owned destination for search and maps traffic.",
      "If timing is tight, the preview is already drafted and only needs owner-approved details.",
    ],
    negotiationLimits:
      "Do not offer below S$249 setup or S$49/month. Offer a 14-day edit window before discounting.",
    callObjective:
      "Secure permission to send the preview URL and ask whether they want to activate the site this week.",
    conversionProbability: prospect.opportunityScore >= 85 ? 0.62 : 0.44,
    approvalRequired: true,
    createdAt: new Date().toISOString(),
  };
}

export function createInitialEvents(): AgentEvent[] {
  return [
    {
      id: "event-boot",
      timestamp: createdAt,
      title: "RevenueLoop ready",
      status: "complete",
      newState: "DISCOVERING",
      inputSummary: "Demo seed data loaded.",
      outputSummary:
        "Five fictional Singapore businesses are ready for mock-mode prospecting.",
      estimatedCost: 0,
      retryStatus: "not_needed",
    },
  ];
}

export function createInitialState(): RevenueLoopState {
  return {
    prospects: seededProspects.map((prospect) => ({ ...prospect })),
    research: [],
    scores: [],
    websites: [],
    strategies: [],
    calls: [],
    transcripts: [],
    offers: [],
    payments: [],
    runs: [],
    events: createInitialEvents(),
    costs: [],
    settings: {
      mode: "mock",
      discoveryProvider: "mock",
      callingHours: {
        start: "10:00",
        end: "18:00",
        timezone: "Asia/Singapore",
      },
      dataRetentionDays: 30,
      requireHumanApproval: true,
      demoSpeed: 8,
    },
    doNotContactEntries: [],
    selectedProspectId: seededProspects[0]?.id,
    agentStatus: "Idle",
    runningDemo: false,
    lastUpdatedAt: createdAt,
  };
}
