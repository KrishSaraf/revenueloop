"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpDown, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { stateTone } from "@/lib/presentation";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { stateLabels, type AgentState, type Prospect } from "@/lib/types";
import { cn, currency, percent } from "@/lib/utils";

type FilterId =
  | "all"
  | "awaiting_approval"
  | "in_progress"
  | "contacted"
  | "won"
  | "lost";

type SortId = "profit" | "confidence" | "deal" | "score";

const filters: { id: FilterId; label: string; states?: AgentState[] }[] = [
  { id: "all", label: "All" },
  { id: "awaiting_approval", label: "Awaiting approval", states: ["AWAITING_APPROVAL"] },
  {
    id: "in_progress",
    label: "In progress",
    states: ["RESEARCHING", "SCORING", "GENERATING_SITE", "PREPARING_PITCH"],
  },
  {
    id: "contacted",
    label: "Contacted",
    states: ["CALLING", "FOLLOWING_UP", "PAYMENT_PENDING"],
  },
  { id: "won", label: "Won", states: ["WON"] },
  { id: "lost", label: "Lost / blocked", states: ["REJECTED", "DO_NOT_CONTACT", "FAILED"] },
];

function expectedProfit(prospect: Prospect) {
  return prospect.estimatedDealValue - (prospect.estimatedDeliveryCost ?? 0);
}

export function OpportunitiesView() {
  const { state, hydrated } = useRevenueLoop();
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId>("profit");

  const rows = useMemo(() => {
    const active = filters.find((f) => f.id === filter);
    let items = state.prospects.filter((p) => p.agentState !== "DISCOVERING");
    if (active?.states) {
      items = items.filter((p) => active.states!.includes(p.agentState));
    }
    const sorted = [...items];
    if (sort === "profit") sorted.sort((a, b) => expectedProfit(b) - expectedProfit(a));
    if (sort === "deal") sorted.sort((a, b) => b.estimatedDealValue - a.estimatedDealValue);
    if (sort === "score") sorted.sort((a, b) => b.opportunityScore - a.opportunityScore);
    if (sort === "confidence") {
      const conf = (p: Prospect) =>
        state.strategies.find((s) => s.prospectId === p.id)?.conversionProbability ??
        (p.opportunityScore >= 85 ? 0.62 : 0.44);
      sorted.sort((a, b) => conf(b) - conf(a));
    }
    return sorted;
  }, [state.prospects, state.strategies, filter, sort]);

  if (!hydrated) {
    return <div className="skeleton h-64 rounded-xl" aria-hidden />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Opportunities</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The operator&apos;s money-making queue — every opportunity ranked by expected
          profit and readiness.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status filters">
          {filters.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                filter === option.id
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
              )}
              aria-pressed={filter === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <ArrowUpDown size={13} aria-hidden />
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="h-8 rounded-md border border-white/10 bg-white/[0.04] px-2 text-xs text-zinc-200"
          >
            <option value="profit">Expected profit</option>
            <option value="confidence">Confidence</option>
            <option value="deal">Deal value</option>
            <option value="score">Opportunity score</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No opportunities in this stage"
          description="No sales-ready opportunities yet. VentureMint is still researching and building — check the pipeline on the dashboard."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                {[
                  "Business",
                  "Identified problem",
                  "Solution",
                  "Confidence",
                  "Price",
                  "Expected profit",
                  "Status",
                  "",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((prospect) => {
                const strategy = state.strategies.find(
                  (s) => s.prospectId === prospect.id,
                );
                const website = state.websites.find(
                  (w) => w.prospectId === prospect.id,
                );
                const confidence =
                  strategy?.conversionProbability ??
                  (prospect.opportunityScore >= 85 ? 0.62 : 0.44);
                return (
                  <tr
                    key={prospect.id}
                    className="bg-[#111114] transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="font-medium text-zinc-200 underline-offset-2 hover:underline"
                      >
                        {prospect.name}
                      </Link>
                      <p className="text-[11px] text-zinc-600">
                        {prospect.category} · {prospect.location}
                      </p>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="line-clamp-2 text-xs text-zinc-500">
                        {(prospect.identifiedGaps ?? []).join(", ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {website
                        ? `${website.sections.length}-section site${website.verified ? " (verified)" : ""}`
                        : "Not built"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                      {prospect.agentState === "DO_NOT_CONTACT"
                        ? "—"
                        : percent(confidence * 100)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                      {currency(prospect.estimatedDealValue)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-emerald-300">
                      {prospect.agentState === "DO_NOT_CONTACT"
                        ? "—"
                        : currency(expectedProfit(prospect))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={stateTone[prospect.agentState]}>
                        {stateLabels[prospect.agentState]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/prospects/${prospect.id}`}>
                        <Button size="sm" variant="ghost" icon={<ArrowRight size={13} />}>
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
