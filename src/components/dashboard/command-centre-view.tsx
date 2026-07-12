"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Loader2, Phone, Play, Sparkles, Square, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Dialog } from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  dashboardPipelineIds,
  getDashboardMetrics,
  getDashboardPipeline,
  type DashboardPipelineItem,
} from "@/lib/seed";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import type { AgentName, Prospect } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

type RunPhase = "idle" | "queued" | "running" | "awaiting" | "done";

interface LogLine {
  text: string;
  /** Delay before this line appears (ms) — models real I/O latency */
  delayMs: number;
}

interface AgentDefinition {
  step: number;
  name: AgentName;
  job: string;
  reads: string[];
  writes: string[];
  logs: LogLine[];
  /** Pause after this agent — findings review before pitch, or pitch review before build */
  gateAfter?: "findings" | "pitch";
  settleMs: number;
  accent: {
    bar: string;
    step: string;
    glow: string;
    ring: string;
    log: string;
  };
}

const findingsSummary = {
  prospect: "New Nature Spa",
  location: "Pandan Gardens",
  score: 79,
  gap: "No website — phone-only enquiries",
  queued: 6,
};

const callTranscript: { speaker: "system" | "ai" | "owner"; text: string; delayMs: number }[] = [
  { speaker: "system", text: "Simulation. No real outbound call was placed.", delayMs: 600 },
  {
    speaker: "ai",
    text: "Hi, this is VentureMint's AI assistant. I prepared a private website preview for New Nature Spa. Do you have 30 seconds?",
    delayMs: 1200,
  },
  {
    speaker: "owner",
    text: "A website preview? We do not have a proper site right now. What did you make?",
    delayMs: 1400,
  },
  {
    speaker: "ai",
    text: "A mobile page with your services, location, review signals and a WhatsApp enquiry button. It only uses public details you can approve.",
    delayMs: 1500,
  },
  {
    speaker: "owner",
    text: "Sounds useful. How much would it cost to activate?",
    delayMs: 1300,
  },
  {
    speaker: "ai",
    text: "Setup is S$399, then S$49 per month for hosting and light edits. I can send the preview and checkout link.",
    delayMs: 1400,
  },
  {
    speaker: "owner",
    text: "Send it over. If the page looks right, we can try it this week.",
    delayMs: 1100,
  },
];

const pipelineStages = [
  { id: "discover", label: "Discover & evaluate", agents: [1, 2, 3] },
  { id: "findings", label: "Findings review", agents: [] as number[] },
  { id: "pitch", label: "Prepare pitch", agents: [4] },
  { id: "build", label: "Build & verify", agents: [5, 6] },
  { id: "call", label: "Outbound call", agents: [7] },
  { id: "close", label: "Close deal", agents: [8] },
] as const;

type PipelineStageId = (typeof pipelineStages)[number]["id"];

