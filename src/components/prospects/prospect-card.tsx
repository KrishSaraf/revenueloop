"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Cake,
  Coffee,
  Dumbbell,
  Flower2,
  GraduationCap,
  HeartPulse,
  Leaf,
  Sparkles,
  Stethoscope,
  Trophy,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { stateTone } from "@/lib/presentation";
import type { AgentState, Prospect } from "@/lib/types";
import { stateLabels } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

type CardVariant =
  | "hero"
  | "ribbon"
  | "tower"
  | "band"
  | "tile"
  | "split"
  | "orbit"
  | "ledger"
  | "pulse"
  | "frame"
  | "stack"
  | "wave";

interface CategoryTheme {
  icon: LucideIcon;
  label: string;
  accent: string;
  accentMuted: string;
  border: string;
  glow: string;
  gradient: string;
  pattern: string;
  scoreColor: string;
}

const categoryThemes: Record<string, CategoryTheme> = {
  "Massage spa": {
    icon: Leaf,
    label: "Wellness",
    accent: "text-emerald-300",
    accentMuted: "text-emerald-400/70",
    border: "border-emerald-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    pattern: "radial-gradient(circle at 80% 20%, rgba(52,211,153,0.18), transparent 45%)",
    scoreColor: "#34d399",
  },
  Cafe: {
    icon: Coffee,
    label: "Hospitality",
    accent: "text-amber-300",
    accentMuted: "text-amber-400/70",
    border: "border-amber-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(251,191,36,0.14)]",
    gradient: "from-amber-500/25 via-orange-500/10 to-transparent",
    pattern: "radial-gradient(circle at 12% 88%, rgba(251,191,36,0.2), transparent 50%)",
    scoreColor: "#fbbf24",
  },
  "Tuition centre": {
    icon: GraduationCap,
    label: "Education",
    accent: "text-sky-300",
    accentMuted: "text-sky-400/70",
    border: "border-sky-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]",
    gradient: "from-sky-500/20 via-indigo-500/10 to-transparent",
    pattern: "linear-gradient(135deg, rgba(56,189,248,0.12) 0%, transparent 60%)",
    scoreColor: "#38bdf8",
  },
  "Fitness studio": {
    icon: Dumbbell,
    label: "Fitness",
    accent: "text-orange-300",
    accentMuted: "text-orange-400/70",
    border: "border-orange-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(251,146,60,0.16)]",
    gradient: "from-orange-500/25 via-rose-500/10 to-transparent",
    pattern: "radial-gradient(circle at 90% 80%, rgba(251,146,60,0.22), transparent 40%)",
    scoreColor: "#fb923c",
  },
  "Nail salon": {
    icon: Sparkles,
    label: "Beauty",
    accent: "text-fuchsia-300",
    accentMuted: "text-fuchsia-400/70",
    border: "border-fuchsia-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(232,121,249,0.16)]",
    gradient: "from-fuchsia-500/20 via-pink-500/10 to-transparent",
    pattern: "radial-gradient(circle at 20% 30%, rgba(232,121,249,0.2), transparent 55%)",
    scoreColor: "#e879f9",
  },
  "Dental clinic": {
    icon: Stethoscope,
    label: "Healthcare",
    accent: "text-cyan-300",
    accentMuted: "text-cyan-400/70",
    border: "border-cyan-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(34,211,238,0.14)]",
    gradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
    pattern: "linear-gradient(180deg, rgba(34,211,238,0.1) 0%, transparent 70%)",
    scoreColor: "#22d3ee",
  },
  Bakery: {
    icon: Cake,
    label: "Food retail",
    accent: "text-yellow-300",
    accentMuted: "text-yellow-400/70",
    border: "border-yellow-400/20",
    glow: "hover:shadow-[0_0_40px_rgba(250,204,21,0.12)]",
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    pattern: "radial-gradient(circle at 70% 15%, rgba(250,204,21,0.18), transparent 45%)",
    scoreColor: "#facc15",
  },
  "Cleaning service": {
    icon: Sparkles,
    label: "Services",
    accent: "text-teal-300",
    accentMuted: "text-teal-400/70",
    border: "border-teal-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(45,212,191,0.14)]",
    gradient: "from-teal-500/20 via-emerald-500/10 to-transparent",
    pattern: "linear-gradient(45deg, rgba(45,212,191,0.1) 25%, transparent 25%)",
    scoreColor: "#2dd4bf",
  },
  Restaurant: {
    icon: UtensilsCrossed,
    label: "Dining",
    accent: "text-rose-300",
    accentMuted: "text-rose-400/70",
    border: "border-rose-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(251,113,133,0.14)]",
    gradient: "from-rose-500/20 via-red-500/10 to-transparent",
    pattern: "radial-gradient(circle at 50% 0%, rgba(251,113,133,0.15), transparent 60%)",
    scoreColor: "#fb7185",
  },
  "Car workshop": {
    icon: Wrench,
    label: "Automotive",
    accent: "text-zinc-300",
    accentMuted: "text-zinc-400",
    border: "border-zinc-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(161,161,170,0.12)]",
    gradient: "from-zinc-500/25 via-slate-500/10 to-transparent",
    pattern: "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 12px)",
    scoreColor: "#a1a1aa",
  },
  Florist: {
    icon: Flower2,
    label: "Retail",
    accent: "text-pink-300",
    accentMuted: "text-pink-400/70",
    border: "border-pink-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(244,114,182,0.14)]",
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    pattern: "radial-gradient(circle at 85% 60%, rgba(244,114,182,0.18), transparent 50%)",
    scoreColor: "#f472b6",
  },
  "Physiotherapy clinic": {
    icon: HeartPulse,
    label: "Clinic",
    accent: "text-lime-300",
    accentMuted: "text-lime-400/70",
    border: "border-lime-400/25",
    glow: "hover:shadow-[0_0_40px_rgba(163,230,53,0.12)]",
    gradient: "from-lime-500/15 via-emerald-500/10 to-transparent",
    pattern: "linear-gradient(120deg, rgba(163,230,53,0.08) 0%, transparent 55%)",
    scoreColor: "#a3e635",
  },
};

