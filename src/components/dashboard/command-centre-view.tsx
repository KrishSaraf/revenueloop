"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Loader2, MapPin, Phone, Play, Sparkles, Square, X } from "lucide-react";
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
import {
  discoveredProspects,
  discoveryStats,
  runProspect,
  runProspectOffer,
  type DiscoveredProspect,
} from "@/lib/pipeline-demo";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import type { AgentName, Prospect } from "@/lib/types";
import {
  LiveOutboundCall,
  VENTUREMINT_OUTBOUND_LINE,
  type LiveCallStatus,
} from "@/components/shared/live-outbound-call";
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
      { text: "→ open discovery job · region=SG · neighbourhoods sweep", delayMs: 900 },
      { text: "→ READ maps tiles · Toa Payoh / Bedok / Bugis", delayMs: 1400 },
      { text: "… waiting on maps tile 4/8 · 368ms", delayMs: 1600 },
      { text: "→ filter website_status in {none, broken, placeholder}", delayMs: 1100 },
      { text: "→ skip closed accounts · New Nature Spa already WON", delayMs: 1000 },
      { text: "→ candidate Petal Atelier · florist · Bugis · no website", delayMs: 1300 },
      { text: "→ candidate Morning Bakes · bakery · Bedok · DM orders only", delayMs: 1200 },
      { text: "→ candidate Toa Payoh Family Dental · dental · weak site", delayMs: 1400 },
      { text: "→ WRITE 3 prospects · gap signals captured", delayMs: 900 },
      { text: "✓ discovery pass · 3 fresh leads · 142 POIs scanned", delayMs: 800 },
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
      { text: "→ READ prospect-toa-payoh-dental from queue (rank #1)", delayMs: 800 },
      { text: "→ fetch Google Places details · Toa Payoh Family Dental", delayMs: 1500 },
      { text: "… Places API 240ms · rating 4.9 · reviews=203", delayMs: 1200 },
      { text: "→ parse hours · open until 18:00 · phone confirmed", delayMs: 1100 },
      { text: "→ site audit · weak_website · no booking CTA found", delayMs: 1600 },
      { text: "→ social sweep · no owned channels · phone-only enquiries", delayMs: 1400 },
      { text: "→ evidence[1] screenshot site · fails mobile-friendly check", delayMs: 1000 },
      { text: "→ evidence[2] review snippet · trust high, funnel weak", delayMs: 1100 },
      { text: "→ gap model: no booking path · services list incomplete", delayMs: 900 },
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
      { text: "→ booking_value model · dental category uplift +14", delayMs: 1200 },
      { text: "→ competitor density · 3 nearby clinics with online booking", delayMs: 1400 },
      { text: "→ score pass 1 · 84/100 · booking gap weighted high", delayMs: 1100 },
      { text: "→ score pass 2 · 88/100 · confidence band ±3", delayMs: 1000 },
      { text: "→ rank batch · Toa Payoh Family Dental = #1 of 3", delayMs: 900 },
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
      { text: "→ READ score 88 + gap list + category price band", delayMs: 900 },
      { text: "→ price band SG dental · setup S$120–180 · pick S$180", delayMs: 1300 },
      { text: "→ draft opening line · local + specific to Toa Payoh", delayMs: 1400 },
      { text: "→ value prop · appointment telebot vs phone-only scheduling", delayMs: 1200 },
      { text: "→ objection pack · “patients prefer calling” · “we have a site”", delayMs: 1500 },
      { text: `→ package Launch Site Sprint · S$${runProspectOffer.anchorAmount} anchor · S$${runProspectOffer.annualHosting}/year hosting`, delayMs: 1100 },
      { text: "→ conversion prior 0.58 · similar closed clinic deals", delayMs: 1000 },
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
      { text: "→ generate hero · Toa Payoh Family Dental · Toa Payoh", delayMs: 1600 },
      { text: "… LLM section draft hero · 2.1s", delayMs: 2100 },
      { text: "→ services strip · check-up · scaling · emergency slots", delayMs: 1500 },
      { text: "… drafting telebot booking flow · 1.8s", delayMs: 1800 },
      { text: "→ hours strip + call CTA + WhatsApp fallback", delayMs: 1300 },
      { text: "→ theme tokens · clinical calm · soft sky accents", delayMs: 1400 },
      { text: "→ appointment request panel · form validation rules", delayMs: 1500 },
      { text: "→ trust strip from public reviews only", delayMs: 1200 },
      { text: "→ optimize LCP · critical CSS · lazy below-fold", delayMs: 1600 },
      { text: `→ WRITE /sites/${runProspect.siteSlug} · telebot + site live`, delayMs: 1100 },
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
      { text: `→ outbound ${VENTUREMINT_OUTBOUND_LINE} · ringing ${runProspect.phone}…`, delayMs: 1800 },
      { text: "→ connected · owner on line · 00:12", delayMs: 1400 },
      { text: `→ share preview · walk booking gap · offer S$${runProspectOffer.setupAmount}`, delayMs: 1600 },
      { text: "→ objection: “patients just call us” · handled from pack", delayMs: 1500 },
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
      { text: `→ create Stripe Checkout session · amount S$${runProspectOffer.setupAmount}`, delayMs: 1400 },
      { text: "… awaiting Stripe webhook payment.succeeded", delayMs: 1600 },
      { text: "→ webhook received · payment Paid", delayMs: 1100 },
      { text: `→ WRITE revenue S$${runProspectOffer.setupAmount} · delivery cost S$${runProspectOffer.deliveryCost.toFixed(2)}`, delayMs: 1000 },
      { text: "→ net profit booked · deal status WON", delayMs: 900 },
      { text: "✓ Toa Payoh Family Dental closed", delayMs: 700 },
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

