"use client";

import Link from "next/link";
import { PhoneCall, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency, percent } from "@/lib/utils";

export function SalesAgentView() {
  const { state, approveCall } = useRevenueLoop();
  const readyProspects = state.prospects.filter(
    (prospect) => prospect.salesStrategyId || prospect.generatedWebsiteId,
  );

  return (
    <div className="space-y-5">
      <div>
        <Badge tone="purple">Conversational AI</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Sales Agent</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Review the pitch, approval gate, simulated transcript and commercial outcome for each prospect.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel>
          <PanelHeader title="Approval Queue" eyebrow="external actions" />
          <div className="space-y-3 p-5">
            {readyProspects.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Generate a website from the prospects workspace to prepare a call.
              </p>
            ) : (
              readyProspects.map((prospect) => {
                const strategy = state.strategies.find(
                  (item) => item.id === prospect.salesStrategyId,
                );
                return (
                  <div
                    key={prospect.id}
                    className="rounded-lg border border-white/10 bg-white/[0.05] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{prospect.name}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {prospect.category} · {prospect.location}
                        </p>
                      </div>
                      <Badge tone={prospect.approvedForCall ? "green" : "amber"}>
                        {prospect.approvedForCall ? "Approved" : "Needs approval"}
                      </Badge>
                    </div>
                    {strategy ? (
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <p className="text-zinc-500">Offer</p>
                          <p className="mt-1 font-semibold text-white">
                            {currency(strategy.proposedPrice)} + {currency(strategy.monthlyPrice)}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Probability</p>
                          <p className="mt-1 font-semibold text-white">
                            {percent(strategy.conversionProbability * 100)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        icon={<ShieldCheck size={16} />}
                        onClick={() => void approveCall(prospect.id)}
                        disabled={prospect.approvedForCall || prospect.doNotContact}
                      >
                        Approve call
                      </Button>
                      <Link href={`/prospects/${prospect.id}`}>
                        <Button variant="ghost">Open workspace</Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Live Transcript" eyebrow="simulation labelled" />
          <div className="space-y-4 p-5">
            {state.calls.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/20 p-8 text-center">
                <PhoneCall className="mx-auto text-emerald-300" />
                <p className="mt-3 text-sm text-zinc-500">
                  Approved calls will stream here.
                </p>
              </div>
            ) : (
              state.calls.map((call) => {
                const prospect = state.prospects.find(
                  (item) => item.id === call.prospectId,
                );
                const entries = state.transcripts.filter(
                  (entry) => entry.callId === call.id,
                );
                return (
                  <div key={call.id} className="rounded-lg border border-white/10 bg-black/24 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{prospect?.name}</p>
                        <p className="text-sm text-zinc-500">
                          Duration {call.durationSeconds}s · sentiment {call.sentiment}
                        </p>
                      </div>
                      <Badge tone="purple">Simulation</Badge>
                    </div>
                    <div className="mt-4 space-y-3">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className={
                            entry.speaker === "ai"
                              ? "ml-auto max-w-[86%] rounded-lg bg-emerald-300/12 p-3 text-sm text-emerald-50"
                              : "max-w-[86%] rounded-lg bg-white/[0.07] p-3 text-sm text-zinc-200"
                          }
                        >
                          <p className="text-xs uppercase text-zinc-500">
                            {entry.speaker}
                          </p>
                          <p className="mt-1 leading-6">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                    {call.outcome ? (
                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-lg bg-white/[0.05] p-3">
                          <p className="text-zinc-500">Outcome</p>
                          <p className="mt-1 text-zinc-200">{call.outcome}</p>
                        </div>
                        <div className="rounded-lg bg-white/[0.05] p-3">
                          <p className="text-zinc-500">Objections</p>
                          <p className="mt-1 text-zinc-200">
                            {call.detectedObjections.join(", ")}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white/[0.05] p-3">
                          <p className="text-zinc-500">Next action</p>
                          <p className="mt-1 text-zinc-200">{call.nextAction}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
