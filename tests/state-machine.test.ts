import { describe, expect, it } from "vitest";
import {
  assertCanPlaceCall,
  canTransition,
  transitionAgentState,
} from "@/lib/agent/state-machine";
import { seededProspects } from "@/lib/seed";

describe("agent state machine", () => {
  it("allows the happy-path approval transition", () => {
    expect(canTransition("PREPARING_PITCH", "AWAITING_APPROVAL")).toBe(true);
    expect(transitionAgentState("PAYMENT_PENDING", "WON")).toBe("WON");
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionAgentState("DISCOVERING", "WON")).toThrow(
      "Invalid agent transition",
    );
  });

  it("prevents calls without human approval", () => {
    const prospect = {
      ...seededProspects[0],
      agentState: "AWAITING_APPROVAL" as const,
      approvedForCall: false,
    };

    expect(() => assertCanPlaceCall(prospect)).toThrow("human approves");
  });

  it("enforces Do Not Contact", () => {
    const prospect = {
      ...seededProspects[0],
      agentState: "AWAITING_APPROVAL" as const,
      approvedForCall: true,
      doNotContact: true,
    };

    expect(() => assertCanPlaceCall(prospect)).toThrow("Do Not Contact");
  });
});
