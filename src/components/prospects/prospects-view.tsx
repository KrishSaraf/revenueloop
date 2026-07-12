"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { stateTone } from "@/lib/presentation";
import { discoveryWaveIds, getWorkspaceProspects } from "@/lib/seed";
import { getWorkspaceSiteCatalog } from "@/lib/showcase-sites";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { stateLabels } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

import type { Prospect } from "@/lib/types";

const waveIdSet = new Set<string>(discoveryWaveIds);

function sortProspects(items: Prospect[]): Prospect[] {
  return [...items].sort((a, b) => {
    const aClosed = a.agentState === "WON" ? 1 : 0;
    const bClosed = b.agentState === "WON" ? 1 : 0;
    if (aClosed !== bClosed) return bClosed - aClosed;
    return b.opportunityScore - a.opportunityScore;
  });
}

export function ProspectsView() {
  const { state, selectProspect, hydrated } = useRevenueLoop();

  const prospects = useMemo(
    () => sortProspects(getWorkspaceProspects(state.prospects)),
    [state.prospects],
  );

  const siteCatalog = useMemo(
    () => getWorkspaceSiteCatalog(state.prospects),
    [state.prospects],
  );

  if (!hydrated) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Prospects</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {prospects.length} business{prospects.length === 1 ? "" : "es"} in pipeline ·{" "}
          {siteCatalog.pipelineSiteCount} generated site
          {siteCatalog.pipelineSiteCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-[#111114]">
        {prospects.map((prospect, index) => {
          const gap = (prospect.identifiedGaps ?? [])[0] ?? prospect.summary;
          const isClosed = prospect.agentState === "WON";
          const isNew = waveIdSet.has(prospect.id);

          return (
            <article
              key={prospect.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5",
                isClosed ? "bg-emerald-400/[0.04]" : "bg-transparent",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={`/prospects/${prospect.id}`}
                    onClick={() => selectProspect(prospect.id)}
                    className="text-sm font-semibold text-zinc-100 underline-offset-2 hover:underline"
                  >
                    {prospect.name}
                  </Link>
                  {isClosed ? (
                    <Badge tone="green">Closed</Badge>
                  ) : isNew ? (
                    <Badge tone="amber">New lead</Badge>
                  ) : (
                    <Badge tone={stateTone[prospect.agentState]}>
                      {stateLabels[prospect.agentState]}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {prospect.category} · {prospect.location} · {prospect.rating}★ ·{" "}
                  {currency(prospect.estimatedDealValue)}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                  {gap}
                </p>
              </div>
              <Link
                href={`/prospects/${prospect.id}`}
                onClick={() => selectProspect(prospect.id)}
              >
                <Button size="sm" variant="ghost" icon={<ArrowRight size={13} />}>
                  Open
                </Button>
              </Link>
            </article>
          );
        })}
      </div>

      {prospects.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">
          No prospects loaded. Open the dashboard and run the pipeline to surface new
          leads.
        </p>
      ) : null}
    </div>
  );
}
