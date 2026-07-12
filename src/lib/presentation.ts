import type { AgentState, EventStatus } from "@/lib/types";

type Tone = "green" | "blue" | "purple" | "amber" | "red" | "muted";

export const stateTone: Record<AgentState, Tone> = {
  DISCOVERING: "blue",
  RESEARCHING: "blue",
  SCORING: "blue",
  GENERATING_SITE: "purple",
  PREPARING_PITCH: "purple",
  AWAITING_APPROVAL: "amber",
  CALLING: "green",
  FOLLOWING_UP: "blue",
  PAYMENT_PENDING: "amber",
  WON: "green",
  FAILED: "red",
  PAUSED: "muted",
  REJECTED: "red",
  DO_NOT_CONTACT: "red",
};

export const eventStatusTone: Record<EventStatus, Tone> = {
  complete: "green",
  running: "blue",
  pending: "muted",
  failed: "red",
  approval: "amber",
};

export const gapLabels: Record<string, string> = {
  "No website": "No website",
  "No booking": "No booking",
  "No online menu": "No online menu",
  "No online ordering": "No online ordering",
  "Weak mobile experience": "Weak mobile",
  "Slow enquiry response": "Slow replies",
  "Poor local SEO": "Poor local SEO",
  "Missing analytics": "No analytics",
  "No lead capture": "No lead capture",
  "Unanswered reviews": "Unanswered reviews",
  "Inconsistent business information": "Inconsistent info",
};
