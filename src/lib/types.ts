export type IntegrationMode = "mock" | "live";

export type AgentStatus = "Running" | "Paused" | "Awaiting Approval" | "Idle";

export type AgentState =
  | "DISCOVERING"
  | "RESEARCHING"
  | "SCORING"
  | "GENERATING_SITE"
  | "PREPARING_PITCH"
  | "AWAITING_APPROVAL"
  | "CALLING"
  | "FOLLOWING_UP"
  | "PAYMENT_PENDING"
  | "WON"
  | "FAILED"
  | "PAUSED"
  | "REJECTED"
  | "DO_NOT_CONTACT";

export type ProspectStatus =
  | "Discovered"
  | "Qualified"
  | "Website Generated"
  | "Ready to Contact"
  | "Call Scheduled"
  | "Negotiating"
  | "Won"
  | "Rejected";

export type WebsiteStatus = "no_website" | "weak_website" | "healthy_website";

export type EventStatus = "complete" | "running" | "pending" | "failed" | "approval";

export type TranscriptSpeaker = "ai" | "owner" | "system";

export interface Prospect {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  websiteStatus: WebsiteStatus;
  socialPresence: string[];
  opportunityScore: number;
  estimatedDealValue: number;
  status: ProspectStatus;
  agentState: AgentState;
  summary: string;
  whyGoodProspect: string;
  onlineBookingValue: string;
  publicInfo: string[];
  inferredInfo: string[];
  currentWebsiteUrl?: string;
  generatedWebsiteId?: string;
  salesStrategyId?: string;
  callId?: string;
  paymentId?: string;
  approvedForCall: boolean;
  doNotContact: boolean;
  identifiedGaps?: string[];
  monthlyImpactLow?: number;
  monthlyImpactHigh?: number;
  suggestedMonthlyPrice?: number;
  estimatedDeliveryCost?: number;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceItem {
  id: string;
  prospectId: string;
  claim: string;
  source: string;
  confidence: number;
  verified: boolean;
  capturedAt: string;
  category: "presence" | "demand" | "contact" | "competition" | "inference";
}

export interface BusinessResearch {
  id: string;
  prospectId: string;
  publicSummary: string;
  digitalPresenceAnalysis: string;
  recommendedSections: string[];
  evidence: string[];
  inferred: string[];
  confidence: number;
  createdAt: string;
}

export interface OpportunityScore {
  id: string;
  prospectId: string;
  score: number;
  factors: ScoreFactor[];
  explanation: string;
  createdAt: string;
}

export interface ScoreFactor {
  label: string;
  score: number;
  max: number;
  evidence: string;
}

export interface WebsiteSection {
  id: string;
  title: string;
  body: string;
  kind:
    | "hero"
    | "overview"
    | "services"
    | "reasons"
    | "reviews"
    | "location"
    | "cta";
}

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface GeneratedWebsite {
  id: string;
  prospectId: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  theme: {
    accent: string;
    style: "emerald" | "indigo" | "amber";
  };
  sections: WebsiteSection[];
  missingInfo: string[];
  verified: boolean;
  verificationChecks: VerificationCheck[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalesStrategy {
  id: string;
  prospectId: string;
  personalizedOpening: string;
  identifiedProblem: string;
  valueProposition: string;
  packageName: string;
  proposedPrice: number;
  monthlyPrice: number;
  objectionResponses: string[];
  negotiationLimits: string;
  callObjective: string;
  conversionProbability: number;
  approvalRequired: boolean;
  createdAt: string;
}

export interface Call {
  id: string;
  prospectId: string;
  status: "Not Started" | "Approved" | "Calling" | "Completed" | "Blocked";
  durationSeconds: number;
  sentiment: "positive" | "neutral" | "concerned";
  detectedObjections: string[];
  priceDiscussed: number;
  nextAction: string;
  recordingUrl?: string;
  outcome?: string;
  simulation: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface CallTranscriptEntry {
  id: string;
  callId: string;
  speaker: TranscriptSpeaker;
  text: string;
  timestamp: string;
  sentiment?: "positive" | "neutral" | "concerned";
}

export interface Offer {
  id: string;
  prospectId: string;
  packageName: string;
  setupAmount: number;
  monthlyAmount: number;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
  createdAt: string;
}

export interface Payment {
  id: string;
  prospectId: string;
  offerId: string;
  amount: number;
  currency: "SGD";
  checkoutUrl: string;
  status: "Pending" | "Paid" | "Failed";
  provider: IntegrationMode;
  createdAt: string;
  paidAt?: string;
}

export interface AgentRun {
  id: string;
  status: AgentStatus;
  currentState: AgentState;
  startedAt: string;
  completedAt?: string;
  mode: IntegrationMode;
}

export type AgentName =
  | "Discovery Agent"
  | "Research Agent"
  | "Scoring Agent"
  | "Strategy Agent"
  | "Build Agent"
  | "Verification Agent"
  | "Sales Agent"
  | "Finance Agent"
  | "System";

export interface AgentEvent {
  id: string;
  timestamp: string;
  prospectId?: string;
  agent?: AgentName;
  title: string;
  status: EventStatus;
  previousState?: AgentState;
  newState: AgentState;
  inputSummary: string;
  outputSummary: string;
  estimatedCost: number;
  error?: string;
  retryStatus: "not_needed" | "queued" | "retrying" | "failed";
}

export interface OperatingCost {
  id: string;
  provider: string;
  action: string;
  amount: number;
  prospectId?: string;
  createdAt: string;
}

export interface UserSettings {
  mode: IntegrationMode;
  discoveryProvider?: "mock" | "google" | "overpass";
  callingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  dataRetentionDays: number;
  requireHumanApproval: boolean;
  demoSpeed: number;
  maxCallsPerDay: number;
  allowedRegions: string[];
}

export interface DoNotContactEntry {
  id: string;
  prospectId: string;
  reason: string;
  createdAt: string;
}

export interface Metrics {
  prospectsDiscovered: number;
  websitesGenerated: number;
  callsCompleted: number;
  dealsClosed: number;
  revenue: number;
  operatingCost: number;
  netProfit: number;
  conversionRate: number;
  nextCycleBudget: number;
}

export interface RevenueLoopState {
  prospects: Prospect[];
  research: BusinessResearch[];
  scores: OpportunityScore[];
  websites: GeneratedWebsite[];
  strategies: SalesStrategy[];
  calls: Call[];
  transcripts: CallTranscriptEntry[];
  offers: Offer[];
  payments: Payment[];
  runs: AgentRun[];
  events: AgentEvent[];
  costs: OperatingCost[];
  evidence: EvidenceItem[];
  settings: UserSettings;
  doNotContactEntries: DoNotContactEntry[];
  selectedProspectId?: string;
  agentStatus: AgentStatus;
  runningDemo: boolean;
  safetyLock: boolean;
  lastUpdatedAt: string;
}

export const pipelineStatuses: ProspectStatus[] = [
  "Discovered",
  "Qualified",
  "Website Generated",
  "Ready to Contact",
  "Call Scheduled",
  "Negotiating",
  "Won",
  "Rejected",
];

export const stateLabels: Record<AgentState, string> = {
  DISCOVERING: "Discovering",
  RESEARCHING: "Researching",
  SCORING: "Scoring",
  GENERATING_SITE: "Generating site",
  PREPARING_PITCH: "Preparing pitch",
  AWAITING_APPROVAL: "Awaiting approval",
  CALLING: "Calling",
  FOLLOWING_UP: "Cold call done",
  PAYMENT_PENDING: "Payment pending",
  WON: "Closed",
  FAILED: "Failed",
  PAUSED: "Paused",
  REJECTED: "Rejected",
  DO_NOT_CONTACT: "Do not contact",
};
