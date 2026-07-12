"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Globe2,
  HandCoins,
  Pause,
  PhoneCall,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency, percent, shortTime } from "@/lib/utils";
import { pipelineStatuses, stateLabels, type AgentEvent, type Metrics } from "@/lib/types";

const metricIcons = {
  prospectsDiscovered: Search,
  websitesGenerated: Globe2,
  callsCompleted: PhoneCall,
  dealsClosed: CheckCircle2,
  revenue: Banknote,
  operatingCost: HandCoins,
  netProfit: TrendingUp,
  conversionRate: CircleDollarSign,
} as const;

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: "green" | "blue" | "purple" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-300"
      : tone === "blue"
        ? "text-sky-300"
        : tone === "purple"
          ? "text-violet-300"
          : "text-amber-300";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-white/10 bg-white/[0.055] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-2xl font-semibold text-white"
          >
            {value}
          </motion.p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/30">
          <Icon size={18} className={toneClass} />
        </span>
      </div>
    </motion.div>
  );
}

function MetricsGrid({ metrics }: { metrics: Metrics }) {
  const cards = [
    {
      id: "prospectsDiscovered",
      label: "Prospects discovered",
      value: String(metrics.prospectsDiscovered),
      icon: metricIcons.prospectsDiscovered,
      tone: "blue" as const,
    },
    {
      id: "websitesGenerated",
      label: "Websites generated",
      value: String(metrics.websitesGenerated),
      icon: metricIcons.websitesGenerated,
      tone: "purple" as const,
    },
    {
      id: "callsCompleted",
      label: "Calls completed",
      value: String(metrics.callsCompleted),
      icon: metricIcons.callsCompleted,
      tone: "amber" as const,
    },
    {
      id: "dealsClosed",
      label: "Deals closed",
      value: String(metrics.dealsClosed),
      icon: metricIcons.dealsClosed,
      tone: "green" as const,
    },
    {
      id: "revenue",
      label: "Revenue",
      value: currency(metrics.revenue),
      icon: metricIcons.revenue,
      tone: "green" as const,
    },
    {
      id: "operatingCost",
      label: "API / operating cost",
      value: currency(metrics.operatingCost),
      icon: metricIcons.operatingCost,
      tone: "amber" as const,
    },
    {
      id: "netProfit",
      label: "Net profit",
      value: currency(metrics.netProfit),
      icon: metricIcons.netProfit,
      tone: "green" as const,
    },
    {
      id: "conversionRate",
      label: "Conversion rate",
      value: percent(metrics.conversionRate),
      icon: metricIcons.conversionRate,
      tone: "purple" as const,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.id} {...card} />
      ))}
    </div>
  );
}

function eventIcon(event: AgentEvent) {
  if (event.status === "approval") return ShieldCheck;
  if (event.newState === "CALLING") return PhoneCall;
  if (event.newState === "WON") return CircleDollarSign;
  if (event.newState === "GENERATING_SITE" || event.title.includes("Website")) {
    return Sparkles;
  }
  if (event.newState === "DISCOVERING") return Search;
  return Clock3;
}

function Timeline() {
  const { state } = useRevenueLoop();

  return (
    <Panel className="overflow-hidden">
      <PanelHeader title="Live Agent Timeline" eyebrow="state machine" />
      <div className="max-h-[680px] overflow-y-auto px-5 py-2">
        {state.events.map((event, index) => {
          const Icon = eventIcon(event);
          return (
            <motion.details
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              open={index < 3}
              className="group relative border-l border-white/10 py-4 pl-6"
            >
              <span className="absolute -left-[17px] top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#101214]">
                <Icon size={15} className="text-emerald-300" />
              </span>
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {stateLabels[event.newState]} · {shortTime(event.timestamp)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      event.status === "failed"
                        ? "red"
                        : event.status === "approval"
                          ? "amber"
                          : event.status === "running"
                            ? "blue"
                            : "green"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              </summary>
              <div className="mt-3 rounded-lg border border-white/10 bg-black/22 p-3 text-sm text-zinc-300">
                <p>
                  <span className="text-zinc-500">Input:</span> {event.inputSummary}
                </p>
                <p className="mt-2">
                  <span className="text-zinc-500">Output:</span> {event.outputSummary}
                </p>
                <p className="mt-2 text-zinc-500">
                  Estimated cost {currency(event.estimatedCost)}
                </p>
              </div>
            </motion.details>
          );
        })}
      </div>
    </Panel>
  );
}

function Pipeline() {
  const { state, selectProspect } = useRevenueLoop();

  return (
    <Panel className="overflow-hidden">
      <PanelHeader title="Prospect Pipeline" eyebrow="deal flow" />
      <div className="grid gap-3 overflow-x-auto p-4 lg:grid-cols-4 xl:grid-cols-8">
        {pipelineStatuses.map((status) => {
          const prospects = state.prospects.filter((prospect) => prospect.status === status);
          return (
            <div key={status} className="min-w-48 rounded-lg border border-white/10 bg-black/24">
              <div className="border-b border-white/10 px-3 py-3">
                <p className="text-sm font-semibold text-white">{status}</p>
                <p className="text-xs text-zinc-500">{prospects.length} prospects</p>
              </div>
              <div className="space-y-3 p-3">
                {prospects.map((prospect) => (
                  <Link
                    key={prospect.id}
                    href={`/prospects/${prospect.id}`}
                    onClick={() => selectProspect(prospect.id)}
                    className="block rounded-lg border border-white/10 bg-white/[0.05] p-3 transition hover:border-emerald-300/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{prospect.name}</p>
                      <span className="text-xs text-emerald-200">
                        {prospect.opportunityScore}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {prospect.category} · {prospect.location}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Est. {currency(prospect.estimatedDealValue)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function DashboardView() {
  const { state, metrics, runDemo, pauseAgent, resetDemo } = useRevenueLoop();

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#101214]/88 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">Autonomous agency</Badge>
            <Badge tone={state.agentStatus === "Running" ? "green" : "amber"}>
              {state.agentStatus}
            </Badge>
            <Badge tone="purple">{state.settings.mode === "mock" ? "Mock mode" : "Live mode"}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            RevenueLoop Command Centre
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            An AI agent that finds its own customers, creates its own product and generates its own revenue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon={<Play size={16} />}
            onClick={() => void runDemo(state.settings.demoSpeed)}
            disabled={state.runningDemo}
          >
            Start Revenue Loop
          </Button>
          <Button variant="secondary" icon={<Pause size={16} />} onClick={pauseAgent}>
            Pause Agent
          </Button>
          <Button variant="ghost" icon={<RefreshCw size={16} />} onClick={resetDemo}>
            Reset
          </Button>
        </div>
      </section>

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Timeline />
        <Panel className="overflow-hidden">
          <PanelHeader title="Next Cycle Budget" eyebrow="profit flywheel" />
          <div className="p-5">
            <div className="flex items-center gap-5">
              <ProgressRing value={Math.min(100, metrics.nextCycleBudget / 2)} size={92} />
              <div>
                <p className="text-4xl font-semibold text-white">
                  {currency(metrics.nextCycleBudget)}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Profit allocated for the next prospecting cycle.
                </p>
              </div>
            </div>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-emerald-300"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, metrics.nextCycleBudget / 2)}%` }}
              />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm text-zinc-400">Approval policy</p>
                <p className="mt-2 font-semibold text-white">
                  Human approval before calls
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm text-zinc-400">Calling hours</p>
                <p className="mt-2 font-semibold text-white">
                  {state.settings.callingHours.start} to {state.settings.callingHours.end}
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Pipeline />
    </div>
  );
}
