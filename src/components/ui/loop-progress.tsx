"use client";

import type { AgentState } from "@/lib/types";
import { cn } from "@/lib/utils";

const phases: { key: string; label: string; states: AgentState[] }[] = [
  { key: "discover", label: "Discover", states: ["DISCOVERING"] },
  { key: "diagnose", label: "Diagnose", states: ["RESEARCHING"] },
  { key: "quantify", label: "Quantify", states: ["SCORING"] },
  { key: "execute", label: "Execute", states: ["GENERATING_SITE"] },
  { key: "package", label: "Package", states: ["PREPARING_PITCH"] },
  { key: "approve", label: "Approve", states: ["AWAITING_APPROVAL"] },
  { key: "connect", label: "Connect", states: ["CALLING", "FOLLOWING_UP"] },
  { key: "sell", label: "Sell", states: ["PAYMENT_PENDING", "WON"] },
];

export function LoopProgress({
  currentState,
  className,
}: {
  currentState?: AgentState;
  className?: string;
}) {
  const activeIndex = currentState
    ? phases.findIndex((phase) => phase.states.includes(currentState))
    : -1;
  const isWon = currentState === "WON";

  return (
    <ol
      className={cn("flex items-center gap-1 overflow-x-auto pb-1", className)}
      aria-label="VentureMint engine progress"
    >
      {phases.map((phase, index) => {
        const isComplete = isWon || (activeIndex >= 0 && index < activeIndex);
        const isActive = !isWon && index === activeIndex;
        return (
          <li key={phase.key} className="flex min-w-0 shrink-0 items-center gap-1">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                isComplete
                  ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                  : isActive
                    ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                    : "border-white/[0.06] bg-transparent text-zinc-600",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  isComplete
                    ? "bg-emerald-400"
                    : isActive
                      ? "bg-emerald-300 pulse-dot"
                      : "bg-zinc-700",
                )}
                aria-hidden
              />
              {phase.label}
            </div>
            {index < phases.length - 1 ? (
              <span className="h-px w-2 shrink-0 bg-white/10" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