const defaultTheme: CategoryTheme = {
  icon: Activity,
  label: "Local business",
  accent: "text-violet-300",
  accentMuted: "text-violet-400/70",
  border: "border-violet-400/25",
  glow: "hover:shadow-[0_0_40px_rgba(167,139,250,0.12)]",
  gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
  pattern: "radial-gradient(circle at 30% 70%, rgba(167,139,250,0.15), transparent 50%)",
  scoreColor: "#a78bfa",
};

const variantByIndex: CardVariant[] = [
  "hero",
  "ribbon",
  "tower",
  "band",
  "tile",
  "split",
  "orbit",
  "ledger",
  "pulse",
  "frame",
  "stack",
  "wave",
];

function getTheme(category: string) {
  return categoryThemes[category] ?? defaultTheme;
}

function getVariant(index: number, agentState: AgentState): CardVariant {
  if (agentState === "WON") return "hero";
  return variantByIndex[index % variantByIndex.length];
}

function gridClass(variant: CardVariant): string {
  switch (variant) {
    case "hero":
      return "sm:col-span-2 lg:col-span-2 lg:row-span-2";
    case "tower":
    case "stack":
      return "sm:row-span-2";
    case "band":
    case "wave":
      return "sm:col-span-2";
    default:
      return "";
  }
}

function GapPills({ gaps, theme }: { gaps: string[]; theme: CategoryTheme }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {gaps.slice(0, 3).map((gap) => (
        <span
          key={gap}
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-medium",
            theme.border,
            "bg-black/20 text-zinc-400",
          )}
        >
          {gap}
        </span>
      ))}
    </div>
  );
}

