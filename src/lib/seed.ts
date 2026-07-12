import type {
  AgentEvent,
  BusinessResearch,
  EvidenceItem,
  GeneratedWebsite,
  OpportunityScore,
  Prospect,
  RevenueLoopState,
  SalesStrategy,
  VerificationCheck,
  WebsiteSection,
} from "@/lib/types";
import { scoreProspect } from "@/lib/scoring";
import { createSlug } from "@/lib/slug";

const createdAt = "2026-07-12T01:00:00.000Z";

interface SeedExtra {
  identifiedGaps: string[];
  monthlyImpactLow: number;
  monthlyImpactHigh: number;
  suggestedMonthlyPrice: number;
  estimatedDeliveryCost: number;
}

function prospect(
  base: Omit<
    Prospect,
    | "approvedForCall"
    | "doNotContact"
    | "createdAt"
    | "updatedAt"
  > &
    Partial<Pick<Prospect, "approvedForCall" | "doNotContact" | "lostReason">> &
    SeedExtra,
): Prospect {
  return {
    approvedForCall: false,
    doNotContact: false,
    createdAt,
    updatedAt: createdAt,
    ...base,
  };
}

export const seededProspects: Prospect[] = [
  // ─── Flagship prospect ───
  prospect({
    id: "prospect-new-nature-spa",
    slug: "new-nature-spa",
    name: "New Nature Spa",
    category: "Massage spa",
    location: "Pandan Gardens",
    address: "415 Pandan Gardens, #01-113 Block 415, Singapore 600415",
    phone: "+65 6262 1006",
    rating: 3.0,
    reviewCount: 2,
    websiteStatus: "no_website",
    socialPresence: [],
    opportunityScore: 79,
    estimatedDealValue: 140,
    status: "Won",
    agentState: "WON",
    summary:
      "Massage spa in Pandan Gardens with a Google listing but no website. Enquiries go through phone calls only — searchers cannot view services, hours or book online.",
    whyGoodProspect:
      "Google Maps lists the business with no website link. A simple owned site with massage services, hours and a call-to-book CTA could capture nearby search traffic.",
    onlineBookingValue:
      "A booking page with treatment menu, opening hours and phone/WhatsApp follow-up could turn map searches into appointment enquiries.",
    publicInfo: [
      "Rating 3.0 with 2 Google reviews (public listing data).",
      "Located in Block 415 HDB Pandan, Pandan Gardens.",
      "Google listing prompts to add a website — none is linked.",
      "Listed phone: 6262 1006. Open until 10:30 pm.",
    ],
    inferredInfo: [
      "Neighbourhood massage spas without websites lose comparison shoppers to competitors with online menus.",
      "Hours and service list are not published anywhere searchable beyond Google Maps.",
    ],
    identifiedGaps: ["No website", "No online booking", "Missing Google website link", "No service menu online"],
    monthlyImpactLow: 800,
    monthlyImpactHigh: 1800,
    suggestedMonthlyPrice: 49,
    estimatedDeliveryCost: 31.8,
  }),
  prospect({
    id: "prospect-bugis-brew",
    slug: "bugis-brew-lab",
    name: "Bugis Brew Lab",
    category: "Cafe",
    location: "Bugis",
    address: "Liang Seah Street, Singapore",
    phone: "+65 6000 0200",
    rating: 4.4,
    reviewCount: 92,
    websiteStatus: "no_website",
    socialPresence: ["Instagram", "TikTok"],
    opportunityScore: 78,
    estimatedDealValue: 299,
    status: "Negotiating",
    agentState: "FOLLOWING_UP",
    summary:
      "Specialty coffee bar with strong social following but no owned destination for menu, hours or group bookings.",
    whyGoodProspect:
      "High foot-traffic area where searchers decide within minutes. A menu-first mobile page would capture undecided visitors.",
    onlineBookingValue:
      "Table enquiries, group orders and event requests can be routed to WhatsApp.",
    publicInfo: [
      "Rating 4.4 with 92 public reviews (public listing data).",
      "Active Instagram and TikTok, no website detected.",
    ],
    inferredInfo: [
      "Menu and opening-hours pages would reduce abandoned searches.",
      "Corporate coffee-run enquiries could become a lead source.",
    ],
    identifiedGaps: ["No website", "No online menu", "Missing analytics"],
    monthlyImpactLow: 600,
    monthlyImpactHigh: 1400,
    suggestedMonthlyPrice: 39,
    estimatedDeliveryCost: 24.5,
  }),
  prospect({
    id: "prospect-tampines-tutors",
    slug: "tampines-edge-tuition",
    name: "Tampines Edge Tuition",
    category: "Tuition centre",
    location: "Tampines",
    address: "Tampines Central 5, Singapore",
    phone: "+65 6000 0300",
    rating: 4.6,
    reviewCount: 63,
    websiteStatus: "weak_website",
    socialPresence: ["Facebook"],
    opportunityScore: 84,
    estimatedDealValue: 499,
    status: "Negotiating",
    agentState: "FOLLOWING_UP",
    summary:
      "Neighbourhood tuition centre with strong parent reviews but a single-page site with no programme details or trial booking.",
    whyGoodProspect:
      "Parents compare centres online before enquiring. A structured programme catalogue with trial-class booking would raise conversion.",
    onlineBookingValue:
      "Trial-class booking and level-based enquiry forms are likely to improve lead volume.",
    publicInfo: [
      "Rating 4.6 with 63 public reviews (public listing data).",
      "Existing site is one page with a phone number only.",
    ],
    inferredInfo: [
      "Parents likely need subject and level details before enquiring.",
      "A trial-class CTA would outperform a generic contact page.",
    ],
    identifiedGaps: ["Weak mobile experience", "No booking", "Poor local SEO"],
    monthlyImpactLow: 900,
    monthlyImpactHigh: 2000,
    suggestedMonthlyPrice: 59,
    estimatedDeliveryCost: 28.9,
  }),
  prospect({
    id: "prospect-jurong-fit",
    slug: "jurong-east-strength-co",
    name: "Strength Co Fitness",
    category: "Fitness studio",
    location: "Jurong East",
    address: "Jurong Gateway Road, Singapore",
    phone: "+65 6000 0400",
    rating: 4.8,
    reviewCount: 121,
    websiteStatus: "weak_website",
    socialPresence: ["Instagram"],
    opportunityScore: 86,
    estimatedDealValue: 449,
    status: "Negotiating",
    agentState: "FOLLOWING_UP",
    summary:
      "Boutique strength gym with excellent reviews. Class schedule lives in Instagram stories; there is no class booking or trial signup flow.",
    whyGoodProspect:
      "Class-based businesses convert well with visible schedules and trial offers. Current site has neither.",
    onlineBookingValue:
      "Class trial bookings and membership enquiries are high-value conversion points.",
    publicInfo: [
      "Rating 4.8 with 121 public reviews (public listing data).",
      "Website exists but has no schedule or signup capability.",
    ],
    inferredInfo: [
      "Schedule visibility likely gates trial signups.",
      "A trial-class funnel would measurably lift enquiries.",
    ],
    identifiedGaps: ["No booking", "Weak mobile experience", "No lead capture"],
    monthlyImpactLow: 1100,
    monthlyImpactHigh: 2600,
    suggestedMonthlyPrice: 59,
    estimatedDeliveryCost: 30.2,
  }),
  prospect({
    id: "prospect-orchard-nails",
    slug: "orchard-polish-bar",
    name: "Orchard Polish Bar",
    category: "Nail salon",
    location: "Orchard",
    address: "Cuppage Plaza, Singapore",
    phone: "+65 6000 0500",
    rating: 4.5,
    reviewCount: 74,
    websiteStatus: "no_website",
    socialPresence: ["Instagram"],
    opportunityScore: 82,
    estimatedDealValue: 349,
    status: "Negotiating",
    agentState: "FOLLOWING_UP",
    summary:
      "Popular nail studio relying entirely on Instagram DMs for appointments. Walk-in rejections suggest unmet booking demand.",
    whyGoodProspect:
      "Appointment-driven category with clear demand signals and no structured booking flow.",
    onlineBookingValue:
      "Appointment requests and package enquiries can convert directly from search traffic.",
    publicInfo: [
      "Rating 4.5 with 74 public reviews (public listing data).",
      "Bookings handled via Instagram DM only.",
    ],
    inferredInfo: [
      "DM-based booking likely loses customers outside active hours.",
      "A service menu with prices would pre-qualify enquiries.",
    ],
    identifiedGaps: ["No website", "No booking", "Slow enquiry response"],
    monthlyImpactLow: 800,
    monthlyImpactHigh: 1800,
    suggestedMonthlyPrice: 49,
    estimatedDeliveryCost: 26.4,
  }),
  prospect({
    id: "prospect-toa-payoh-dental",
    slug: "toa-payoh-family-dental",
    name: "Toa Payoh Family Dental",
    category: "Dental clinic",
    location: "Toa Payoh",
    address: "Toa Payoh Lorong 4, Singapore",
    phone: "+65 6000 0600",
    rating: 4.9,
    reviewCount: 203,
    websiteStatus: "weak_website",
    socialPresence: [],
    opportunityScore: 88,
    estimatedDealValue: 549,
    status: "Negotiating",
    agentState: "FOLLOWING_UP",
    summary:
      "Highly trusted neighbourhood clinic with an outdated site: no appointment requests, no services list, not mobile friendly.",
    whyGoodProspect:
      "Exceptional review profile (4.9 across 203 reviews) with a digital presence that does not match the clinic's reputation.",
    onlineBookingValue:
      "Appointment requests and new-patient registrations are high-value and time-sensitive.",
    publicInfo: [
      "Rating 4.9 with 203 public reviews (public listing data).",
      "Existing website fails mobile-friendly checks.",
    ],
    inferredInfo: [
      "New patients likely call competitors with online booking.",
      "An appointment-request form would capture after-hours demand.",
    ],
    identifiedGaps: ["Weak mobile experience", "No booking", "Inconsistent business information"],
    monthlyImpactLow: 1500,
    monthlyImpactHigh: 3200,
    suggestedMonthlyPrice: 69,
    estimatedDeliveryCost: 33.1,
  }),
  prospect({
    id: "prospect-bedok-bakes",
    slug: "bedok-morning-bakes",
    name: "Morning Bakes",
    category: "Bakery",
    location: "Bedok",
    address: "Bedok North Street 1, Singapore",
    phone: "+65 6000 0700",
    rating: 4.6,
    reviewCount: 88,
    websiteStatus: "no_website",
    socialPresence: ["Instagram", "Facebook"],
    opportunityScore: 76,
    estimatedDealValue: 299,
    status: "Negotiating",
    agentState: "PAYMENT_PENDING",
    summary:
      "Neighbourhood bakery with a loyal following. Custom cake orders arrive by DM with no structured order form or pickup scheduling.",
    whyGoodProspect:
      "Custom orders are high-margin and currently bottlenecked by manual DMs.",
    onlineBookingValue:
      "A cake order form with pickup slots would streamline the highest-margin product line.",
    publicInfo: [
      "Rating 4.6 with 88 public reviews (public listing data).",
      "Order enquiries handled through Instagram DMs.",
    ],
    inferredInfo: [
      "Order mistakes likely occur from unstructured DM threads.",
      "Pickup-slot scheduling would reduce counter congestion.",
    ],
    identifiedGaps: ["No website", "No online ordering", "No lead capture"],
    monthlyImpactLow: 700,
    monthlyImpactHigh: 1600,
    suggestedMonthlyPrice: 39,
    estimatedDeliveryCost: 25.7,
  }),
  prospect({
    id: "prospect-clementi-clean",
    slug: "clementi-sparkle-cleaning",
    name: "Sparkle Cleaning Services",
    category: "Cleaning service",
    location: "Clementi",
    address: "Clementi Avenue 3, Singapore",
    phone: "+65 6000 0800",
    rating: 4.7,
    reviewCount: 156,
    websiteStatus: "no_website",
    socialPresence: [],
    opportunityScore: 85,
    estimatedDealValue: 399,
    status: "Won",
    agentState: "WON",
    summary:
      "Established home-cleaning operator with strong reviews. Quotes and scheduling handled entirely by phone during business hours.",
    whyGoodProspect:
      "Service bookings are high-intent. An instant-quote form would capture after-hours demand competitors miss.",
    onlineBookingValue:
      "Quote requests and recurring-service signups convert well from search.",
    publicInfo: [
      "Rating 4.7 with 156 public reviews (public listing data).",
      "No website or social presence detected.",
    ],
    inferredInfo: [
      "After-hours enquiries currently go unanswered.",
      "Recurring-plan packaging would raise customer lifetime value.",
    ],
    identifiedGaps: ["No website", "No lead capture", "Slow enquiry response"],
    monthlyImpactLow: 1000,
    monthlyImpactHigh: 2200,
    suggestedMonthlyPrice: 49,
    estimatedDeliveryCost: 27.3,
  }),
  prospect({
    id: "prospect-punggol-wok",
    slug: "punggol-golden-wok",
    name: "Golden Wok Kitchen",
    category: "Restaurant",
    location: "Punggol",
    address: "Punggol Drive, Singapore",
    phone: "+65 6000 0900",
    rating: 4.3,
    reviewCount: 67,
    websiteStatus: "weak_website",
    socialPresence: ["Facebook"],
    opportunityScore: 68,
    estimatedDealValue: 349,
    status: "Rejected",
    agentState: "REJECTED",
    summary:
      "Family-run zi char restaurant. The owner reviewed the pitch but decided to stay with the current Facebook page for now.",
    whyGoodProspect:
      "Reservation and menu traffic exists, but the owner is not ready to invest this quarter.",
    onlineBookingValue:
      "Table reservations and set-menu pre-orders would be the primary conversion goals.",
    publicInfo: [
      "Rating 4.3 with 67 public reviews (public listing data).",
      "Facebook page updated weekly; site is outdated.",
    ],
    inferredInfo: [
      "Weekend reservation demand likely exceeds phone capacity.",
    ],
    identifiedGaps: ["Weak mobile experience", "No booking"],
    monthlyImpactLow: 500,
    monthlyImpactHigh: 1200,
    suggestedMonthlyPrice: 39,
    estimatedDeliveryCost: 24.1,
    lostReason: "Owner deferred the decision to next quarter; follow-up scheduled.",
  }),
  prospect({
    id: "prospect-amk-motors",
    slug: "amk-precision-motors",
    name: "Precision Motors Workshop",
    category: "Car workshop",
    location: "Ang Mo Kio",
    address: "Ang Mo Kio Industrial Park 2, Singapore",
    phone: "+65 6000 1000",
    rating: 4.8,
    reviewCount: 143,
    websiteStatus: "no_website",
    socialPresence: [],
    opportunityScore: 83,
    estimatedDealValue: 449,
    status: "Rejected",
    agentState: "DO_NOT_CONTACT",
    summary:
      "Well-regarded workshop. The owner asked not to be contacted; the request is honoured across all channels.",
    whyGoodProspect:
      "Strong signals, but the business owner has opted out of outreach.",
    onlineBookingValue:
      "Servicing bookings and quote requests would have been the conversion goals.",
    publicInfo: [
      "Rating 4.8 with 143 public reviews (public listing data).",
      "Owner requested no contact on 10 Jul 2026.",
    ],
    inferredInfo: [],
    identifiedGaps: ["No website"],
    monthlyImpactLow: 0,
    monthlyImpactHigh: 0,
    suggestedMonthlyPrice: 0,
    estimatedDeliveryCost: 0,
    doNotContact: true,
  }),
  prospect({
    id: "prospect-bugis-blooms",
    slug: "bugis-petal-atelier",
    name: "Petal Atelier",
    category: "Florist",
    location: "Bugis",
    address: "Haji Lane, Singapore",
    phone: "+65 6000 1100",
    rating: 4.6,
    reviewCount: 59,
    websiteStatus: "no_website",
    socialPresence: ["Instagram"],
    opportunityScore: 74,
    estimatedDealValue: 349,
    status: "Discovered",
    agentState: "DISCOVERING",
    summary:
      "Boutique florist with strong visual content on Instagram but no order form for same-day arrangements or events.",
    whyGoodProspect:
      "Occasion-driven purchases are urgent; an order-by-occasion page would convert search demand.",
    onlineBookingValue:
      "Same-day orders and event consultations are the highest-value enquiries.",
    publicInfo: [
      "Rating 4.6 with 59 public reviews (public listing data).",
      "Orders taken via Instagram DM and phone.",
    ],
    inferredInfo: [
      "Same-day order cut-off times are not published anywhere.",
    ],
    identifiedGaps: ["No website", "No online ordering"],
    monthlyImpactLow: 600,
    monthlyImpactHigh: 1300,
    suggestedMonthlyPrice: 39,
    estimatedDeliveryCost: 24.8,
  }),
  prospect({
    id: "prospect-tanjong-physio",
    slug: "tanjong-pagar-physio",
    name: "Restore Physiotherapy",
    category: "Physiotherapy clinic",
    location: "Tanjong Pagar",
    address: "Maxwell Road, Singapore",
    phone: "+65 6000 1200",
    rating: 4.9,
    reviewCount: 97,
    websiteStatus: "weak_website",
    socialPresence: ["Instagram", "Facebook"],
    opportunityScore: 80,
    estimatedDealValue: 499,
    status: "Qualified",
    agentState: "RESEARCHING",
    summary:
      "Specialist physio clinic with outstanding reviews. Site lists services but has no appointment request flow or practitioner profiles.",
    whyGoodProspect:
      "Health appointments are high-value and trust-driven; the review profile deserves a stronger funnel.",
    onlineBookingValue:
      "First-consult bookings and insurance enquiries are key conversion points.",
    publicInfo: [
      "Rating 4.9 with 97 public reviews (public listing data).",
      "Existing site has no booking capability.",
    ],
    inferredInfo: [
      "Practitioner profiles would raise first-visit trust.",
    ],
    identifiedGaps: ["No booking", "Weak mobile experience", "Unanswered reviews"],
    monthlyImpactLow: 1200,
    monthlyImpactHigh: 2500,
    suggestedMonthlyPrice: 59,
    estimatedDeliveryCost: 29.6,
  }),
];

