"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, SearchX, Store } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { stateTone } from "@/lib/presentation";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { stateLabels } from "@/lib/types";
import { currency } from "@/lib/utils";

const FLAGSHIP_ID = "prospect-new-nature-spa";

const discoveryInput = {
  location: "Singapore",
  category: "Any",
  maxProspects: 12,
  minimumRating: 3.0,
  websiteStatus: "either" as const,
};

function sortProspects<T extends { id: string; opportunityScore: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.id === FLAGSHIP_ID) return -1;
    if (b.id === FLAGSHIP_ID) return 1;
    return b.opportunityScore - a.opportunityScore;
  });
}

export function ProspectsView() {
  const { state, discoverProspects, selectProspect, hydrated } = useRevenueLoop();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const autoDiscoverRan = useRef(false);

  const prospects = useMemo(
    () => sortProspects(state.prospects),
    [state.prospects],
  );

  const runDiscovery = useCallback(
    async (replace = false) => {
      setIsDiscovering(true);
      setDiscoveryError(null);
      try {
        await discoverProspects({ ...discoveryInput, replace });
      } catch (error) {
        setDiscoveryError(
          error instanceof Error ? error.message : "Discovery failed. Try again.",
        );
      } finally {
        setIsDiscovering(false);
      }
    },
    [discoverProspects],
  );

  useEffect(() => {
    if (!hydrated || autoDiscoverRan.current || state.prospects.length > 0) return;
    autoDiscoverRan.current = true;
    void discoverProspects(discoveryInput).catch((error) => {
      setDiscoveryError(
        error instanceof Error ? error.message : "Discovery failed. Try again.",
      );
    });
  }, [hydrated, discoverProspects, state.prospects.length]);

  const waitingForFirstSweep =
    hydrated && prospects.length === 0 && !discoveryError;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Prospects</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {prospects.length > 0
              ? `${prospects.length} local small businesses found — New Nature Spa is your top opportunity.`
              : "Discovery agents scan neighbourhood small businesses across Singapore."}
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw size={15} className={isDiscovering ? "animate-spin" : ""} />}
          disabled={isDiscovering || state.safetyLock}
          onClick={() => void runDiscovery(true)}
        >
          {isDiscovering ? "Scanning…" : "Refresh"}
        </Button>
      </div>

      {isDiscovering || waitingForFirstSweep ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <StatusDot tone="blue" pulse />
          Discovery Agent is scanning local small businesses…
        </div>
      ) : null}

      {discoveryError ? (
        <p className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs text-rose-300">
          {discoveryError}
        </p>
      ) : null}

      {!hydrated || isDiscovering || waitingForFirstSweep ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : prospects.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No small businesses found"
          description="The discovery sweep returned no results. Hit Refresh to scan again."
        />
      ) : (
        <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08]">
          {prospects.map((prospect, index) => {
            const gap = (prospect.identifiedGaps ?? [])[0] ?? prospect.summary;
            const isFlagship = prospect.id === FLAGSHIP_ID;
            return (
              <article
                key={prospect.id}
                className={`flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 ${
                  isFlagship ? "bg-emerald-400/[0.06]" : "bg-[#111114]"
                }`}
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
                    <Badge tone="muted" className="gap-1">
                      <Store size={10} aria-hidden />
                      Small business
                    </Badge>
                    {isFlagship ? (
                      <Badge tone="green">Top opportunity</Badge>
                    ) : null}
                    <Badge tone={stateTone[prospect.agentState]}>
                      {stateLabels[prospect.agentState]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {prospect.category} · {prospect.location} ·{" "}
                    {prospect.reviewCount} reviews ·{" "}
                    {currency(prospect.estimatedDealValue)} est. deal
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {gap}
                  </p>
                </div>
                <Link
                  href={`/prospects/${prospect.id}`}
                  onClick={() => selectProspect(prospect.id)}
                >
                  <Button size="sm" icon={<ArrowRight size={13} />}>
                    Open
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
