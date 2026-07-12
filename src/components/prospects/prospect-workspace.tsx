"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Globe2,
  PhoneCall,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GeneratedSitePreview } from "@/components/sites/generated-site-preview";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency, percent, shortTime } from "@/lib/utils";

export function ProspectWorkspace({ id }: { id: string }) {
  const {
    state,
    generateWebsite,
    approveCall,
    markDoNotContact,
    updateWebsiteSection,
    updateWebsiteTheme,
    publishWebsite,
  } = useRevenueLoop();
  const [copied, setCopied] = useState(false);
  const prospect = state.prospects.find((item) => item.id === id);

  const research = state.research.find((item) => item.prospectId === id);
  const score = state.scores.find((item) => item.prospectId === id);
  const website = state.websites.find((item) => item.prospectId === id);
  const strategy = state.strategies.find((item) => item.prospectId === id);
  const call = state.calls.find((item) => item.prospectId === id);
  const payment = state.payments.find((item) => item.prospectId === id);
  const events = useMemo(
    () => state.events.filter((event) => event.prospectId === id),
    [state.events, id],
  );
  const transcripts = call
    ? state.transcripts.filter((entry) => entry.callId === call.id)
    : [];

  if (!prospect) {
    return (
      <Panel className="p-8">
        <h1 className="text-2xl font-semibold text-white">Prospect not found</h1>
        <Link href="/prospects" className="mt-4 inline-block text-emerald-200">
          Back to prospects
        </Link>
      </Panel>
    );
  }

  const previewUrl =
    website && typeof window !== "undefined"
      ? `${window.location.origin}/sites/${website.slug}`
      : website
        ? `/sites/${website.slug}`
        : "";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-white/10 bg-[#101214]/88 p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">{prospect.category}</Badge>
              <Badge tone="blue">{prospect.location}</Badge>
              <Badge tone={prospect.doNotContact ? "red" : "green"}>
                {prospect.doNotContact ? "Do Not Contact" : prospect.status}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">{prospect.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              {prospect.summary}
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/24 p-4">
            <div className="relative grid place-items-center">
              <ProgressRing value={prospect.opportunityScore} size={72} />
              <span className="absolute text-lg font-bold text-white">
                {prospect.opportunityScore}
              </span>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Estimated deal</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {currency(prospect.estimatedDealValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon={<Sparkles size={16} />}
            onClick={() => generateWebsite(prospect.id)}
          >
            Generate Website
          </Button>
          <Button
            icon={<PhoneCall size={16} />}
            onClick={() => void approveCall(prospect.id)}
            disabled={!website || prospect.doNotContact}
          >
            Approve AI Call
          </Button>
          <Button
            variant="danger"
            icon={<ShieldOff size={16} />}
            onClick={() => markDoNotContact(prospect.id, "Operator marked prospect as opted out.")}
            disabled={prospect.doNotContact}
          >
            Do Not Contact
          </Button>
          {website ? (
            <Link href={`/sites/${website.slug}`}>
              <Button variant="ghost" icon={<ExternalLink size={16} />}>
                Open Demo Site
              </Button>
            </Link>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <Panel>
            <PanelHeader title="Business Summary" eyebrow="public information" />
            <div className="space-y-4 p-5 text-sm leading-6 text-zinc-300">
              <div className="grid gap-3 sm:grid-cols-2">
                <p>
                  <span className="text-zinc-500">Address:</span> {prospect.address}
                </p>
                <p>
                  <span className="text-zinc-500">Phone:</span> {prospect.phone}
                </p>
                <p>
                  <span className="text-zinc-500">Rating:</span> {prospect.rating} from {prospect.reviewCount} reviews
                </p>
                <p>
                  <span className="text-zinc-500">Website:</span>{" "}
                  {prospect.websiteStatus === "no_website" ? "No website detected" : "Weak website detected"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">Publicly sourced information</p>
                <ul className="mt-2 space-y-1">
                  {prospect.publicInfo.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">AI-inferred information</p>
                <ul className="mt-2 space-y-1 text-zinc-400">
                  {prospect.inferredInfo.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Opportunity Analysis" eyebrow="decision summary" />
            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm font-semibold text-white">Evidence</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {research?.digitalPresenceAnalysis ?? prospect.whyGoodProspect}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <p className="text-sm font-semibold text-white">Decision</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Generate a website preview and request approval before any outreach.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm text-zinc-500">Confidence</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {percent((research?.confidence ?? 0.78) * 100)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm text-zinc-500">Next action</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {website ? "Review preview and approve call" : "Generate website"}
                  </p>
                </div>
              </div>
              {score ? (
                <div className="space-y-2">
                  {score.factors.map((factor) => (
                    <div key={factor.label}>
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>{factor.label}</span>
                        <span>
                          {factor.score}/{factor.max}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-300"
                          style={{ width: `${(factor.score / factor.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Agent Decision Log" eyebrow="audit trail" />
            <div className="space-y-3 p-5">
              {events.length === 0 ? (
                <p className="text-sm text-zinc-500">No prospect-specific events yet.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-white/10 bg-black/24 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      <span className="text-xs text-zinc-500">{shortTime(event.timestamp)}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{event.outputSummary}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <PanelHeader
              title="Website Generator"
              eyebrow="preview workspace"
              action={
                website ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      icon={copied ? <Check size={16} /> : <Copy size={16} />}
                      onClick={() => {
                        void navigator.clipboard.writeText(previewUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? "Copied" : "Copy URL"}
                    </Button>
                    <Button
                      variant="primary"
                      icon={<Globe2 size={16} />}
                      onClick={() => publishWebsite(website.id)}
                    >
                      Publish Demo Site
                    </Button>
                  </div>
                ) : null
              }
            />
            <div className="p-5">
              {!website ? (
                <div className="rounded-lg border border-dashed border-white/20 p-8 text-center">
                  <FileText className="mx-auto text-emerald-300" />
                  <p className="mt-3 font-semibold text-white">No preview generated yet</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Generate a responsive site using public facts and editable placeholders.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                    <GeneratedSitePreview website={website} prospect={prospect} />
                    <div className="mx-auto w-full max-w-[320px]">
                      <GeneratedSitePreview website={website} prospect={prospect} compact />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["emerald", "indigo", "amber"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => updateWebsiteTheme(website.id, style)}
                        className="h-9 rounded-lg border border-white/10 px-3 text-sm capitalize text-zinc-200 hover:border-emerald-300/40"
                      >
                        {style}
                      </button>
                    ))}
                    <Badge tone={website.published ? "green" : "amber"}>
                      {website.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {website.sections.map((section) => (
                      <label key={section.id} className="space-y-2">
                        <span className="text-sm font-semibold text-white">
                          {section.title}
                        </span>
                        <textarea
                          value={section.body}
                          onChange={(event) =>
                            updateWebsiteSection(website.id, section.id, event.target.value)
                          }
                          rows={3}
                          className="w-full rounded-lg border border-white/10 bg-black/28 p-3 text-sm leading-6 text-zinc-200 outline-none focus:border-emerald-300/50"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="rounded-lg border border-amber-300/20 bg-amber-300/8 p-4">
                    <p className="text-sm font-semibold text-amber-100">Missing information</p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-100/80">
                      {website.missingInfo.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Sales Agent" eyebrow="human approval gate" />
            <div className="space-y-4 p-5">
              {strategy ? (
                <>
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-sm text-zinc-500">Personalized opening</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {strategy.personalizedOpening}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-sm text-zinc-500">Package</p>
                      <p className="mt-2 font-semibold text-white">{strategy.packageName}</p>
                      <p className="text-sm text-zinc-400">
                        {currency(strategy.proposedPrice)} setup + {currency(strategy.monthlyPrice)}/mo
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-sm text-zinc-500">Conversion probability</p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        {percent(strategy.conversionProbability * 100)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <p className="text-sm font-semibold text-white">Objection handling</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">
                      {strategy.objectionResponses.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500">Generate a website to prepare the sales strategy.</p>
              )}

              {call ? (
                <div className="rounded-lg border border-white/10 bg-black/24 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">Call status: {call.status}</p>
                    <Badge tone="purple">Simulation</Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {transcripts.map((entry) => (
                      <div
                        key={entry.id}
                        className={
                          entry.speaker === "ai"
                            ? "ml-auto max-w-[88%] rounded-lg bg-emerald-300/12 p-3 text-sm text-emerald-50"
                            : "max-w-[88%] rounded-lg bg-white/[0.07] p-3 text-sm text-zinc-200"
                        }
                      >
                        <p className="text-xs uppercase text-zinc-500">{entry.speaker}</p>
                        <p className="mt-1 leading-6">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                  {call.outcome ? (
                    <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/8 p-3 text-sm text-emerald-100">
                      {call.outcome}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {payment ? (
                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/8 p-4">
                  <p className="font-semibold text-emerald-100">
                    Payment {payment.status}: {currency(payment.amount)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/70">
                    Checkout: {payment.checkoutUrl}
                  </p>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
