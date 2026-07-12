"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import type { AgentEvent } from "@/lib/types";
import { stateLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { eventStatusTone } from "@/lib/presentation";
import { shortTime } from "@/lib/utils";

export function ActivityFeed({
  events,
  limit,
  getProspectName,
}: {
  events: AgentEvent[];
  limit?: number;
  getProspectName?: (prospectId: string) => string | undefined;
}) {
  const visible = limit ? events.slice(0, limit) : events;

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No agent activity yet"
        description="Agent events will appear here as the loop discovers, builds and sells."
      />
    );
  }

  return (
    <ol className="divide-y divide-white/[0.06]">
      {visible.map((event) => {
        const prospectName = event.prospectId
          ? getProspectName?.(event.prospectId)
          : undefined;
        return (
          <li key={event.id} className="flex gap-3 px-4 py-3 sm:px-5">
            <div className="flex flex-col items-center pt-1">
              <span
                className={
                  event.status === "running"
                    ? "h-1.5 w-1.5 rounded-full bg-sky-400 pulse-dot"
                    : event.status === "approval"
                      ? "h-1.5 w-1.5 rounded-full bg-amber-400 pulse-dot"
                      : event.status === "failed"
                        ? "h-1.5 w-1.5 rounded-full bg-rose-400"
                        : "h-1.5 w-1.5 rounded-full bg-emerald-400"
                }
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                <Badge tone={eventStatusTone[event.status]}>
                  {stateLabels[event.newState]}
                </Badge>
                {event.agent ? (
                  <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">
                    {event.agent}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {event.outputSummary}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-zinc-600">
                <time dateTime={event.timestamp}>{shortTime(event.timestamp)}</time>
                {event.estimatedCost > 0 ? (
                  <span>cost S${event.estimatedCost.toFixed(2)}</span>
                ) : null}
                {prospectName && event.prospectId ? (
                  <Link
                    href={`/prospects/${event.prospectId}`}
                    className="text-zinc-500 underline-offset-2 hover:text-emerald-300 hover:underline"
                  >
                    {prospectName}
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
