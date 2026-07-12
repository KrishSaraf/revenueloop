import type { AgentState } from "@/lib/types";
import { stateLabels } from "@/lib/types";
import { Badge, StatusDot } from "@/components/ui/badge";

const stateTones: Record<
  AgentState,
  "green" | "blue" | "purple" | "amber" | "red" | "muted"
> = {
  DISCOVERING: "blue",
  RESEARCHING: "blue",
  SCORING: "blue",
  GENERATING_SITE: "purple",
  PREPARING_PITCH: "purple",
  AWAITING_APPROVAL: "amber",
  CALLING: "green",
  FOLLOWING_UP: "green",
  PAYMENT_PENDING: "amber",
  WON: "green",
  FAILED: "red",
  PAUSED: "muted",
  REJECTED: "red",
  DO_NOT_CONTACT: "red",
};

const activeStates = new Set<AgentState>([
  "DISCOVERING",
  "RESEARCHING",
  "SCORING",
  "GENERATING_SITE",
  "PREPARING_PITCH",
  "CALLING",
]);

export function StateBadge({ state }: { state: AgentState }) {
  const tone = stateTones[state];
  return (
    <Badge tone={tone}>
      <StatusDot tone={tone} pulse={activeStates.has(state)} />
      {stateLabels[state]}
    </Badge>
  );
}
