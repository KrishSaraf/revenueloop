import type { AgentState, Prospect } from "@/lib/types";

const allowedTransitions: Record<AgentState, AgentState[]> = {
  DISCOVERING: ["RESEARCHING", "PAUSED", "FAILED"],
  RESEARCHING: ["SCORING", "PAUSED", "FAILED"],
  SCORING: ["GENERATING_SITE", "REJECTED", "PAUSED", "FAILED"],
  GENERATING_SITE: ["PREPARING_PITCH", "PAUSED", "FAILED"],
  PREPARING_PITCH: ["AWAITING_APPROVAL", "PAUSED", "FAILED"],
  AWAITING_APPROVAL: ["CALLING", "PAUSED", "REJECTED", "DO_NOT_CONTACT"],
  CALLING: ["FOLLOWING_UP", "PAYMENT_PENDING", "PAUSED", "FAILED"],
  FOLLOWING_UP: ["PAYMENT_PENDING", "REJECTED", "PAUSED", "FAILED"],
  PAYMENT_PENDING: ["WON", "FOLLOWING_UP", "FAILED"],
  WON: [],
  FAILED: ["DISCOVERING"],
  PAUSED: [
    "DISCOVERING",
    "RESEARCHING",
    "SCORING",
    "GENERATING_SITE",
    "PREPARING_PITCH",
    "AWAITING_APPROVAL",
    "CALLING",
    "FOLLOWING_UP",
  ],
  REJECTED: [],
  DO_NOT_CONTACT: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: AgentState, to: AgentState) {
    super(`Invalid agent transition from ${from} to ${to}.`);
    this.name = "InvalidTransitionError";
  }
}

export class ExternalActionBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalActionBlockedError";
  }
}

export function canTransition(from: AgentState, to: AgentState) {
  return allowedTransitions[from].includes(to);
}

export function transitionAgentState(from: AgentState, to: AgentState) {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }

  return to;
}

export function assertCanPlaceCall(prospect: Prospect) {
  if (prospect.doNotContact) {
    throw new ExternalActionBlockedError(
      "Call blocked because this prospect is marked Do Not Contact.",
    );
  }

  if (!prospect.approvedForCall) {
    throw new ExternalActionBlockedError(
      "Call blocked until a human approves the external action.",
    );
  }

  if (prospect.agentState !== "AWAITING_APPROVAL") {
    throw new ExternalActionBlockedError(
      "Call blocked because the agent is not in the approval gate.",
    );
  }
}

export const agentWorkflow: AgentState[] = [
  "DISCOVERING",
  "RESEARCHING",
  "SCORING",
  "GENERATING_SITE",
  "PREPARING_PITCH",
  "AWAITING_APPROVAL",
  "CALLING",
  "FOLLOWING_UP",
  "PAYMENT_PENDING",
  "WON",
];
