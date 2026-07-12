"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, RefreshCw, SearchX, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { ProspectCard } from "@/components/prospects/prospect-card";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency } from "@/lib/utils";

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
  return [...items].sort((a, b) => b.opportunityScore - a.opportunityScore);
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

  const pipelineValue = useMemo(
    () => prospects.reduce((sum, p) => sum + p.estimatedDealValue, 0),
    [prospects],
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
            Discovery queue
          </p>
          <h1 className="font-display mt-2 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
            Prospects
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            {prospects.length > 0
              ? "Each card reflects the business category — layout and palette shift per lead."
              : "Agents scan neighbourhood small businesses across Singapore."}
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

      {prospects.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
            <Sparkles size={12} className="text-emerald-400" aria-hidden />
            <span className="text-xs text-zinc-400">
              <span className="font-mono text-zinc-200">{prospects.length}</span> in pipeline
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
            <MapPin size={12} className="text-sky-400" aria-hidden />
            <span className="text-xs text-zinc-400">Singapore sweep</span>
          </div>
          <Badge tone="muted" className="font-mono">
            {currency(pipelineValue)} pipeline value
          </Badge>
        </div>
      ) : null}

      {isDiscovering || waitingForFirstSweep ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-sky-400" />
          </span>
          Discovery Agent is scanning local small businesses…
        </div>
      ) : null}

      {discoveryError ? (
        <p className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs text-rose-300">
          {discoveryError}
        </p>
      ) : null}

      {!hydrated || isDiscovering || waitingForFirstSweep ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prospects.map((prospect, index) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              index={index}
              onSelect={() => selectProspect(prospect.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