// ─── Factory functions ───

export function createEvidenceForProspect(prospect: Prospect): EvidenceItem[] {
  const base: EvidenceItem[] = [
    {
      id: `evidence-${prospect.id}-rating`,
      prospectId: prospect.id,
      claim: `Public rating of ${prospect.rating.toFixed(1)} across ${prospect.reviewCount} reviews indicates active customer demand.`,
      source: "Public listing data",
      confidence: 0.95,
      verified: true,
      capturedAt: createdAt,
      category: "demand",
    },
    {
      id: `evidence-${prospect.id}-website`,
      prospectId: prospect.id,
      claim:
        prospect.websiteStatus === "no_website"
          ? "No owned website was found on any public profile."
          : "Existing website fails mobile-friendly and conversion checks.",
      source: "Homepage probe",
      confidence: 0.9,
      verified: true,
      capturedAt: createdAt,
      category: "presence",
    },
    {
      id: `evidence-${prospect.id}-contact`,
      prospectId: prospect.id,
      claim: `Business is reachable by phone at ${prospect.phone}.`,
      source: "Public listing data",
      confidence: 0.92,
      verified: true,
      capturedAt: createdAt,
      category: "contact",
    },
  ];

  const inferred: EvidenceItem[] = prospect.inferredInfo.map((claim, index) => ({
    id: `evidence-${prospect.id}-inferred-${index}`,
    prospectId: prospect.id,
    claim,
    source: "Agent inference — not independently verified",
    confidence: 0.62,
    verified: false,
    capturedAt: createdAt,
    category: "inference",
  }));

  return [...base, ...inferred];
}

