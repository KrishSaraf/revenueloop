"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  FileSearch,
  Monitor,
  Smartphone,
  Sparkles,
  Tablet,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceIndicator } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import { LoopProgress } from "@/components/ui/loop-progress";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProgressRing } from "@/components/ui/progress-ring";
import { TabList } from "@/components/ui/tabs";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { ApprovalCard } from "@/components/shared/approval-card";
import { GeneratedSitePreview } from "@/components/sites/generated-site-preview";
import { stateTone } from "@/lib/presentation";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { stateLabels } from "@/lib/types";
import { cn, currency, percent } from "@/lib/utils";

type TabId =
  | "overview"
  | "evidence"
  | "opportunity"
  | "solution"
  | "preview"
  | "sales"
  | "activity"
  | "financials";

const viewportWidths = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
} as const;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      icon={<Copy size={13} />}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-label={`Copy ${label}`}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
        {label}
      </p>
      <div className="mt-0.5 text-sm text-zinc-200">{value}</div>
    </div>
  );
}

export function ProspectWorkspace({ id }: { id: string }) {
  const {
    state,
    generateWebsite,
    updateWebsiteSection,
    updateWebsiteTheme,
    publishWebsite,
    hydrated,
  } = useRevenueLoop();
  const [tab, setTab] = useState<TabId>("overview");
  const [viewport, setViewport] = useState<keyof typeof viewportWidths>("desktop");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");

  const prospect = state.prospects.find((item) => item.id === id);
  const research = state.research.find((item) => item.prospectId === id);
  const score = state.scores.find((item) => item.prospectId === id);
  const website = state.websites.find((item) => item.prospectId === id);
  const strategy = state.strategies.find((item) => item.prospectId === id);
  const call = state.calls.find((item) => item.prospectId === id);
  const transcript = state.transcripts.filter((item) => item.callId === call?.id);
  const offer = state.offers.find((item) => item.prospectId === id);
  const payment = state.payments.find((item) => item.prospectId === id);
  const evidence = state.evidence.filter((item) => item.prospectId === id);
  const events = state.events.filter((item) => item.prospectId === id);

  const financials = useMemo(() => {
    if (!prospect) return null;
    const actualRevenue =
      payment?.status === "Paid" ? payment.amount : 0;
    const costs = state.costs
      .filter((c) => c.prospectId === id)
      .reduce((sum, c) => sum + c.amount, 0);
    const estimatedCost = prospect.estimatedDeliveryCost ?? 0;
    const totalCost = Math.max(costs, estimatedCost);
    return {
      estimatedRevenue: prospect.estimatedDealValue,
      actualRevenue,
      totalCost,
      grossProfit: actualRevenue - totalCost,
      projectedProfit: prospect.estimatedDealValue - totalCost,
    };
  }, [prospect, payment, state.costs, id]);

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#111114] p-8">
        <p className="text-sm text-zinc-500">Loading workspace…</p>
      </div>
    );
  }

  if (!prospect) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Prospect not found"
        description="This prospect does not exist in the current dataset. It may have been removed by a workspace reset."
        action={
          <Link href="/prospects">
            <Button icon={<ArrowLeft size={14} />}>Back to prospects</Button>
          </Link>
        }
      />
    );
  }

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "Evidence", count: evidence.length },
    { id: "opportunity", label: "Opportunity" },
    { id: "solution", label: "Solution" },
    { id: "preview", label: "Website Preview" },
    { id: "sales", label: "Sales Package" },
    { id: "activity", label: "Activity", count: events.length },
    { id: "financials", label: "Financials" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Link
          href="/prospects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={13} aria-hidden />
          Prospects
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-zinc-100">{prospect.name}</h1>
              <Badge tone={stateTone[prospect.agentState]}>
                {stateLabels[prospect.agentState]}
              </Badge>
              {prospect.doNotContact ? <Badge tone="red">Do Not Contact</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {prospect.category} · {prospect.location} ·{" "}
              <span className="font-mono">{prospect.rating.toFixed(1)}★</span> ·{" "}
              {prospect.reviewCount} reviews ·{" "}
              <span className="font-mono">{prospect.phone}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-zinc-600">
                Deal value
              </p>
              <p className="font-mono text-lg font-semibold text-zinc-100">
                {currency(prospect.estimatedDealValue)}
              </p>
            </div>
            <div className="relative grid place-items-center">
              <ProgressRing value={prospect.opportunityScore} size={56} />
              <span className="absolute font-mono text-sm font-bold text-zinc-100">
                {prospect.opportunityScore}
              </span>
            </div>
          </div>
        </div>
        <LoopProgress currentState={prospect.agentState} className="mt-3" />
      </div>

      {prospect.agentState === "AWAITING_APPROVAL" && !prospect.doNotContact ? (
        <ApprovalCard
          prospect={prospect}
          strategy={strategy}
          previewSlug={website?.slug}
        />
      ) : null}

      <TabList tabs={tabs} active={tab} onSelect={setTab} />

      {/* ─── Overview ─── */}
      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader eyebrow="Summary" title="Business intelligence" />
            <div className="space-y-4 p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-zinc-300">{prospect.summary}</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Detail label="Digital presence" value={
                  prospect.websiteStatus === "no_website"
                    ? "No owned website detected"
                    : prospect.websiteStatus === "weak_website"
                      ? "Weak website — poor mobile and conversion path"
                      : "Healthy website"
                } />
                <Detail label="Social channels" value={
                  prospect.socialPresence.length > 0
                    ? prospect.socialPresence.join(", ")
                    : "None detected"
                } />
                <Detail label="Contact" value={<span className="font-mono text-xs">{prospect.phone}</span>} />
                <Detail label="Address" value={prospect.address} />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Key weaknesses
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(prospect.identifiedGaps ?? []).map((gap) => (
                    <Badge key={gap} tone="amber">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Why this is a good prospect
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  {prospect.whyGoodProspect}
                </p>
              </div>
              {research ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Research analysis
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {research.digitalPresenceAnalysis}
                  </p>
                  <div className="mt-2">
                    <ConfidenceIndicator value={research.confidence} />
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
          <Panel>
            <PanelHeader eyebrow="Impact" title="Commercial estimate" />
            <div className="space-y-2.5 p-4 sm:p-5">
              <Detail
                label="Estimated monthly impact"
                value={
                  prospect.monthlyImpactHigh ? (
                    <span className="font-mono">
                      {currency(prospect.monthlyImpactLow ?? 0)}–
                      {currency(prospect.monthlyImpactHigh)}
                    </span>
                  ) : (
                    "Not yet quantified"
                  )
                }
              />
              <Detail
                label="Suggested pricing"
                value={
                  <span className="font-mono">
                    {currency(prospect.estimatedDealValue)} setup
                    {prospect.suggestedMonthlyPrice
                      ? ` + ${currency(prospect.suggestedMonthlyPrice)}/mo`
                      : ""}
                  </span>
                }
              />
              <Detail
                label="Estimated delivery cost"
                value={
                  <span className="font-mono">
                    {currency(prospect.estimatedDeliveryCost ?? 0)}
                  </span>
                }
              />
              <Detail
                label="Recommended solution"
                value={prospect.onlineBookingValue}
              />
              {!website && !prospect.doNotContact && prospect.agentState !== "REJECTED" ? (
                <Button
                  variant="primary"
                  className="mt-2 w-full"
                  icon={<Sparkles size={14} />}
                  onClick={() => generateWebsite(prospect.id)}
                >
                  Build solution
                </Button>
              ) : null}
            </div>
          </Panel>
        </div>
      ) : null}

      {/* ─── Evidence ─── */}
      {tab === "evidence" ? (
        evidence.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No evidence collected yet"
            description="Evidence is captured during research. Run the loop or generate a solution to populate this tab."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.08] bg-[#111114] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-zinc-200">{item.claim}</p>
                  {item.verified ? (
                    <Badge tone="green">
                      <CheckCircle2 size={11} aria-hidden /> Verified
                    </Badge>
                  ) : (
                    <Badge tone="amber">
                      <Circle size={11} aria-hidden /> Unverified
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
                  <span>
                    Source: <span className="text-zinc-400">{item.source}</span>
                  </span>
                  <ConfidenceIndicator value={item.confidence} />
                  <span className="font-mono text-zinc-600">
                    {new Date(item.capturedAt).toLocaleDateString("en-SG")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}

      {/* ─── Opportunity ─── */}
      {tab === "opportunity" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader eyebrow="Thesis" title="Opportunity thesis" />
            <div className="space-y-4 p-4 sm:p-5">
              <blockquote className="border-l-2 border-emerald-400/50 pl-4 text-sm leading-relaxed text-zinc-300">
                {prospect.name} has strong customer demand
                {prospect.websiteStatus === "no_website"
                  ? " but no direct conversion workflow"
                  : " but a weak conversion workflow"}
                . VentureMint estimates that {prospect.onlineBookingValue.toLowerCase()}
              </blockquote>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Detail
                  label="Problem"
                  value={
                    strategy?.identifiedProblem ??
                    "Potential enquiries are lost because customers cannot act instantly online."
                  }
                />
                <Detail
                  label="Why it matters"
                  value={`${prospect.rating.toFixed(1)}★ across ${prospect.reviewCount} reviews shows real demand hitting a broken funnel.`}
                />
                <Detail
                  label="Estimated impact"
                  value={
                    prospect.monthlyImpactHigh ? (
                      <span className="font-mono">
                        {currency(prospect.monthlyImpactLow ?? 0)}–
                        {currency(prospect.monthlyImpactHigh)}/month
                      </span>
                    ) : (
                      "Pending quantification"
                    )
                  }
                />
                <Detail
                  label="Probability of sale"
                  value={
                    strategy
                      ? percent(strategy.conversionProbability * 100)
                      : prospect.opportunityScore >= 85
                        ? "~62% (score-based estimate)"
                        : "~44% (score-based estimate)"
                  }
                />
                <Detail
                  label="Recommended price"
                  value={
                    <span className="font-mono">
                      {currency(prospect.estimatedDealValue)} +{" "}
                      {currency(prospect.suggestedMonthlyPrice ?? 49)}/mo
                    </span>
                  }
                />
                <Detail
                  label="Expected margin (first month)"
                  value={
                    <span className="font-mono">
                      {currency(
                        prospect.estimatedDealValue -
                          (prospect.estimatedDeliveryCost ?? 0),
                      )}
                    </span>
                  }
                />
              </div>
              <p className="text-[11px] text-zinc-600">
                Assumptions derive from public listing signals and category benchmarks.
                Impact ranges are estimates, not guarantees, and are editable before the
                pitch is approved.
              </p>
            </div>
          </Panel>
          <Panel>
            <PanelHeader eyebrow="Scoring" title="Score breakdown" />
            <div className="space-y-2.5 p-4 sm:p-5">
              {(score?.factors ?? []).map((factor) => (
                <div key={factor.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-400">{factor.label}</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {factor.score}/{factor.max}
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-emerald-400/70"
                      style={{ width: `${(factor.score / factor.max) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-600">{factor.evidence}</p>
                </div>
              ))}
              {!score ? (
                <p className="text-xs text-zinc-500">
                  Scoring runs during the loop. The headline score of{" "}
                  {prospect.opportunityScore} comes from the discovery pass.
                </p>
              ) : null}
            </div>
          </Panel>
        </div>
      ) : null}

      {/* ─── Solution ─── */}
      {tab === "solution" ? (
        website ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader eyebrow="Execution" title="Generated plan" />
              <div className="space-y-4 p-4 sm:p-5">
                <Detail
                  label="Objective"
                  value={`Convert ${prospect.name}'s existing search demand into structured, trackable enquiries.`}
                />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Deliverables
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {website.sections.map((section) => (
                      <li key={section.id} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-hidden />
                        {section.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Verification checks
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {website.verificationChecks.map((check) => (
                      <li key={check.id} className="flex items-center gap-2 text-sm">
                        {check.passed ? (
                          <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-hidden />
                        ) : (
                          <XCircle size={14} className="shrink-0 text-rose-400" aria-hidden />
                        )}
                        <span className={check.passed ? "text-zinc-300" : "text-rose-300"}>
                          {check.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Awaiting owner confirmation
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {website.missingInfo.map((item) => (
                      <Badge key={item} tone="amber">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
            <Panel>
              <PanelHeader eyebrow="Agents" title="Execution graph" />
              <ol className="space-y-0 p-4 sm:p-5">
                {[
                  { agent: "Research Agent", output: "Digital presence analysis", cost: 0.08 },
                  { agent: "Scoring Agent", output: `Opportunity score ${prospect.opportunityScore}/100`, cost: 0.03 },
                  { agent: "Strategy Agent", output: "Sales package and pricing", cost: 0.11 },
                  { agent: "Build Agent", output: `${website.sections.length}-section preview site`, cost: 0.18 },
                  { agent: "Verification Agent", output: `${website.verificationChecks.filter((c) => c.passed).length}/${website.verificationChecks.length} checks passed`, cost: 0.06 },
                ].map((node, index, list) => (
                  <li key={node.agent} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < list.length - 1 ? (
                      <span className="absolute top-5 left-[7px] h-full w-px bg-white/10" aria-hidden />
                    ) : null}
                    <span className="relative z-10 mt-1 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-emerald-400/40 bg-emerald-400/20">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200">{node.agent}</p>
                      <p className="text-[11px] text-zinc-500">{node.output}</p>
                      <p className="font-mono text-[10px] text-zinc-600">
                        cost S${node.cost.toFixed(2)} · complete
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No solution generated yet"
            description="The Build Agent creates the plan, preview site and verification report once research and scoring complete."
            action={
              !prospect.doNotContact && prospect.agentState !== "REJECTED" ? (
                <Button
                  variant="primary"
                  icon={<Sparkles size={14} />}
                  onClick={() => generateWebsite(prospect.id)}
                >
                  Build solution now
                </Button>
              ) : undefined
            }
          />
        )
      ) : null}

      {/* ─── Website preview ─── */}
      {tab === "preview" ? (
        website ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
                {(
                  [
                    { id: "desktop", icon: Monitor, label: "Desktop" },
                    { id: "tablet", icon: Tablet, label: "Tablet" },
                    { id: "mobile", icon: Smartphone, label: "Mobile" },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setViewport(option.id)}
                      className={cn(
                        "grid h-7 w-9 cursor-pointer place-items-center rounded-md transition-colors",
                        viewport === option.id
                          ? "bg-white/10 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300",
                      )}
                      aria-label={`${option.label} viewport`}
                      aria-pressed={viewport === option.id}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1" role="group" aria-label="Theme">
                  {(["emerald", "indigo", "amber"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateWebsiteTheme(website.id, style)}
                      className={cn(
                        "h-6 w-6 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
                        style === "emerald" && "bg-emerald-500",
                        style === "indigo" && "bg-indigo-500",
                        style === "amber" && "bg-amber-500",
                        website.theme.style === style
                          ? "border-white"
                          : "border-transparent",
                      )}
                      aria-label={`${style} theme`}
                      aria-pressed={website.theme.style === style}
                    />
                  ))}
                </div>
                <Link href={`/sites/${website.slug}`}>
                  <Button size="sm" variant="ghost" icon={<ExternalLink size={13} />}>
                    Open preview
                  </Button>
                </Link>
                <CopyButton
                  text={`/sites/${website.slug}`}
                  label="preview link"
                />
                {!website.published ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => publishWebsite(website.id)}
                    disabled={state.safetyLock}
                  >
                    Publish preview
                  </Button>
                ) : (
                  <Badge tone="green">Published</Badge>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d0d10] p-4 sm:p-6">
              <div
                className="mx-auto transition-[max-width] duration-300"
                style={{ maxWidth: viewportWidths[viewport] }}
              >
                <GeneratedSitePreview website={website} prospect={prospect} />
              </div>
            </div>

            <Panel>
              <PanelHeader eyebrow="Editor" title="Edit content" />
              <div className="divide-y divide-white/[0.06]">
                {website.sections.map((section) => (
                  <div key={section.id} className="px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-zinc-300">
                        {section.title}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (editingSection === section.id) {
                            updateWebsiteSection(website.id, section.id, draftBody);
                            setEditingSection(null);
                          } else {
                            setEditingSection(section.id);
                            setDraftBody(section.body);
                          }
                        }}
                      >
                        {editingSection === section.id ? "Save" : "Edit"}
                      </Button>
                    </div>
                    {editingSection === section.id ? (
                      <textarea
                        value={draftBody}
                        onChange={(event) => setDraftBody(event.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100"
                        aria-label={`Edit ${section.title}`}
                      />
                    ) : (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {section.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ) : (
          <EmptyState
            icon={Monitor}
            title="No preview available"
            description="Generate the solution first — the Build Agent creates a category-appropriate preview site."
          />
        )
      ) : null}

      {/* ─── Sales package ─── */}
      {tab === "sales" ? (
        strategy ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <PanelHeader
                eyebrow="Pitch"
                title="Personalised pitch"
                action={<CopyButton text={strategy.personalizedOpening} label="pitch" />}
              />
              <div className="space-y-4 p-4 sm:p-5">
                <Detail label="Opening" value={strategy.personalizedOpening} />
                <Detail label="Identified problem" value={strategy.identifiedProblem} />
                <Detail label="Value proposition" value={strategy.valueProposition} />
                <Detail
                  label="Offer"
                  value={
                    <span className="font-mono">
                      {strategy.packageName} — {currency(strategy.proposedPrice)} setup +{" "}
                      {currency(strategy.monthlyPrice)}/mo
                    </span>
                  }
                />
                <Detail label="Call objective" value={strategy.callObjective} />
                <Detail label="Negotiation limits" value={strategy.negotiationLimits} />
              </div>
            </Panel>
            <div className="space-y-4">
              <Panel>
                <PanelHeader eyebrow="Objections" title="Objection handling" />
                <ul className="space-y-2.5 p-4 sm:p-5">
                  {strategy.objectionResponses.map((response, index) => (
                    <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-zinc-400">
                      <span className="font-mono text-[11px] text-zinc-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {response}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel>
                <PanelHeader eyebrow="Comparison" title="Before and after" />
                <div className="grid grid-cols-2 gap-px bg-white/[0.05]">
                  <div className="bg-[#111114] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-300/70">
                      Before
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-500">
                      <li>Manual DM and phone enquiries</li>
                      <li>No booking or order page</li>
                      <li>No service catalogue</li>
                      <li>No lead tracking</li>
                    </ul>
                  </div>
                  <div className="bg-[#111114] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300/80">
                      After
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-zinc-400">
                      <li>Structured enquiry funnel</li>
                      <li>Mobile-optimised experience</li>
                      <li>Instant service information</li>
                      <li>Trackable requests</li>
                    </ul>
                  </div>
                </div>
              </Panel>
              <Panel>
                <PanelHeader eyebrow="Status" title="Approval status" />
                <div className="p-4 sm:p-5">
                  {prospect.approvedForCall ? (
                    <Badge tone="green">Approved by operator</Badge>
                  ) : prospect.agentState === "AWAITING_APPROVAL" ? (
                    <Badge tone="amber">Awaiting human approval</Badge>
                  ) : (
                    <Badge tone="muted">Not yet at approval gate</Badge>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    Contact actions stay locked until a human approves this package.
                    Estimated conversion:{" "}
                    <span className="font-mono text-zinc-300">
                      {percent(strategy.conversionProbability * 100)}
                    </span>
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileSearch}
            title="No sales package yet"
            description="The Strategy Agent prepares the pitch, pricing and objection handling after the solution is built."
          />
        )
      ) : null}

      {/* ─── Activity ─── */}
      {tab === "activity" ? (
        <Panel>
          <PanelHeader eyebrow="Audit trail" title={`Timeline for ${prospect.name}`} />
          <ActivityFeed events={events} />
        </Panel>
      ) : null}

      {/* ─── Financials ─── */}
      {tab === "financials" && financials ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Estimated revenue"
            value={<span className="font-mono">{currency(financials.estimatedRevenue)}</span>}
          />
          <Detail
            label="Actual revenue"
            value={
              <span className={cn("font-mono", financials.actualRevenue > 0 && "text-emerald-300")}>
                {currency(financials.actualRevenue)}
              </span>
            }
          />
          <Detail
            label="Delivery cost"
            value={<span className="font-mono">{currency(financials.totalCost)}</span>}
          />
          <Detail
            label={financials.actualRevenue > 0 ? "Gross profit" : "Projected profit"}
            value={
              <span className="font-mono text-emerald-300">
                {currency(
                  financials.actualRevenue > 0
                    ? financials.grossProfit
                    : financials.projectedProfit,
                )}
              </span>
            }
          />
          {offer ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <Panel>
                <PanelHeader eyebrow="Deal" title="Offer and payment" />
                <div className="grid gap-2.5 p-4 sm:grid-cols-3 sm:p-5">
                  <Detail
                    label="Package"
                    value={`${offer.packageName} (${offer.status})`}
                  />
                  <Detail
                    label="Setup + recurring"
                    value={
                      <span className="font-mono">
                        {currency(offer.setupAmount)} + {currency(offer.monthlyAmount)}/mo
                      </span>
                    }
                  />
                  <Detail
                    label="Payment"
                    value={
                      payment ? (
                        <Badge
                          tone={
                            payment.status === "Paid"
                              ? "green"
                              : payment.status === "Pending"
                                ? "amber"
                                : "red"
                          }
                        >
                          {payment.status}
                        </Badge>
                      ) : (
                        "No payment created"
                      )
                    }
                  />
                </div>
              </Panel>
            </div>
          ) : null}
          {transcript.length > 0 ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <Panel>
                <PanelHeader eyebrow="Call" title="Simulated call transcript" />
                <div className="space-y-2 p-4 sm:p-5">
                  {transcript.map((entry) => (
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
                  ))}
                </div>
              </Panel>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
