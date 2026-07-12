"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCheck, Phone, PhoneCall, Trophy } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ApprovalCard } from "@/components/shared/approval-card";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { cn, currency } from "@/lib/utils";

export function SalesAgentView() {
  const { state, hydrated } = useRevenueLoop();
  const transcriptRef = useRef<HTMLDivElement>(null);

  const awaiting = state.prospects.filter(
    (p) => p.agentState === "AWAITING_APPROVAL" && !p.doNotContact,
  );
  const activeCall = state.calls.find((c) => c.status === "Calling");
  const latestCall = activeCall ?? state.calls[0];
  const callProspect = latestCall
    ? state.prospects.find((p) => p.id === latestCall.prospectId)
    : undefined;
  const transcript = latestCall
    ? state.transcripts.filter((t) => t.callId === latestCall.id)
    : [];
  const won = state.prospects.filter((p) => p.agentState === "WON");
  const lost = state.prospects.filter((p) => p.agentState === "REJECTED");
  const inConversation = state.prospects.filter((p) =>
    ["CALLING", "FOLLOWING_UP", "PAYMENT_PENDING"].includes(p.agentState),
  );

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript.length]);

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
                  description="Approved prospects appear here once the simulated call begins."
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
              latestCall ? (
                <div className="flex items-center gap-2">
                  {latestCall.status === "Calling" ? (
                    <>
                      <StatusDot tone="green" pulse />
                      <span className="font-mono text-xs text-emerald-300">LIVE · SIMULATED</span>
                    </>
                  ) : (
                    <Badge tone={latestCall.status === "Completed" ? "green" : "muted"}>
                      {latestCall.status}
                      {latestCall.durationSeconds
                        ? ` · ${Math.floor(latestCall.durationSeconds / 60)}m ${latestCall.durationSeconds % 60}s`
                        : ""}
                    </Badge>
                  )}
                </div>
              ) : undefined
            }
          />
          {!latestCall ? (
            <div className="flex-1 p-5">
              <EmptyState
                icon={PhoneCall}
                title="No calls yet"
                description="Approve an opportunity to start a simulated sales call. The transcript streams here in real time."
              />
            </div>
          ) : (
            <>
              <div
                ref={transcriptRef}
                className="max-h-[420px] flex-1 space-y-2 overflow-y-auto p-4 sm:p-5"
                aria-live="polite"
                aria-label="Call transcript"
              >
                {transcript.length === 0 ? (
                  <p className="text-xs text-zinc-600">
                    Transcript not available for this call.
                  </p>
                ) : (
                  transcript.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                        entry.speaker === "ai"
                          ? "bg-emerald-400/10 text-emerald-100"
                          : entry.speaker === "owner"
                            ? "ml-auto bg-white/[0.06] text-zinc-300"
                            : "mx-auto bg-transparent text-center font-mono text-[10px] text-zinc-600",
                      )}
                    >
                      {entry.speaker !== "system" ? (
                        <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-wide opacity-60">
                          {entry.speaker === "ai" ? "VentureMint" : "Owner"}
                        </span>
                      ) : null}
                      {entry.text}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-white/[0.06] p-4 sm:p-5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      Detected objections
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {latestCall.detectedObjections.length > 0
                        ? latestCall.detectedObjections.join(" · ")
                        : "None detected"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                      AI recommendation
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">{latestCall.nextAction}</p>
                  </div>
                </div>
                {callProspect ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/prospects/${callProspect.id}`}>
                      <Button size="sm" variant="ghost">
                        Open workspace
                      </Button>
                    </Link>
                    <span className="ml-auto self-center font-mono text-[10px] text-zinc-600">
                      Simulated call — sandbox mode never dials real numbers
                    </span>
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