function ClosedDeal({
  item,
  animate = true,
}: {
  item: DashboardPipelineItem;
  animate?: boolean;
}) {
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
            <CountUp
              value={item.estimatedDealValue}
              format={currency}
              durationMs={animate ? 600 : 0}
            />
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
  animate = true,
}: {
  revenue: number;
  profit: number;
  pipelineValue: number;
  activeCount: number;
  animate?: boolean;
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
            <CountUp
              value={cell.value}
              format={currency}
              durationMs={animate ? 600 : 0}
            />
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

function ProspectScoreBar({ score, highlight }: { score: number; highlight?: boolean }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-zinc-500">Opportunity score</span>
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            highlight ? "text-emerald-300" : "text-zinc-400",
          )}
        >
          {score}/100
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            highlight ? "bg-emerald-400" : "bg-zinc-600",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function FindingsProspectCard({
  prospect,
  awaiting,
  compact,
  showSiteLink,
  selectable,
  selected,
  onSelect,
}: {
  prospect: DiscoveredProspect;
  awaiting?: boolean;
  compact?: boolean;
  showSiteLink?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const isHighlighted = selectable ? Boolean(selected) : prospect.rank === 1;

  return (
    <article
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? () => onSelect?.(prospect.id) : undefined}
      onKeyDown={
        selectable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.(prospect.id);
              }
            }
          : undefined
      }
      aria-pressed={selectable ? isHighlighted : undefined}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300",
        isHighlighted
          ? "border-emerald-400/30 bg-gradient-to-br from-emerald-400/[0.08] via-[#111114] to-[#0d0d10]"
          : "border-white/[0.08] bg-[#111114]",
        awaiting && isHighlighted && "ring-1 ring-amber-400/40",
        selectable && !isHighlighted && "cursor-pointer hover:border-emerald-400/20 hover:bg-white/[0.02]",
        selectable && isHighlighted && "cursor-pointer ring-1 ring-emerald-400/35",
        compact && "p-3",
      )}
    >
      {isHighlighted ? (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400" aria-hidden />
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-md font-mono text-[11px] font-semibold",
            isHighlighted ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-zinc-500",
          )}
        >
          #{prospect.rank}
        </span>
        {isHighlighted ? <Badge tone="green">Top pick</Badge> : null}
      </div>

      <h3
        className={cn(
          "mt-3 font-semibold tracking-tight text-zinc-100",
          compact ? "text-sm" : "text-base",
        )}
      >
        {prospect.name}
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        {prospect.category}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={11} aria-hidden />
          {prospect.location}
        </span>
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-400">{prospect.gap}</p>

      <ProspectScoreBar score={prospect.score} highlight={isHighlighted} />

      {isHighlighted && showSiteLink && prospect.siteSlug ? (
        <Link
          href={`/sites/${prospect.siteSlug}`}
          target="_blank"
          onClick={(event) => event.stopPropagation()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/15"
        >
          <ExternalLink size={12} aria-hidden />
          {prospect.siteLabel}
        </Link>
      ) : null}
    </article>
  );
}

