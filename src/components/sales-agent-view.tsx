"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCheck, Phone, PhoneCall, Trophy } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ApprovalCard } from "@/components/shared/approval-card";
import { CallTranscriptFeed } from "@/components/shared/call-transcript";
import {
  LiveOutboundCall,
  type LiveCallStatus,
} from "@/components/shared/live-outbound-call";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { cn, currency } from "@/lib/utils";

export function SalesAgentView() {
  const { state, hydrated } = useRevenueLoop();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const completedCalls = useMemo(
    () =>
      state.calls
        .filter((call) => call.status === "Completed")
        .sort((a, b) => {
          const aTime = a.completedAt ?? a.startedAt ?? "";
          const bTime = b.completedAt ?? b.startedAt ?? "";
          return bTime.localeCompare(aTime);
        }),
    [state.calls],
  );

  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const activeCall = state.calls.find((c) => c.status === "Calling");
  const selectedCall =
    activeCall ??
    completedCalls.find((call) => call.id === selectedCallId) ??
    completedCalls[0] ??
    state.calls[0];

  useEffect(() => {
    if (activeCall) return;
    if (selectedCallId && completedCalls.some((call) => call.id === selectedCallId)) {
      return;
    }
    if (completedCalls[0]) {
      setSelectedCallId(completedCalls[0].id);
    }
  }, [activeCall, completedCalls, selectedCallId]);

  const callProspect = selectedCall
    ? state.prospects.find((p) => p.id === selectedCall.prospectId)
    : undefined;
  const callTranscript = selectedCall
    ? state.transcripts.filter((entry) => entry.callId === selectedCall.id)
    : [];
  const won = state.prospects.filter((p) => p.agentState === "WON");
  const lost = state.prospects.filter((p) => p.agentState === "REJECTED");
  const inConversation = state.prospects.filter((p) =>
    ["CALLING", "FOLLOWING_UP", "PAYMENT_PENDING"].includes(p.agentState),
  );

  const callStatus: LiveCallStatus = useMemo(() => {
    if (!selectedCall) return "idle";
    if (selectedCall.status === "Calling") return "connected";
    if (selectedCall.status === "Completed") return "ended";
    return "idle";
  }, [selectedCall]);

  useEffect(() => {
    if (callStatus !== "connected") {
      setElapsedSeconds(selectedCall?.durationSeconds ?? 0);
      return;
    }

    setElapsedSeconds(12);
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [callStatus, selectedCall?.id, selectedCall?.durationSeconds]);

  const awaiting = state.prospects.filter(
    (p) => p.agentState === "AWAITING_APPROVAL" && !p.doNotContact,
  );

  if (!hydrated) {
    return <div className="skeleton h-64 rounded-xl" aria-hidden />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Sales agent</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Approval queue, live conversations and deal outcomes. Every outbound action
          requires human approval first.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          {/* Approval queue */}
          <Panel>
            <PanelHeader
              eyebrow="Gate"
              title="Approval queue"
              action={
                awaiting.length > 0 ? (
                  <Badge tone="amber">{awaiting.length} pending</Badge>
                ) : undefined
              }
            />
            <div className="space-y-3 p-4 sm:p-5">
              {awaiting.length === 0 ? (
                <EmptyState
                  icon={CheckCheck}
                  title="Nothing needs your attention"
                  description="VentureMint will surface opportunities here after solutions pass verification."
                />
              ) : (
                awaiting.map((prospect) => {
                  const strategy = state.strategies.find(
                    (s) => s.prospectId === prospect.id,
                  );
                  const website = state.websites.find(
                    (w) => w.prospectId === prospect.id,
                  );
                  return (
                    <ApprovalCard
                      key={prospect.id}
                      prospect={prospect}
                      strategy={strategy}
                      previewSlug={website?.slug}
                    />
                  );
                })
              )}
            </div>
          </Panel>

          {/* Active conversations */}
          <Panel>
            <PanelHeader eyebrow="Pipeline" title="Active conversations" />
            {inConversation.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Phone}
                  title="No active conversations"
                  description="Approved prospects appear here once the outbound call begins."
                />
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {inConversation.map((prospect) => (
                  <li
                    key={prospect.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/prospects/${prospect.id}`}
                        className="text-sm font-medium text-zinc-200 underline-offset-2 hover:underline"
                      >
                        {prospect.name}
                      </Link>
                      <p className="text-[11px] text-zinc-600">
                        {prospect.category} · {currency(prospect.estimatedDealValue)} deal
                      </p>
                    </div>
                    <Badge
                      tone={prospect.agentState === "PAYMENT_PENDING" ? "amber" : "green"}
                    >
                      {prospect.agentState === "PAYMENT_PENDING"
                        ? "Payment pending"
                        : prospect.agentState === "CALLING"
                          ? "On call"
                          : "Following up"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Completed calls */}
          <Panel>
            <PanelHeader
              eyebrow="History"
              title="Completed calls"
              action={
                completedCalls.length > 0 ? (
                  <Badge tone="muted">{completedCalls.length}</Badge>
                ) : undefined
              }
            />
            {completedCalls.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={PhoneCall}
                  title="No completed calls"
                  description="Transcripts appear here after outbound calls finish."
                />
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {completedCalls.map((call) => {
                  const prospect = state.prospects.find((p) => p.id === call.prospectId);
                  const isSelected = selectedCall?.id === call.id;
                  return (
                    <li key={call.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCallId(call.id)}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors sm:px-5",
                          isSelected
                            ? "bg-emerald-400/[0.06]"
                            : "hover:bg-white/[0.03]",
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {prospect?.name ?? "Unknown prospect"}
                          </p>
                          <p className="text-[11px] text-zinc-600">
                            {call.durationSeconds
                              ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s`
                              : "Completed"}{" "}
                            · {prospect?.category ?? "—"}
                          </p>
                        </div>
                        <Badge tone="green">Done</Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Won / lost */}
          <div className="grid grid-cols-2 gap-3">
            <Panel>
              <PanelHeader eyebrow="Closed" title="Won" />
              <div className="p-4 sm:p-5">
                {won.length === 0 ? (
                  <p className="text-xs text-zinc-600">No deals won yet.</p>
                ) : (
                  won.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 py-1">
                      <Trophy size={13} className="shrink-0 text-emerald-400" aria-hidden />
                      <Link
                        href={`/prospects/${p.id}`}
                        className="truncate text-xs text-zinc-300 underline-offset-2 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="ml-auto font-mono text-[11px] text-emerald-300">
                        {currency(p.estimatedDealValue)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Panel>
            <Panel>
              <PanelHeader eyebrow="Closed" title="Lost" />
              <div className="p-4 sm:p-5">
                {lost.length === 0 ? (
                  <p className="text-xs text-zinc-600">No deals lost.</p>
                ) : (
                  lost.map((p) => (
                    <div key={p.id} className="py-1">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="truncate text-xs text-zinc-400 underline-offset-2 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="text-[10px] text-zinc-600">
                        {p.lostReason ?? "Reason not recorded"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>

        {/* Call interface */}
        <Panel className="flex flex-col">
          <PanelHeader
            eyebrow="Call console"
            title={callProspect ? callProspect.name : "No call yet"}
            action={
              selectedCall ? (
                <div className="flex items-center gap-2">
                  {selectedCall.status === "Calling" ? (
                    <>
                      <StatusDot tone="green" pulse />
                      <span className="font-mono text-xs text-emerald-300">ON CALL</span>
                    </>
                  ) : (
                    <Badge tone={selectedCall.status === "Completed" ? "green" : "muted"}>
                      {selectedCall.status === "Completed" ? "Done" : selectedCall.status}
                      {selectedCall.durationSeconds
                        ? ` · ${Math.floor(selectedCall.durationSeconds / 60)}m ${selectedCall.durationSeconds % 60}s`
                        : ""}
                    </Badge>
                  )}
                </div>
              ) : undefined
            }
          />
          {!selectedCall ? (
            <div className="flex-1 p-5">
              <EmptyState
                icon={PhoneCall}
                title="No calls yet"
                description="Approve an opportunity to start an outbound sales call from the VentureMint line."
              />
            </div>
          ) : (
            <>
              <div className="flex-1 p-4 sm:p-5">
                <LiveOutboundCall
                  status={callStatus}
                  seconds={
                    callStatus === "ended"
                      ? (selectedCall.durationSeconds ?? elapsedSeconds)
                      : elapsedSeconds
                  }
                  calleeName={callProspect?.name}
                  calleePhone={callProspect?.phone}
                  outcome={
                    callStatus === "ended"
                      ? selectedCall.outcome ??
                        "Owner agreed S$140 one-time + S$20/year. Checkout link sent."
                      : undefined
                  }
                />

                {callStatus === "ended" && callTranscript.length > 0 ? (
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Call transcript
                    </p>
                    <CallTranscriptFeed entries={callTranscript} />
                  </div>
                ) : null}
              </div>
              <div className="border-t border-white/[0.06] p-4 sm:p-5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      Detected objections
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {selectedCall.detectedObjections.length > 0
                        ? selectedCall.detectedObjections.join(" · ")
                        : "None detected"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      AI recommendation
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">{selectedCall.nextAction}</p>
                  </div>
                </div>
                {callProspect ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/prospects/${callProspect.id}`}>
                      <Button size="sm" variant="ghost">
                        Open workspace
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