const agentDefinitions: AgentDefinition[] = [
  {
    step: 1,
    name: "Discovery Agent",
    job: "Find businesses",
    reads: ["Maps listings", "Category filters", "Region bounds"],
    writes: ["Prospect queue", "Gap signals"],
    settleMs: 700,
    logs: [
      { text: "→ open discovery job · region=SG · radius=2.4km", delayMs: 900 },
      { text: "→ READ overpass tiles · Pandan Gardens / Jurong East", delayMs: 1400 },
      { text: "… waiting on maps tile 3/8 · 412ms", delayMs: 1600 },
      { text: "→ page 1 · 48 POIs · categories: spa, cafe, clinic, tuition", delayMs: 1200 },
      { text: "→ page 2 · 61 POIs · dedupe against known queue", delayMs: 1500 },
      { text: "→ page 3 · 75 POIs · rate-limit backoff 800ms", delayMs: 1800 },
      { text: "→ filter website_status in {none, broken, placeholder}", delayMs: 1100 },
      { text: "→ candidate New Nature Spa · Maps: no website link", delayMs: 1300 },
      { text: "→ cross-check phone +65 6262 1006 · listing live", delayMs: 1000 },
      { text: "→ WRITE prospect-new-nature-spa · gap_signal=no_website", delayMs: 900 },
      { text: "✓ discovery pass · 6 leads queued · 184 scanned", delayMs: 800 },
    ],
    accent: {
      bar: "bg-sky-400",
      step: "bg-sky-400/15 text-sky-300",
      glow: "hover:border-sky-400/30",
      ring: "border-sky-400/40 shadow-[0_0_24px_rgba(56,189,248,0.12)]",
      log: "text-sky-300/90",
    },
  },
  {
    step: 2,
    name: "Research Agent",
    job: "Understand the gap",
    reads: ["Prospect card", "Public listing", "Social handles"],
    writes: ["Research brief", "Evidence pack"],
    settleMs: 650,
    logs: [
      { text: "→ READ prospect-new-nature-spa from queue", delayMs: 800 },
      { text: "→ fetch Google Places details · place_id matched", delayMs: 1500 },
      { text: "… Places API 280ms · rating 3.0 · reviews=2", delayMs: 1200 },
      { text: "→ parse hours · open until 22:30 · phone confirmed", delayMs: 1100 },
      { text: "→ social sweep · IG handle search · no match", delayMs: 1600 },
      { text: "→ Facebook / TikTok scan · no owned page found", delayMs: 1400 },
      { text: "→ evidence[1] screenshot Maps card · no website CTA", delayMs: 1000 },
      { text: "→ evidence[2] review snippet · service unclear online", delayMs: 1100 },
      { text: "→ gap model: no booking path · no menu · phone-only", delayMs: 900 },
      { text: "→ WRITE research_brief.json · evidence ×4", delayMs: 850 },
      { text: "✓ research locked · handoff to scoring", delayMs: 700 },
    ],
    accent: {
      bar: "bg-cyan-400",
      step: "bg-cyan-400/15 text-cyan-300",
      glow: "hover:border-cyan-400/30",
      ring: "border-cyan-400/40 shadow-[0_0_24px_rgba(34,211,238,0.12)]",
      log: "text-cyan-300/90",
    },
  },
  {
    step: 3,
    name: "Scoring Agent",
    job: "Rank opportunity",
    reads: ["Research brief", "Demand signals", "Reachability"],
    writes: ["Opportunity score", "Priority rank"],
    settleMs: 600,
    logs: [
      { text: "→ READ research_brief + neighbourhood demand grid", delayMs: 850 },
      { text: "→ load feature weights · website_gap 0.35 · demand 0.25", delayMs: 1000 },
      { text: "→ reachability check · phone valid · calling hours OK", delayMs: 1300 },
      { text: "→ booking_value model · spa category uplift +12", delayMs: 1200 },
      { text: "→ competitor density · 3 nearby spas with sites", delayMs: 1400 },
      { text: "→ score pass 1 · 74/100 · re-weight reviews scarcity", delayMs: 1100 },
      { text: "→ score pass 2 · 79/100 · confidence band ±4", delayMs: 1000 },
      { text: "→ rank batch · New Nature Spa = #1 of 6", delayMs: 900 },
      { text: "→ WRITE opportunity_score · explanation for operator", delayMs: 800 },
      { text: "✓ scoring complete · findings ready to share", delayMs: 650 },
    ],
    gateAfter: "findings",
    accent: {
      bar: "bg-violet-400",
      step: "bg-violet-400/15 text-violet-300",
      glow: "hover:border-violet-400/30",
      ring: "border-violet-400/40 shadow-[0_0_24px_rgba(167,139,250,0.12)]",
      log: "text-violet-300/90",
    },
  },
  {
    step: 4,
    name: "Strategy Agent",
    job: "Prepare the pitch",
    reads: ["Score card", "Gaps", "Price band"],
    writes: ["Pitch script", "Offer package"],
    settleMs: 500,
    gateAfter: "pitch",
    logs: [
      { text: "→ READ score 79 + gap list + category price band", delayMs: 900 },
      { text: "→ price band SG spa · setup S$120–180 · pick S$140", delayMs: 1300 },
      { text: "→ draft opening line · local + specific to Pandan Gardens", delayMs: 1400 },
      { text: "→ value prop · owned booking page vs phone-only", delayMs: 1200 },
      { text: "→ objection pack · “we get walk-ins” · “already on Maps”", delayMs: 1500 },
      { text: "→ package Launch Site Sprint · monthly hosting S$49", delayMs: 1100 },
      { text: "→ conversion prior 0.62 · similar closed spa deals", delayMs: 1000 },
      { text: "→ WRITE sales_strategy · pitch ready for human review", delayMs: 900 },
      { text: "⏸ HOLD · awaiting operator approval before build", delayMs: 700 },
    ],
    accent: {
      bar: "bg-fuchsia-400",
      step: "bg-fuchsia-400/15 text-fuchsia-300",
      glow: "hover:border-fuchsia-400/30",
      ring: "border-fuchsia-400/40 shadow-[0_0_24px_rgba(232,121,249,0.12)]",
      log: "text-fuchsia-300/90",
    },
  },
  {
    step: 5,
    name: "Build Agent",
    job: "Build the site",
    reads: ["Research", "Brand cues", "Service gaps"],
    writes: ["Live preview", "Section HTML", "Theme tokens"],
    settleMs: 1100,
    logs: [
      { text: "→ READ approved strategy + research_brief", delayMs: 900 },
      { text: "→ spin site compiler · mobile-first scaffold", delayMs: 1400 },
      { text: "→ generate hero · New Nature Spa · Pandan Gardens", delayMs: 1600 },
      { text: "… LLM section draft hero · 2.1s", delayMs: 2100 },
      { text: "→ service catalogue · Swedish · deep tissue · aroma", delayMs: 1500 },
      { text: "… drafting treatment cards · 1.8s", delayMs: 1800 },
      { text: "→ hours strip + call CTA + WhatsApp fallback", delayMs: 1300 },
      { text: "→ theme tokens · warm stone · soft mint accents", delayMs: 1400 },
      { text: "→ booking enquiry panel · form validation rules", delayMs: 1500 },
      { text: "→ trust strip from public reviews only", delayMs: 1200 },
      { text: "→ optimize LCP · critical CSS · lazy below-fold", delayMs: 1600 },
      { text: "→ WRITE /sites/new-nature-spa · 6 sections committed", delayMs: 1100 },
      { text: "✓ build complete · handoff to verification", delayMs: 800 },
    ],
    accent: {
      bar: "bg-emerald-400",
      step: "bg-emerald-400/15 text-emerald-300",
      glow: "hover:border-emerald-400/30",
      ring: "border-emerald-400/50 shadow-[0_0_32px_rgba(52,211,153,0.18)]",
      log: "text-emerald-300",
    },
  },
  {
    step: 6,
    name: "Verification Agent",
    job: "Check quality",
    reads: ["Preview HTML", "Claim list", "CTA rules"],
    writes: ["QA report", "Verified flag"],
    settleMs: 650,
    logs: [
      { text: "→ READ preview DOM + claim ledger", delayMs: 900 },
      { text: "→ viewport 390×844 · no horizontal overflow", delayMs: 1200 },
      { text: "→ CTA audit · tel: link · above-fold · contrast AA", delayMs: 1300 },
      { text: "→ hours match Places payload · pass", delayMs: 1100 },
      { text: "→ claim check · no invented prices or credentials", delayMs: 1400 },
      { text: "→ WRITE verified=true · qa_report green", delayMs: 850 },
      { text: "✓ verification passed", delayMs: 700 },
    ],
    accent: {
      bar: "bg-amber-400",
      step: "bg-amber-400/15 text-amber-300",
      glow: "hover:border-amber-400/30",
      ring: "border-amber-400/40 shadow-[0_0_24px_rgba(251,191,36,0.12)]",
      log: "text-amber-300/90",
    },
  },
  {
    step: 7,
    name: "Sales Agent",
    job: "Make the call",
    reads: ["Pitch script", "Preview URL", "Approval gate"],
    writes: ["Call outcome", "Follow-up notes"],
    settleMs: 700,
    logs: [
      { text: "→ READ approved pitch + verified preview URL", delayMs: 900 },
      { text: "→ schedule outbound · calling hours Asia/Singapore", delayMs: 1200 },
      { text: "→ dial +65 6262 1006 · ringing…", delayMs: 1800 },
      { text: "→ connected · owner on line · 00:12", delayMs: 1400 },
      { text: "→ share preview · walk booking gap · offer S$140", delayMs: 1600 },
      { text: "→ objection: “we get walk-ins” · handled from pack", delayMs: 1500 },
      { text: "→ owner wants checkout link · interest confirmed", delayMs: 1200 },
      { text: "→ WRITE call_outcome=interested · follow-up notes", delayMs: 900 },
      { text: "✓ sales step done · finance takes over", delayMs: 700 },
    ],
    accent: {
      bar: "bg-orange-400",
      step: "bg-orange-400/15 text-orange-300",
      glow: "hover:border-orange-400/30",
      ring: "border-orange-400/40 shadow-[0_0_24px_rgba(251,146,60,0.12)]",
      log: "text-orange-300/90",
    },
  },
  {
    step: 8,
    name: "Finance Agent",
    job: "Close & collect",
    reads: ["Accepted offer", "Cost ledger", "Checkout"],
    writes: ["Payment record", "Revenue + profit"],
    settleMs: 600,
    logs: [
      { text: "→ READ accepted Launch Site Sprint offer", delayMs: 900 },
      { text: "→ create Stripe Checkout session · amount S$140", delayMs: 1400 },
      { text: "… awaiting mock webhook payment.succeeded", delayMs: 1600 },
      { text: "→ webhook received · payment Paid", delayMs: 1100 },
      { text: "→ WRITE revenue S$140 · delivery cost S$31.80", delayMs: 1000 },
      { text: "→ net profit booked · deal status WON", delayMs: 900 },
      { text: "✓ New Nature Spa closed", delayMs: 700 },
    ],
    accent: {
      bar: "bg-teal-400",
      step: "bg-teal-400/15 text-teal-300",
      glow: "hover:border-teal-400/30",
      ring: "border-teal-400/40 shadow-[0_0_24px_rgba(45,212,191,0.12)]",
      log: "text-teal-300/90",
    },
  },
];