function FindingsPanel({
  awaiting,
  variant = "inline",
  showSiteLink = false,
  selectable,
  selectedId,
  onSelect,
  activeProspect,
}: {
  awaiting?: boolean;
  variant?: "inline" | "dialog";
  showSiteLink?: boolean;
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  activeProspect?: DiscoveredProspect;
}) {
  const pursueName = activeProspect?.name ?? runProspect.name;

  if (variant === "dialog") {
    return (
      <div className="grid gap-3">
        {discoveredProspects.map((prospect) => (
          <FindingsProspectCard
            key={prospect.id}
            prospect={prospect}
            awaiting={awaiting}
            compact
            showSiteLink={showSiteLink}
            selectable={selectable}
            selected={prospect.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        variant === "inline"
          ? "border-violet-400/20 bg-gradient-to-br from-violet-400/[0.05] via-[#111114] to-[#0d0d10]"
          : "border-white/[0.08] bg-[#111114]",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-5",
          variant === "inline" ? "border-violet-400/15" : "border-white/[0.08]",
        )}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
            Discovery findings
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-zinc-100">
            3 businesses found · 1 recommended
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {discoveryStats.scanned} scanned across {discoveryStats.region}. Agents 1–3
            ranked <span className="text-zinc-300">{pursueName}</span> to pursue.
          </p>
        </div>
        {awaiting ? (
          <Badge tone="amber">Awaiting your review</Badge>
        ) : (
          <Badge tone="green">Approved</Badge>
        )}
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {discoveredProspects.map((prospect) => (
          <FindingsProspectCard
            key={prospect.id}
            prospect={prospect}
            awaiting={awaiting}
            compact={false}
            showSiteLink={showSiteLink}
            selected={prospect.id === (selectedId ?? activeProspect?.id ?? runProspect.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SitePreviewBanner({ prospect }: { prospect: DiscoveredProspect }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-gradient-to-r from-emerald-400/[0.08] to-sky-400/[0.06] px-4 py-3.5 sm:px-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
          Build complete
        </p>
        <p className="mt-1 text-sm text-zinc-200">
          <span className="font-medium">{prospect.name}</span>
          {prospect.siteLabel ? ` — ${prospect.siteLabel}` : ""}
        </p>
      </div>
      {prospect.siteSlug ? (
        <Link href={`/sites/${prospect.siteSlug}`} target="_blank">
          <Button size="sm" variant="primary" icon={<ExternalLink size={13} />}>
            Open live preview
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

function AgentCard({
  agent,
  phase,
  logs,
  liveCall,
  safetyLock,
}: {
  agent: AgentDefinition;
  phase: RunPhase;
  logs: string[];
  liveCall?: {
    status: LiveCallStatus;
    seconds: number;
    calleeName: string;
    calleePhone: string;
    outcome?: string;
  };
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
        {logs.length === 0 && (!liveCall || liveCall.status === "idle") ? (
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
                  index === logs.length - 1 &&
                  (isRunning || isAwaiting) &&
                  (!liveCall || liveCall.status === "idle")
                    ? agent.accent.log
                    : "text-zinc-500",
                )}
              >
                {line}
                {index === logs.length - 1 &&
                isRunning &&
                (!liveCall || liveCall.status === "idle") ? (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-current align-middle" />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {liveCall && liveCall.status !== "idle" ? (
        <div className="mt-2">
          <LiveOutboundCall
            compact
            status={liveCall.status}
            seconds={liveCall.seconds}
            calleeName={liveCall.calleeName}
            calleePhone={liveCall.calleePhone}
            outcome={liveCall.outcome}
          />
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
  const [liveCall, setLiveCall] = useState<{
    status: LiveCallStatus;
    seconds: number;
    calleeName: string;
    calleePhone: string;
    outcome?: string;
  }>({
    status: "idle",
    seconds: 0,
    calleeName: runProspect.name,
    calleePhone: runProspect.phone,
  });
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [awaitingFindings, setAwaitingFindings] = useState(false);
  const [awaitingPitch, setAwaitingPitch] = useState(false);
  const [findingsShared, setFindingsShared] = useState(false);
  const [awaitingCall, setAwaitingCall] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState(runProspect.id);
  const [pipelineProspect, setPipelineProspect] = useState<DiscoveredProspect>(runProspect);
  const [activeStage, setActiveStage] = useState<PipelineStageId>("discover");
  const [activeStep, setActiveStep] = useState(0);
  const cancelRef = useRef(false);
  const findingsResolver = useRef<((approved: boolean) => void) | null>(null);
  const pitchResolver = useRef<((approved: boolean) => void) | null>(null);
  const autoRunStarted = useRef(false);
  const runPipelineRef = useRef<(() => Promise<void>) | null>(null);
  const frozenMetricsRef = useRef(metrics);

  const pipelineBusy =
    pipelineRunning || awaitingFindings || awaitingPitch || awaitingCall;

  if (!pipelineBusy) {
    frozenMetricsRef.current = metrics;
  }

  const displayMetrics = pipelineBusy ? frozenMetricsRef.current : metrics;

  const selectedFinding = useMemo(
    () =>
      discoveredProspects.find((prospect) => prospect.id === selectedFindingId) ??
      discoveredProspects[0],
    [selectedFindingId],
  );

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      findingsResolver.current?.(false);
      pitchResolver.current?.(false);
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  const resetPipeline = () => {
    setPhases(
      Object.fromEntries(agentDefinitions.map((a) => [a.name, "idle" as RunPhase])),
    );
    setLogsByAgent(
      Object.fromEntries(agentDefinitions.map((a) => [a.name, [] as string[]])),
    );
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setLiveCall({
      status: "idle",
      seconds: 0,
      calleeName: runProspect.name,
      calleePhone: runProspect.phone,
    });
    setSelectedFindingId(runProspect.id);
    setPipelineProspect(runProspect);
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
      setSelectedFindingId(runProspect.id);
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
    const approved = selectedFinding;
    findingsResolver.current = null;
    setPipelineProspect(approved);
    setAwaitingFindings(false);
    setActiveStage("pitch");
    setLiveCall((prev) => ({
      ...prev,
      calleeName: approved.name,
      calleePhone: approved.phone,
    }));
    setLogsByAgent((prev) => ({
      ...prev,
      "Scoring Agent": [
        ...(prev["Scoring Agent"] ?? []),
        `✓ operator approved ${approved.name} · Strategy Agent released`,
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
    frozenMetricsRef.current = getDashboardMetrics(state.prospects);
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

        if (agent.name === "Sales Agent" && line.text.includes("outbound")) {
          setLiveCall((prev) => ({ ...prev, status: "dialling" }));
          await new Promise((resolve) => setTimeout(resolve, 700));
          if (cancelRef.current) break;
          setLiveCall((prev) => ({ ...prev, status: "ringing" }));
        }

        if (
          agent.name === "Sales Agent" &&
          line.text.includes("connected · owner on line")
        ) {
          setLiveCall((prev) => ({ ...prev, status: "connected", seconds: 12 }));
          if (callTimerRef.current) clearInterval(callTimerRef.current);
          callTimerRef.current = setInterval(() => {
            setLiveCall((prev) =>
              prev.status === "connected"
                ? { ...prev, seconds: prev.seconds + 1 }
                : prev,
            );
          }, 1000);
        }

        if (agent.name === "Sales Agent" && line.text.includes("✓ sales step done")) {
          if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
          }
          setLiveCall((prev) => ({
            ...prev,
            status: "ended",
            outcome:
              `Owner agreed S$${runProspectOffer.setupAmount} one-time + S$${runProspectOffer.annualHosting}/year. Checkout link sent.`,
          }));
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

  const showSitePreview =
    Boolean(pipelineProspect.siteSlug) &&
    (phases["Build Agent"] === "done" ||
      phases["Verification Agent"] === "done" ||
      phases["Verification Agent"] === "running" ||
      phases["Sales Agent"] === "running" ||
      phases["Sales Agent"] === "done" ||
      phases["Finance Agent"] === "running" ||
      phases["Finance Agent"] === "done");

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

      <MoneyStrip
        revenue={displayMetrics.revenue}
        profit={displayMetrics.netProfit}
        pipelineValue={displayMetrics.pipelineValue}
        activeCount={displayMetrics.activePipeline}
        animate={!pipelineBusy}
      />

      {closed ? <ClosedDeal item={closed} animate={!pipelineBusy} /> : null}

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
        <FindingsPanel
          awaiting={awaitingFindings}
          showSiteLink={showSitePreview}
          activeProspect={pipelineProspect}
        />
      ) : null}

      {showSitePreview ? <SitePreviewBanner prospect={pipelineProspect} /> : null}

      {awaitingCall ? (
        <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.06] px-4 py-3 text-sm text-orange-100/90">
          Site verified. Waiting before the Sales Agent calls {pipelineProspect.name}…
        </div>
      ) : null}

      <div className="grid min-h-0 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:grid-rows-2">
        {agentDefinitions.map((agent) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            phase={phases[agent.name] ?? "idle"}
            logs={logsByAgent[agent.name] ?? []}
            liveCall={agent.name === "Sales Agent" ? liveCall : undefined}
            safetyLock={state.safetyLock}
          />
        ))}
      </div>

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
        title="Review discovery findings"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-400">
            Agents 1–3 finished. Three businesses were found and scored. Select a
            business to approve as the top pick and let Strategy draft the pitch.
          </p>

          <FindingsPanel
            awaiting
            variant="dialog"
            showSiteLink={showSitePreview}
            selectable
            selectedId={selectedFindingId}
            onSelect={setSelectedFindingId}
          />

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleRejectFindings} icon={<X size={14} />}>
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={handleApproveFindings}
              icon={<Check size={14} />}
            >
              Approve {selectedFinding.name}
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
            Strategy finished for{" "}
            <span className="text-zinc-200">{pipelineProspect.name}</span>. Confirm the
            package before the Build Agent spends compute on a live preview.
          </p>

          <dl className="grid gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Package</dt>
              <dd className="text-zinc-200">{runProspectOffer.packageName}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Setup</dt>
              <dd className="font-mono text-zinc-200">
                {currency(runProspectOffer.setupAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Annual hosting</dt>
              <dd className="font-mono text-zinc-200">
                {currency(runProspectOffer.annualHosting)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Score</dt>
              <dd className="font-mono text-zinc-200">{pipelineProspect.score}/100</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Opening</dt>
              <dd className="max-w-[16rem] text-right text-xs leading-relaxed text-zinc-300">
                {pipelineProspect.category} in {pipelineProspect.location} —{" "}
                {pipelineProspect.gap.toLowerCase()}
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