export function createResearchForProspect(prospect: Prospect): BusinessResearch {
  return {
    id: `research-${prospect.id}`,
    prospectId: prospect.id,
    publicSummary: prospect.summary,
    digitalPresenceAnalysis:
      prospect.websiteStatus === "no_website"
        ? "No owned website is visible in discovery data. The business depends on listings and social profiles, so search traffic has no conversion destination."
        : "A weak website or social-only presence is visible, but the path from discovery to enquiry is unclear and mobile experience is poor.",
    recommendedSections: [
      "Hero with clear category and location",
      "Services or packages with indicative pricing",
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

export function defaultVerificationChecks(passed: boolean): VerificationCheck[] {
  return [
    { id: "check-mobile", label: "Mobile layout renders at 375px", passed },
    { id: "check-cta", label: "Primary CTA links to a valid contact channel", passed },
    { id: "check-form", label: "Lead capture form validates and submits", passed },
    { id: "check-claims", label: "No unverified claims presented as fact", passed },
    { id: "check-placeholders", label: "Placeholders labelled for owner review", passed },
  ];
}

export function createWebsiteForProspect(
  prospect: Prospect,
  existingSlugs: string[] = [],
): GeneratedWebsite {
  const slug = createSlug(`${prospect.name} preview`, existingSlugs);
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
      body: "Review text is never fabricated. The published version quotes permitted public review snippets when available.",
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
    seoDescription: `${prospect.name} is a ${prospect.category.toLowerCase()} in ${prospect.location}. Preview site generated by VentureMint from public information.`,
    theme: {
      accent: "#10b981",
      style: "emerald",
    },
    sections,
    missingInfo: [
      "Confirmed opening hours",
      "Final service names",
      "Owner-approved photos",
      "Booking link or WhatsApp preference",
    ],
    verified: true,
    verificationChecks: defaultVerificationChecks(true),
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
    personalizedOpening: `Hi, this is VentureMint's AI assistant. I found ${prospect.name} while reviewing ${prospect.location} ${prospect.category.toLowerCase()} businesses and prepared a private website preview for your team to inspect.`,
    identifiedProblem:
      prospect.websiteStatus === "no_website"
        ? "The business relies on listings and social profiles without a dedicated site that can convert searchers into enquiries."
        : "The current web presence does not clearly guide a new customer from discovery to enquiry.",
    valueProposition:
      "A mobile-first website with services, trust signals, location details and a WhatsApp enquiry CTA can turn existing search demand into measurable leads.",
    packageName: "Launch Site Sprint",
    proposedPrice: prospect.estimatedDealValue,
    monthlyPrice: prospect.suggestedMonthlyPrice || 49,
    objectionResponses: [
      "If budget is the concern, we can activate the page first and keep edits lightweight for the first month.",
      "If you already use social media, the website acts as the owned destination for search and maps traffic.",
      "If timing is tight, the preview is already drafted and only needs owner-approved details.",
    ],
    negotiationLimits:
      "Do not offer below S$249 setup or S$39/month. Offer a 14-day edit window before discounting.",
    callObjective:
      "Secure permission to send the preview URL and ask whether they want to activate the site this week.",
    conversionProbability: prospect.opportunityScore >= 85 ? 0.62 : 0.44,
    approvalRequired: true,
    createdAt: new Date().toISOString(),
  };
}

// ─── Dashboard workspace ───

export const dashboardPipelineIds = [
  "prospect-new-nature-spa",
  "prospect-bugis-brew",
  "prospect-tampines-tutors",
  "prospect-jurong-fit",
  "prospect-orchard-nails",
  "prospect-toa-payoh-dental",
] as const;

export type DashboardPipelineStage = "closed" | "cold_call_done";

export interface DashboardPipelineItem {
  id: string;
  name: string;
  category: string;
  location: string;
  estimatedDealValue: number;
  stage: DashboardPipelineStage;
  stageLabel: string;
}

function pipelineStageFor(agentState: Prospect["agentState"]): {
  stage: DashboardPipelineStage;
  stageLabel: string;
} {
  if (agentState === "WON") {
    return { stage: "closed", stageLabel: "Closed" };
  }
  return { stage: "cold_call_done", stageLabel: "Cold call done" };
}

export function getDashboardPipeline(
  prospects: Prospect[] = seededProspects,
): DashboardPipelineItem[] {
  return dashboardPipelineIds
    .map((id) => prospects.find((item) => item.id === id))
    .filter((item): item is Prospect => Boolean(item))
    .map((prospect) => {
      const { stage, stageLabel } = pipelineStageFor(prospect.agentState);
      return {
        id: prospect.id,
        name: prospect.name,
        category: prospect.category,
        location: prospect.location,
        estimatedDealValue: prospect.estimatedDealValue,
        stage,
        stageLabel,
      };
    });
}

export function getDashboardMetrics(prospects?: Prospect[]) {
  const pipeline = getDashboardPipeline(prospects);
  const closed = pipeline.filter((item) => item.stage === "closed");
  const active = pipeline.filter((item) => item.stage === "cold_call_done");
  const revenue = closed.reduce((sum, item) => sum + item.estimatedDealValue, 0);
  const pipelineValue = active.reduce(
    (sum, item) => sum + item.estimatedDealValue,
    0,
  );
  const closedProspect = closed[0]
    ? (prospects ?? seededProspects).find((item) => item.id === closed[0].id)
    : undefined;
  const deliveryCost = closedProspect?.estimatedDeliveryCost ?? 0;

  return {
    closedDeals: closed.length,
    activePipeline: active.length,
    revenue,
    pipelineValue,
    netProfit: revenue - deliveryCost,
  };
}

export function getDashboardActivity(): AgentEvent[] {
  const t = createdAt;
  return [
    {
      id: "dash-event-1",
      timestamp: t,
      prospectId: "prospect-new-nature-spa",
      agent: "Finance Agent",
      title: "New Nature Spa closed",
      status: "complete",
      newState: "WON",
      inputSummary: "Checkout confirmed.",
      outputSummary: "S$140 collected",
      estimatedCost: 0.06,
      retryStatus: "not_needed",
    },
    {
      id: "dash-event-2",
      timestamp: t,
      prospectId: "prospect-toa-payoh-dental",
      agent: "Sales Agent",
      title: "Toa Payoh Family Dental",
      status: "complete",
      newState: "FOLLOWING_UP",
      inputSummary: "Outbound call completed.",
      outputSummary: "Owner asked for preview link",
      estimatedCost: 0.42,
      retryStatus: "not_needed",
    },
    {
      id: "dash-event-3",
      timestamp: t,
      prospectId: "prospect-orchard-nails",
      agent: "Sales Agent",
      title: "Orchard Polish Bar",
      status: "complete",
      newState: "FOLLOWING_UP",
      inputSummary: "Outbound call completed.",
      outputSummary: "Follow-up scheduled",
      estimatedCost: 0.42,
      retryStatus: "not_needed",
    },
    {
      id: "dash-event-4",
      timestamp: t,
      prospectId: "prospect-jurong-fit",
      agent: "Sales Agent",
      title: "Strength Co Fitness",
      status: "complete",
      newState: "FOLLOWING_UP",
      inputSummary: "Outbound call completed.",
      outputSummary: "Interested in trial page",
      estimatedCost: 0.42,
      retryStatus: "not_needed",
    },
    {
      id: "dash-event-5",
      timestamp: t,
      prospectId: "prospect-bugis-brew",
      agent: "Sales Agent",
      title: "Bugis Brew Lab",
      status: "complete",
      newState: "FOLLOWING_UP",
      inputSummary: "Outbound call completed.",
      outputSummary: "Sent menu preview link",
      estimatedCost: 0.42,
      retryStatus: "not_needed",
    },
  ];
}

function createCallForProspect(prospect: Prospect) {
  return {
    id: `call-${prospect.id}`,
    prospectId: prospect.id,
    status: "Completed" as const,
    durationSeconds: 126,
    sentiment: "positive" as const,
    detectedObjections: ["Wants to review pricing"],
    priceDiscussed: prospect.estimatedDealValue,
    nextAction: "Send preview link and follow up.",
    outcome: "Cold call completed. Owner open to reviewing the preview.",
    simulation: true,
    startedAt: createdAt,
    completedAt: createdAt,
  };
}

export const discoveryWaveIds = [
  "prospect-bugis-blooms",
  "prospect-bedok-bakes",
  "prospect-tanjong-physio",
] as const;

/** Fresh leads the Venture Agent surfaces when a judge hits Run. */
export function getDiscoveryWave(existingIds: Iterable<string>): Prospect[] {
  const known = new Set(existingIds);
  return discoveryWaveIds
    .map((id) => seededProspects.find((item) => item.id === id))
    .filter((item): item is Prospect => item != null && !known.has(item.id))
    .map((item) => ({
      ...item,
      status: "Discovered" as const,
      agentState: "DISCOVERING" as const,
      updatedAt: new Date().toISOString(),
    }));
}

export function buildDashboardWorkspace() {
  const prospects = dashboardPipelineIds
    .map((id) => seededProspects.find((item) => item.id === id))
    .filter((item): item is Prospect => Boolean(item))
    .map((item) => ({ ...item }));

  const research = prospects.map((item) => createResearchForProspect(item));
  const scores = prospects.map((item) => createScoreForProspect(item));
  const websites = prospects.map((item) => createWebsiteForProspect(item));
  const strategies = prospects.map((item) =>
    createSalesStrategyForProspect(item),
  );
  const evidence = prospects.flatMap((item) => createEvidenceForProspect(item));
  const calls = prospects.map((item) => createCallForProspect(item));

  const flagship = prospects.find((item) => item.id === "prospect-new-nature-spa")!;
  const offer = {
    id: `offer-${flagship.id}`,
    prospectId: flagship.id,
    packageName: "Launch Site Sprint",
    setupAmount: flagship.estimatedDealValue,
    monthlyAmount: flagship.suggestedMonthlyPrice ?? 49,
    status: "Accepted" as const,
    createdAt,
  };
  const payment = {
    id: `payment-${flagship.id}`,
    prospectId: flagship.id,
    offerId: offer.id,
    amount: flagship.estimatedDealValue,
    currency: "SGD" as const,
    checkoutUrl: `/mock-checkout/${offer.id}`,
    status: "Paid" as const,
    provider: "mock" as const,
    createdAt,
    paidAt: createdAt,
  };

  return {
    prospects,
    research,
    scores,
    websites,
    strategies,
    evidence,
    calls,
    offers: [offer],
    payments: [payment],
    events: getDashboardActivity(),
    selectedProspectId: flagship.id,
  };
}

// ─── Initial state assembly ───

export function createInitialEvents(): AgentEvent[] {
  return getDashboardActivity();
}

export function createInitialState(): RevenueLoopState {
  const workspace = buildDashboardWorkspace();
  return {
    prospects: workspace.prospects,
    research: workspace.research,
    scores: workspace.scores,
    websites: workspace.websites,
    strategies: workspace.strategies,
    calls: workspace.calls,
    transcripts: [],
    offers: workspace.offers,
    payments: workspace.payments,
    runs: [],
    events: workspace.events,
    costs: [
      {
        id: "cost-new-nature-delivery",
        provider: "VentureMint",
        action: "Site delivery",
        amount: 31.8,
        prospectId: "prospect-new-nature-spa",
        createdAt,
      },
    ],
    evidence: workspace.evidence,
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
      maxCallsPerDay: 10,
      allowedRegions: ["Singapore"],
    },
    doNotContactEntries: [],
    selectedProspectId: workspace.selectedProspectId,
    agentStatus: "Idle",
    runningDemo: false,
    safetyLock: false,
    lastUpdatedAt: createdAt,
  };
}