function statusTone(
  phase: RunPhase,
  safetyLock: boolean,
): { label: string; tone: "red" | "blue" | "amber" | "green" | "muted" } {
  if (safetyLock) return { label: "Blocked", tone: "red" };
  if (phase === "running") return { label: "Running", tone: "blue" };
  if (phase === "awaiting") return { label: "Needs you", tone: "amber" };
  if (phase === "queued") return { label: "Queued", tone: "amber" };
  if (phase === "done") return { label: "Done", tone: "green" };
  return { label: "Ready", tone: "muted" };
}

function speakerLabel(speaker: "system" | "ai" | "owner") {
  if (speaker === "ai") return "VentureMint";
  if (speaker === "owner") return "Owner";
  return "System";
}

function ClosedDeal({ item }: { item: DashboardPipelineItem }) {
  return (
    <Link
      href={`/prospects/${item.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.09] via-[#111114] to-[#0d0d10] p-5 sm:p-6"
    >
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge tone="green">Closed</Badge>
          <h2 className="font-display mt-3 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
            {item.name}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            {item.category} · {item.location}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Collected
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-emerald-300 sm:text-3xl">
            <CountUp value={item.estimatedDealValue} format={currency} />
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors group-hover:text-emerald-300">
            Open workspace
            <ArrowRight size={12} aria-hidden />
          </p>
        </div>
      </div>
    </Link>
  );
}

function MoneyStrip({
  revenue,
  profit,
  pipelineValue,
  activeCount,
}: {
  revenue: number;
  profit: number;
  pipelineValue: number;
  activeCount: number;
}) {
  const cells = [
    { label: "Revenue", value: revenue, tone: "text-emerald-300" },
    {
      label: "Net profit",
      value: profit,
      tone: profit >= 0 ? "text-emerald-300" : "text-rose-300",
    },
    {
      label: "Pipeline",
      value: pipelineValue,
      tone: "text-zinc-100",
      hint: `${activeCount} cold calls done`,
    },
  ];

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114] sm:grid-cols-3">
      {cells.map((cell, index) => (
        <div
          key={cell.label}
          className={cn(
            "px-5 py-4",
            index > 0 && "border-t border-white/[0.06] sm:border-t-0 sm:border-l",
          )}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            {cell.label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-mono text-xl font-semibold tabular-nums tracking-tight sm:text-2xl",
              cell.tone,
            )}
          >
            <CountUp value={cell.value} format={currency} />
          </p>
          {"hint" in cell && cell.hint ? (
            <p className="mt-1 text-xs text-zinc-500">{cell.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PipelineRow({ item, index }: { item: DashboardPipelineItem; index: number }) {
  return (
    <Link
      href={`/prospects/${item.id}`}
      className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:gap-4 sm:px-5"
    >
      <span className="w-5 shrink-0 font-mono text-[10px] text-zinc-600">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-400/10 text-sky-300">
        <Phone size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
          {item.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {item.category} · {item.location}
        </p>
      </div>
      <span className="hidden font-mono text-xs tabular-nums text-zinc-500 sm:inline">
        {currency(item.estimatedDealValue)}
      </span>
      <Badge tone="blue">Cold call done</Badge>
    </Link>
  );
}

function NewLeadRow({ prospect, index }: { prospect: Prospect; index: number }) {
  return (
    <Link
      href={`/prospects/${prospect.id}`}
      className="group flex items-center gap-3 bg-amber-400/[0.04] px-4 py-3.5 transition-colors hover:bg-amber-400/[0.07] sm:gap-4 sm:px-5"
    >
      <span className="w-5 shrink-0 font-mono text-[10px] text-amber-500/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
        <Sparkles size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">{prospect.name}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {prospect.category} · {prospect.location}
        </p>
      </div>
      <span className="hidden font-mono text-xs tabular-nums text-zinc-500 sm:inline">
        {currency(prospect.estimatedDealValue)}
      </span>
      <Badge tone="amber">Just found</Badge>
    </Link>
  );
}

function AgentCard({
  agent,
  phase,
  logs,
  transcript,
  safetyLock,
}: {
  agent: AgentDefinition;
  phase: RunPhase;
  logs: string[];
  transcript?: { speaker: "system" | "ai" | "owner"; text: string }[];
  safetyLock: boolean;
}) {
  const status = statusTone(phase, safetyLock);
  const logRef = useRef<HTMLDivElement>(null);
  const isRunning = phase === "running";
  const isAwaiting = phase === "awaiting";
  const isHot = isRunning && agent.name === "Build Agent";

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111114] p-3.5 transition-all duration-300 sm:p-4",
        agent.accent.glow,
        isRunning && agent.accent.ring,
        isAwaiting && "border-amber-400/35 shadow-[0_0_28px_rgba(251,191,36,0.12)]",
        isHot && "bg-emerald-400/[0.04]",
        phase === "queued" && "opacity-70",
        phase === "idle" && "opacity-90",
      )}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 transition-all",
          isAwaiting ? "bg-amber-400" : agent.accent.bar,
          (isRunning || isAwaiting) && "h-1 animate-pulse",
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-md font-mono text-[11px] font-semibold",
            agent.accent.step,
          )}
        >
          {String(agent.step).padStart(2, "0")}
        </span>
        <Badge tone={status.tone}>
          {isRunning ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" aria-hidden />
              {status.label}
            </span>
          ) : (
            status.label
          )}
        </Badge>
      </div>

      <h2 className="mt-2.5 text-sm font-semibold text-zinc-100">{agent.job}</h2>
      <p className="mt-0.5 text-[11px] font-medium text-zinc-500">{agent.name}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className="rounded border border-sky-400/20 bg-sky-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-sky-300/90">
          Read
        </span>
        {agent.reads.map((item) => (
          <span
            key={item}
            className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-400"
          >
            {item}
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-emerald-300/90">
          Write
        </span>
        {agent.writes.map((item) => (
          <span
            key={item}
            className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-400"
          >
            {item}
          </span>
        ))}
      </div>

      <div
        ref={logRef}
        className={cn(
          "mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/40 px-2.5 py-2 font-mono text-[10px] leading-relaxed",
          isRunning || isAwaiting ? "border-white/[0.1]" : "opacity-80",
        )}
        aria-live={isRunning ? "polite" : "off"}
      >
        {logs.length === 0 && !transcript?.length ? (
          <p className="text-zinc-600">
            {phase === "queued"
              ? "waiting for previous agent…"
              : phase === "done"
                ? "— idle —"
                : "standby · click Run full pipeline"}
          </p>
        ) : (
          <ul className="space-y-1">
            {logs.map((line, index) => (
              <li
                key={`${agent.name}-log-${index}-${line.slice(0, 16)}`}
                className={cn(
                  index === logs.length - 1 && (isRunning || isAwaiting) && !transcript?.length
                    ? agent.accent.log
                    : "text-zinc-500",
                )}
              >
                {line}
                {index === logs.length - 1 && isRunning && !transcript?.length ? (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-current align-middle" />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {transcript && transcript.length > 0 ? (
        <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-orange-400/20 bg-orange-400/[0.04] px-2.5 py-2">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wide text-orange-300/80">
            Call transcript
          </p>
          <ul className="space-y-1.5">
            {transcript.map((line, index) => (
              <li key={`${agent.name}-tx-${index}`} className="text-[10px] leading-relaxed">
                <span className="font-mono text-orange-300/70">
                  {speakerLabel(line.speaker)}:
                </span>{" "}
                <span className="text-zinc-300">{line.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function CommandCentreView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, hydrated, discoverNextWave } = useRevenueLoop();

  const pipeline = useMemo(
    () => getDashboardPipeline(state.prospects),
    [state.prospects],
  );
  const metrics = useMemo(
    () => getDashboardMetrics(state.prospects),
    [state.prospects],
  );
  const closed = pipeline.find((item) => item.stage === "closed");
  const active = pipeline.filter((item) => item.stage === "cold_call_done");
  const pipelineIdSet = useMemo(() => new Set<string>(dashboardPipelineIds), []);
  const newlyFound = useMemo(
    () =>
      state.prospects.filter(
        (p) =>
          !pipelineIdSet.has(p.id) &&
          !p.doNotContact &&
          p.agentState !== "REJECTED" &&
          p.agentState !== "WON",
      ),
    [state.prospects, pipelineIdSet],
  );
  const [phases, setPhases] = useState<Record<string, RunPhase>>(() =>
    Object.fromEntries(agentDefinitions.map((a) => [a.name, "idle" as RunPhase])),
  );
  const [logsByAgent, setLogsByAgent] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(agentDefinitions.map((a) => [a.name, [] as string[]])),
  );
  const [transcriptLines, setTranscriptLines] = useState<
    { speaker: "system" | "ai" | "owner"; text: string }[]
  >([]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [awaitingFindings, setAwaitingFindings] = useState(false);
  const [awaitingPitch, setAwaitingPitch] = useState(false);
  const [findingsShared, setFindingsShared] = useState(false);
  const [awaitingCall, setAwaitingCall] = useState(false);
  const [activeStage, setActiveStage] = useState<PipelineStageId>("discover");
  const [activeStep, setActiveStep] = useState(0);
  const cancelRef = useRef(false);
  const findingsResolver = useRef<((approved: boolean) => void) | null>(null);
  const pitchResolver = useRef<((approved: boolean) => void) | null>(null);
  const autoRunStarted = useRef(false);
  const runPipelineRef = useRef<(() => Promise<void>) | null>(null);

  const activeName = useMemo(() => {
    if (awaitingFindings) return "Scoring Agent";
    if (awaitingPitch) return "Strategy Agent";
    if (awaitingCall) return "Sales Agent";
    if (!pipelineRunning || activeStep < 1) return null;
    return agentDefinitions[activeStep - 1]?.name ?? null;
  }, [pipelineRunning, activeStep, awaitingFindings, awaitingPitch, awaitingCall]);

  const statusLine = useMemo(() => {
    if (awaitingFindings) {
      return "Paused · review findings before the pitch is drafted";
    }
    if (awaitingPitch) {
      return "Paused · approve the pitch before Build starts";
    }
    if (awaitingCall) {
      return "Site verified · waiting before outbound call to New Nature Spa";
    }
    if (pipelineRunning && activeName) {
      return `Live · ${activeName} · step ${activeStep}/${agentDefinitions.length}`;
    }
    return "Phase 1: Discover & evaluate (agents 1–3) → findings shared → you approve → pitch → build → call";
  }, [awaitingFindings, awaitingPitch, awaitingCall, pipelineRunning, activeName, activeStep]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      findingsResolver.current?.(false);
      pitchResolver.current?.(false);
    };
  }, []);

  const resetPipeline = () => {
    setPhases(
      Object.fromEntries(agentDefinitions.map((a) => [a.name, "idle" as RunPhase])),
    );
    setLogsByAgent(
      Object.fromEntries(agentDefinitions.map((a) => [a.name, [] as string[]])),
    );
    setTranscriptLines([]);
    setActiveStep(0);
    setActiveStage("discover");
    setAwaitingFindings(false);
    setAwaitingPitch(false);
    setFindingsShared(false);
    setAwaitingCall(false);
  };

  const stopPipeline = () => {
    cancelRef.current = true;
    findingsResolver.current?.(false);
    pitchResolver.current?.(false);
    findingsResolver.current = null;
    pitchResolver.current = null;
    setAwaitingFindings(false);
    setAwaitingPitch(false);
    setAwaitingCall(false);
    setPipelineRunning(false);
    setPhases((prev) => {
      const next = { ...prev };
      for (const agent of agentDefinitions) {
        if (
          next[agent.name] === "running" ||
          next[agent.name] === "queued" ||
          next[agent.name] === "awaiting"
        ) {
          next[agent.name] =
            next[agent.name] === "running" || next[agent.name] === "awaiting"
              ? "done"
              : "idle";
        }
      }
      return next;
    });
  };

  const waitForFindingsApproval = () =>
    new Promise<boolean>((resolve) => {
      findingsResolver.current = resolve;
      setAwaitingFindings(true);
      setActiveStage("findings");
      setPhases((prev) => ({
        ...prev,
        "Scoring Agent": "awaiting",
      }));
    });

  const waitForPitchApproval = () =>
    new Promise<boolean>((resolve) => {
      pitchResolver.current = resolve;
      setAwaitingPitch(true);
      setActiveStage("pitch");
      setPhases((prev) => ({
        ...prev,
        "Strategy Agent": "awaiting",
      }));
    });

  const handleApproveFindings = () => {
    const resolve = findingsResolver.current;
    findingsResolver.current = null;
    setAwaitingFindings(false);
    setActiveStage("pitch");
    setLogsByAgent((prev) => ({
      ...prev,
      "Scoring Agent": [
        ...(prev["Scoring Agent"] ?? []),
        "✓ operator approved findings · Strategy Agent released",
      ],
    }));
    setPhases((prev) => ({ ...prev, "Scoring Agent": "done" }));
    resolve?.(true);
  };

  const handleRejectFindings = () => {
    const resolve = findingsResolver.current;
    if (!resolve) return;
    findingsResolver.current = null;
    setAwaitingFindings(false);
    setLogsByAgent((prev) => ({
      ...prev,
      "Scoring Agent": [
        ...(prev["Scoring Agent"] ?? []),
        "✗ operator rejected findings · pipeline stopped",
      ],
    }));
    setPhases((prev) => ({ ...prev, "Scoring Agent": "done" }));
    resolve(false);
    cancelRef.current = true;
    setPipelineRunning(false);
    setPhases((prev) => {
      const next = { ...prev };
      for (const agent of agentDefinitions) {
        if (next[agent.name] === "queued") next[agent.name] = "idle";
      }
      return next;
    });
  };

  const handleApprovePitch = () => {
    const resolve = pitchResolver.current;
    pitchResolver.current = null;
    setAwaitingPitch(false);
    setActiveStage("build");
    setLogsByAgent((prev) => ({
      ...prev,
      "Strategy Agent": [
        ...(prev["Strategy Agent"] ?? []),
        "✓ operator approved pitch · Build Agent released",
      ],
    }));
    setPhases((prev) => ({ ...prev, "Strategy Agent": "done" }));
    resolve?.(true);
  };

  const handleRejectPitch = () => {
    const resolve = pitchResolver.current;
    if (!resolve) return;
    pitchResolver.current = null;
    setAwaitingPitch(false);
    setLogsByAgent((prev) => ({
      ...prev,
      "Strategy Agent": [
        ...(prev["Strategy Agent"] ?? []),
        "✗ operator rejected pitch · pipeline stopped",
      ],
    }));
    setPhases((prev) => ({ ...prev, "Strategy Agent": "done" }));
    resolve(false);
    cancelRef.current = true;
    setPipelineRunning(false);
    setPhases((prev) => {
      const next = { ...prev };
      for (const agent of agentDefinitions) {
        if (next[agent.name] === "queued") next[agent.name] = "idle";
      }
      return next;
    });
  };

  const stageForStep = (step: number): PipelineStageId => {
    if (step <= 3) return "discover";
    if (step === 4) return "pitch";
    if (step <= 6) return "build";
    if (step === 7) return "call";
    return "close";
  };

  const runPipeline = async () => {
    if (pipelineRunning || state.safetyLock) return;
    cancelRef.current = false;
    setPipelineRunning(true);
    resetPipeline();

    setPhases(
      Object.fromEntries(
        agentDefinitions.map((a, index) => [
          a.name,
          index === 0 ? ("running" as RunPhase) : ("queued" as RunPhase),
        ]),
      ),
    );
    setLogsByAgent(
      Object.fromEntries(agentDefinitions.map((a) => [a.name, [] as string[]])),
    );

    for (let i = 0; i < agentDefinitions.length; i++) {
      if (cancelRef.current) break;
      const agent = agentDefinitions[i];
      setActiveStep(i + 1);
      setActiveStage(stageForStep(agent.step));

      setPhases((prev) => ({
        ...prev,
        [agent.name]: "running",
        ...Object.fromEntries(
          agentDefinitions.slice(i + 1).map((a) => [a.name, "queued" as RunPhase]),
        ),
      }));
      setLogsByAgent((prev) => ({ ...prev, [agent.name]: [] }));

      for (const line of agent.logs) {
        if (cancelRef.current) break;
        await new Promise((resolve) => setTimeout(resolve, line.delayMs));
        if (cancelRef.current) break;
        setLogsByAgent((prev) => ({
          ...prev,
          [agent.name]: [...(prev[agent.name] ?? []), line.text],
        }));

        if (
          agent.name === "Sales Agent" &&
          line.text.includes("connected · owner on line")
        ) {
          setTranscriptLines([]);
          for (const entry of callTranscript) {
            if (cancelRef.current) break;
            await new Promise((resolve) => setTimeout(resolve, entry.delayMs));
            setTranscriptLines((prev) => [
              ...prev,
              { speaker: entry.speaker, text: entry.text },
            ]);
          }
        }
      }

      if (cancelRef.current) break;

      await new Promise((resolve) => setTimeout(resolve, agent.settleMs));
      if (cancelRef.current) break;

      if (agent.gateAfter === "findings") {
        setFindingsShared(true);
        setLogsByAgent((prev) => ({
          ...prev,
          "Scoring Agent": [
            ...(prev["Scoring Agent"] ?? []),
            "→ findings shared with operator · awaiting approval",
          ],
        }));
        const approved = await waitForFindingsApproval();
        if (!approved || cancelRef.current) break;
      } else if (agent.gateAfter === "pitch") {
        const approved = await waitForPitchApproval();
        if (!approved || cancelRef.current) break;
      } else if (agent.step === 6) {
        setPhases((prev) => ({ ...prev, [agent.name]: "done" }));
        setAwaitingCall(true);
        setActiveStage("call");
        setLogsByAgent((prev) => ({
          ...prev,
          "Verification Agent": [
            ...(prev["Verification Agent"] ?? []),
            "→ site verified · waiting before outbound call…",
          ],
        }));
        await new Promise((resolve) => setTimeout(resolve, 2800));
        setAwaitingCall(false);
        setLogsByAgent((prev) => ({
          ...prev,
          "Sales Agent": [
            ...(prev["Sales Agent"] ?? []),
            "→ outbound call cleared · dialling owner",
          ],
        }));
      } else {
        setPhases((prev) => ({ ...prev, [agent.name]: "done" }));
      }
    }

    setPipelineRunning(false);
    setAwaitingFindings(false);
    setAwaitingPitch(false);
    setAwaitingCall(false);
    setActiveStep(0);
    setActiveStage("close");
    discoverNextWave();
  };

  useEffect(() => {
    runPipelineRef.current = runPipeline;
  });

  useEffect(() => {
    if (!hydrated || autoRunStarted.current) return;
    if (searchParams.get("run") !== "1") return;
    if (state.safetyLock || pipelineRunning) return;

    autoRunStarted.current = true;
    router.replace("/dashboard");
    void runPipelineRef.current?.();
  }, [hydrated, searchParams, state.safetyLock, pipelineRunning, router]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <div className="skeleton min-h-[20rem] flex-1 rounded-xl" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
            Command centre
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-zinc-500">
            {statusLine}
            <span className="text-zinc-600">
              {" "}
              · {metrics.closedDeals} closed · {metrics.activePipeline} in pipeline
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pipelineRunning || awaitingFindings || awaitingPitch || awaitingCall ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={stopPipeline}
              icon={<Square size={13} />}
            >
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => void runPipeline()}
              disabled={state.safetyLock}
              icon={<Play size={14} />}
            >
              Run full pipeline
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {pipelineStages.map((stage) => {
          const isActive = activeStage === stage.id;
          const isPast =
            pipelineStages.findIndex((s) => s.id === activeStage) >
            pipelineStages.findIndex((s) => s.id === stage.id);
          return (
            <span
              key={stage.id}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                isActive
                  ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                  : isPast
                    ? "border-white/10 bg-white/[0.04] text-zinc-400"
                    : "border-white/[0.06] text-zinc-600",
              )}
            >
              {stage.label}
            </span>
          );
        })}
      </div>

      {findingsShared ? (
        <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.06] px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                Findings shared
              </p>
              <p className="mt-1.5 text-sm text-zinc-200">
                <span className="font-medium">{findingsSummary.prospect}</span> ranked #1
                · {findingsSummary.location} · score {findingsSummary.score}/100
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Gap: {findingsSummary.gap}. {findingsSummary.queued} local businesses
                queued after evaluation.
              </p>
            </div>
            {awaitingFindings ? (
              <Badge tone="amber">Awaiting your review</Badge>
            ) : (
              <Badge tone="green">Approved</Badge>
            )}
          </div>
        </div>
      ) : null}

      {awaitingCall ? (
        <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.06] px-4 py-3 text-sm text-orange-100/90">
          Site verified. Waiting before the Sales Agent places the outbound call…
        </div>
      ) : null}

      <div className="grid min-h-0 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-2">
        {agentDefinitions.map((agent) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            phase={phases[agent.name] ?? "idle"}
            logs={logsByAgent[agent.name] ?? []}
            transcript={
              agent.name === "Sales Agent" ? transcriptLines : undefined
            }
            safetyLock={state.safetyLock}
          />
        ))}
      </div>

      <MoneyStrip
        revenue={metrics.revenue}
        profit={metrics.netProfit}
        pipelineValue={metrics.pipelineValue}
        activeCount={metrics.activePipeline}
      />

      {closed ? <ClosedDeal item={closed} /> : null}

      {newlyFound.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-amber-400/20 bg-[#111114]">
          <div className="flex items-center justify-between gap-3 border-b border-amber-400/15 px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Just found</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {newlyFound.length} new from the latest run
              </p>
            </div>
            <Badge tone="amber">New</Badge>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {newlyFound.map((prospect, index) => (
              <NewLeadRow key={prospect.id} prospect={prospect} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Active pipeline</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {active.length} businesses · cold call complete
            </p>
          </div>
          <Link
            href="/prospects"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-emerald-300"
          >
            All prospects
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {active.map((item, index) => (
            <PipelineRow key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      <Dialog
        open={awaitingFindings}
        onClose={handleRejectFindings}
        title="Review findings before pitch"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-400">
            Agents 1–3 finished. Discovery, research and scoring are complete for{" "}
            <span className="text-zinc-200">{findingsSummary.prospect}</span>. Approve
            to let Strategy draft the pitch.
          </p>

          <dl className="grid gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Top prospect</dt>
              <dd className="text-zinc-200">{findingsSummary.prospect}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Location</dt>
              <dd className="text-zinc-200">{findingsSummary.location}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Score</dt>
              <dd className="font-mono text-zinc-200">{findingsSummary.score}/100</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Gap</dt>
              <dd className="max-w-[14rem] text-right text-xs text-zinc-300">
                {findingsSummary.gap}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Queue</dt>
              <dd className="font-mono text-zinc-200">{findingsSummary.queued} businesses</dd>
            </div>
          </dl>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleRejectFindings} icon={<X size={14} />}>
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApproveFindings}
              icon={<Check size={14} />}
            >
              Approve & draft pitch
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={awaitingPitch}
        onClose={handleRejectPitch}
        title="Approve pitch before build"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-400">
            Strategy finished for <span className="text-zinc-200">New Nature Spa</span>.
            Confirm the package before the Build Agent spends compute on a live preview.
          </p>

          <dl className="grid gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Package</dt>
              <dd className="text-zinc-200">Launch Site Sprint</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Setup</dt>
              <dd className="font-mono text-zinc-200">S$140</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Monthly</dt>
              <dd className="font-mono text-zinc-200">S$49</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Score</dt>
              <dd className="font-mono text-zinc-200">79/100</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Opening</dt>
              <dd className="max-w-[16rem] text-right text-xs leading-relaxed text-zinc-300">
                Local spa in Pandan Gardens with no website — booking stays phone-only.
              </dd>
            </div>
          </dl>

          <p className="text-xs text-zinc-500">
            Approving releases Build → Verification → wait → Sales call → Finance.
            Rejecting stops the pipeline here.
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={handleRejectPitch}
              icon={<X size={14} />}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApprovePitch}
              icon={<Check size={14} />}
            >
              Approve & build
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