function ScoreBadge({
  score,
  theme,
  large = false,
}: {
  score: number;
  theme: CategoryTheme;
  large?: boolean;
}) {
  if (large) {
    return (
      <div className="flex flex-col items-center gap-1">
        <ProgressRing value={score} size={72} />
        <span className={cn("font-mono text-[10px] uppercase tracking-wider", theme.accentMuted)}>
          Score
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <ProgressRing value={score} size={44} />
      <div>
        <p className={cn("font-mono text-lg font-semibold tabular-nums", theme.accent)}>
          {score}
        </p>
        <p className="text-[9px] uppercase tracking-wider text-zinc-600">/ 100</p>
      </div>
    </div>
  );
}

function CardShell({
  prospect,
  theme,
  variant,
  rank,
  onSelect,
  children,
  className,
}: {
  prospect: Prospect;
  theme: CategoryTheme;
  variant: CardVariant;
  rank: number;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  const Icon = theme.icon;
  const isWon = prospect.agentState === "WON";

  return (
    <Link
      href={`/prospects/${prospect.id}`}
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-[11rem] flex-col overflow-hidden rounded-2xl border bg-[#0e0e11] transition-all duration-300",
        theme.border,
        theme.glow,
        "hover:-translate-y-0.5 hover:border-white/20",
        gridClass(variant),
        className,
      )}
    >
      <div
        className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", theme.gradient)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: theme.pattern }}
        aria-hidden
      />

      {variant === "ribbon" ? (
        <div
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: theme.scoreColor }}
          aria-hidden
        />
      ) : null}

      {variant === "orbit" ? (
        <Icon
          className={cn(
            "pointer-events-none absolute -right-4 -top-4 size-28 opacity-[0.07]",
            theme.accent,
          )}
          aria-hidden
        />
      ) : null}

      <div className="relative flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl border bg-black/30",
                theme.border,
              )}
            >
              <Icon size={16} className={theme.accent} aria-hidden />
            </span>
            <div>
              <p className={cn("text-[10px] font-medium uppercase tracking-[0.16em]", theme.accentMuted)}>
                {theme.label}
              </p>
              <p className="font-mono text-[10px] text-zinc-600">#{String(rank).padStart(2, "0")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {isWon ? (
              <Badge tone="green" className="gap-1">
                <Trophy size={10} aria-hidden />
                Closed
              </Badge>
            ) : (
              <Badge tone={stateTone[prospect.agentState]}>
                {stateLabels[prospect.agentState]}
              </Badge>
            )}
          </div>
        </div>

        {children}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-mono text-xs text-zinc-500">
            {currency(prospect.estimatedDealValue)} deal
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100",
              theme.accent,
            )}
          >
            Open
            <ArrowUpRight size={12} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProspectCard({
  prospect,
  index,
  onSelect,
}: {
  prospect: Prospect;
  index: number;
  onSelect: () => void;
}) {
  const theme = getTheme(prospect.category);
  const variant = getVariant(index, prospect.agentState);
  const gaps = prospect.identifiedGaps ?? [];
  const gapText = gaps[0] ?? prospect.summary;
  const rank = index + 1;

  if (variant === "hero") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <div className="mt-4 flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
              {prospect.name}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              {prospect.category} · {prospect.location}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
              {prospect.summary}
            </p>
            <div className="mt-4">
              <GapPills gaps={gaps} theme={theme} />
            </div>
          </div>
          <ScoreBadge score={prospect.opportunityScore} theme={theme} large />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span>{prospect.rating}★ · {prospect.reviewCount} reviews</span>
          <span>{prospect.websiteStatus.replace(/_/g, " ")}</span>
        </div>
      </CardShell>
    );
  }

  if (variant === "tower" || variant === "stack") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <h3 className="mt-4 text-lg font-semibold leading-tight text-zinc-100">{prospect.name}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          {prospect.location} · {prospect.category}
        </p>
        <div className="my-5 flex justify-center">
          <ScoreBadge score={prospect.opportunityScore} theme={theme} large />
        </div>
        <p className="line-clamp-4 flex-1 text-xs leading-relaxed text-zinc-400">{gapText}</p>
        <div className="mt-3">
          <GapPills gaps={gaps} theme={theme} />
        </div>
      </CardShell>
    );
  }

  if (variant === "band" || variant === "wave") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <div
          className={cn(
            "-mx-4 -mt-4 mb-4 border-b px-4 py-3 sm:-mx-5 sm:-mt-5 sm:px-5",
            theme.border,
            "bg-black/25",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-zinc-100">{prospect.name}</h3>
            <ScoreBadge score={prospect.opportunityScore} theme={theme} />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          {prospect.category} · {prospect.location} · {prospect.rating}★
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-400">{gapText}</p>
        <div className="mt-3">
          <GapPills gaps={gaps} theme={theme} />
        </div>
      </CardShell>
    );
  }

  if (variant === "tile") {
    return (
      <CardShell
        prospect={prospect}
        theme={theme}
        variant={variant}
        rank={rank}
        onSelect={onSelect}
        className="min-h-[9rem]"
      >
        <h3 className="mt-3 text-base font-semibold text-zinc-100">{prospect.name}</h3>
        <p className="mt-4 font-mono text-3xl font-semibold tabular-nums" style={{ color: theme.scoreColor }}>
          {prospect.opportunityScore}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{gapText}</p>
      </CardShell>
    );
  }

  if (variant === "split") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <div className="mt-3 grid flex-1 gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">{prospect.name}</h3>
            <p className="mt-1 text-xs text-zinc-500">{prospect.location}</p>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-400">{gapText}</p>
          </div>
          <div className="flex flex-col items-end justify-between gap-2">
            <ScoreBadge score={prospect.opportunityScore} theme={theme} />
            <GapPills gaps={gaps} theme={theme} />
          </div>
        </div>
      </CardShell>
    );
  }

  if (variant === "orbit") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <h3 className="mt-3 pr-16 text-base font-semibold leading-snug text-zinc-100">
          {prospect.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">{prospect.category}</p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-zinc-400">{gapText}</p>
          <span className={cn("font-mono text-2xl font-bold tabular-nums", theme.accent)}>
            {prospect.opportunityScore}
          </span>
        </div>
      </CardShell>
    );
  }

  if (variant === "ledger") {
    return (
      <CardShell
        prospect={prospect}
        theme={theme}
        variant={variant}
        rank={rank}
        onSelect={onSelect}
        className="min-h-[10rem] font-mono"
      >
        <div className="mt-3 space-y-2 text-[11px]">
          <div className="flex justify-between border-b border-white/[0.06] pb-2 text-zinc-500">
            <span>ENTITY</span>
            <span>SCORE</span>
          </div>
          <p className="truncate text-sm font-medium text-zinc-200">{prospect.name}</p>
          <div className="flex justify-between text-zinc-500">
            <span>{prospect.location}</span>
            <span className={theme.accent}>{prospect.opportunityScore}</span>
          </div>
          <p className="line-clamp-2 leading-relaxed text-zinc-600">{gapText}</p>
        </div>
      </CardShell>
    );
  }

  if (variant === "pulse") {
    return (
      <CardShell prospect={prospect} theme={theme} variant={variant} rank={rank} onSelect={onSelect}>
        <div className="mt-3 flex items-start gap-3">
          <div className="relative">
            <span
              className="absolute inline-flex size-10 animate-ping rounded-full opacity-20"
              style={{ backgroundColor: theme.scoreColor }}
              aria-hidden
            />
            <span className={cn("relative grid size-10 place-items-center rounded-full border", theme.border)}>
              <theme.icon size={16} className={theme.accent} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-zinc-100">{prospect.name}</h3>
            <p className="text-xs text-zinc-500">{prospect.location}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-xs text-zinc-400">{gapText}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${prospect.opportunityScore}%`,
              backgroundColor: theme.scoreColor,
            }}
          />
        </div>
      </CardShell>
    );
  }

  if (variant === "frame") {
    return (
      <CardShell
        prospect={prospect}
        theme={theme}
        variant={variant}
        rank={rank}
        onSelect={onSelect}
        className="border-2"
      >
        <div className={cn("mt-2 inline-block border px-2 py-0.5 text-[10px] uppercase tracking-widest", theme.border, theme.accentMuted)}>
          {prospect.category}
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-zinc-50">{prospect.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-xs italic leading-relaxed text-zinc-500">
          “{gapText}”
        </p>
        <p className={cn("mt-3 font-mono text-xl font-semibold", theme.accent)}>
          {prospect.opportunityScore}
          <span className="text-xs text-zinc-600">/100</span>
        </p>
      </CardShell>
    );
  }

  // ribbon (default) + fallback
  return (
    <CardShell prospect={prospect} theme={theme} variant="ribbon" rank={rank} onSelect={onSelect}>
      <h3 className="mt-4 text-base font-semibold text-zinc-100">{prospect.name}</h3>
      <p className="mt-1 text-xs text-zinc-500">
        {prospect.category} · {prospect.location}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-400">{gapText}</p>
        <span className={cn("shrink-0 font-mono text-xl font-semibold tabular-nums", theme.accent)}>
          {prospect.opportunityScore}
        </span>
      </div>
      <div className="mt-3">
        <GapPills gaps={gaps} theme={theme} />
      </div>
    </CardShell>
  );
}
