"use client";

import { Panel, PanelHeader } from "@/components/ui/panel";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

export function ActivityView() {
  const { state, hydrated } = useRevenueLoop();

  if (!hydrated) {
    return <div className="skeleton h-64 rounded-xl" aria-hidden />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Activity</h1>
        <p className="mt-1 text-sm text-zinc-500">
          The complete audit trail — every agent action, state change and human
          decision is logged.
        </p>
      </div>
      <Panel>
        <PanelHeader
          eyebrow="Audit trail"
          title="All events"
          action={
            <span className="font-mono text-[10px] text-zinc-600">
              {state.events.length} events
            </span>
          }
        />
        <ActivityFeed
          events={state.events}
          getProspectName={(id) => state.prospects.find((p) => p.id === id)?.name}
        />
      </Panel>
    </div>
  );
}
