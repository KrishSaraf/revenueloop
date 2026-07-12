import type { AgentName } from "@/lib/types";

/** Shared labels for dashboard + agents — keep in sync. */
export const agentSuite = [
  {
    step: 1,
    name: "Discovery Agent" as AgentName,
    job: "Find businesses",
    accent: "bg-sky-400/15 text-sky-300",
    bar: "bg-sky-400",
  },
  {
    step: 2,
    name: "Research Agent" as AgentName,
    job: "Understand the gap",
    accent: "bg-cyan-400/15 text-cyan-300",
    bar: "bg-cyan-400",
  },
  {
    step: 3,
    name: "Scoring Agent" as AgentName,
    job: "Rank opportunity",
    accent: "bg-violet-400/15 text-violet-300",
    bar: "bg-violet-400",
  },
  {
    step: 4,
    name: "Strategy Agent" as AgentName,
    job: "Prepare the pitch",
    accent: "bg-fuchsia-400/15 text-fuchsia-300",
    bar: "bg-fuchsia-400",
  },
  {
    step: 5,
    name: "Build Agent" as AgentName,
    job: "Build the site",
    accent: "bg-emerald-400/15 text-emerald-300",
    bar: "bg-emerald-400",
  },
  {
    step: 6,
    name: "Verification Agent" as AgentName,
    job: "Check quality",
    accent: "bg-amber-400/15 text-amber-300",
    bar: "bg-amber-400",
  },
  {
    step: 7,
    name: "Sales Agent" as AgentName,
    job: "Make the call",
    accent: "bg-orange-400/15 text-orange-300",
    bar: "bg-orange-400",
  },
  {
    step: 8,
    name: "Finance Agent" as AgentName,
    job: "Close & collect",
    accent: "bg-teal-400/15 text-teal-300",
    bar: "bg-teal-400",
  },
] as const;
