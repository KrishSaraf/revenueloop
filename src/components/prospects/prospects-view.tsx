"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency } from "@/lib/utils";

export function ProspectsView() {
  const { state, discoverProspects, generateWebsite, selectProspect } = useRevenueLoop();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [location, setLocation] = useState("Singapore");
  const [category, setCategory] = useState("Any");
  const [maxProspects, setMaxProspects] = useState(5);
  const [minimumRating, setMinimumRating] = useState(4.2);
  const [websiteStatus, setWebsiteStatus] = useState<
    "no_website" | "weak_website" | "either"
  >("either");
  const providerLabel =
    state.settings.discoveryProvider === "google"
      ? "Google Places"
      : state.settings.discoveryProvider === "overpass"
        ? "OpenStreetMap Overpass"
        : "Mock provider";

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Badge tone="blue">Lead discovery</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">Prospects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Find Singapore businesses where an owned website and enquiry flow can create measurable value.
          </p>
        </div>
      </div>

      <Panel>
        <PanelHeader title="Discovery Controls" eyebrow="search provider" />
        <div className="grid gap-4 p-5 md:grid-cols-5">
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
            >
              <option>Any</option>
              <option>Salon</option>
              <option>Tuition centre</option>
              <option>Bicycle repair shop</option>
              <option>Independent wellness studio</option>
              <option>Cafe</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Max prospects</span>
            <input
              type="number"
              min={1}
              max={20}
              value={maxProspects}
              onChange={(event) => setMaxProspects(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Minimum rating</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={minimumRating}
              onChange={(event) => setMinimumRating(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Website status</span>
            <select
              value={websiteStatus}
              onChange={(event) =>
                setWebsiteStatus(event.target.value as typeof websiteStatus)
              }
              className="h-10 w-full rounded-lg border border-white/10 bg-black/28 px-3 text-sm text-white outline-none focus:border-emerald-300/50"
            >
              <option value="either">Either</option>
              <option value="no_website">No website</option>
              <option value="weak_website">Weak website</option>
            </select>
          </label>
          <div className="md:col-span-5">
            <Button
              variant="primary"
              icon={<Search size={16} />}
              disabled={isDiscovering}
              onClick={async () => {
                setIsDiscovering(true);
                setDiscoveryError(null);
                try {
                  await discoverProspects({
                    location,
                    category,
                    maxProspects,
                    minimumRating,
                    websiteStatus,
                  });
                } catch (error) {
                  setDiscoveryError(
                    error instanceof Error
                      ? error.message
                      : "Prospect discovery failed.",
                  );
                } finally {
                  setIsDiscovering(false);
                }
              }}
            >
              {isDiscovering ? "Discovering..." : "Start discovery"}
            </Button>
            <Badge
              tone={
                state.settings.discoveryProvider === "overpass"
                  ? "green"
                  : state.settings.discoveryProvider === "google"
                    ? "blue"
                    : "purple"
              }
              className="ml-3"
            >
              {providerLabel}
            </Badge>
            {discoveryError ? (
              <p className="mt-3 rounded-lg border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">
                {discoveryError}
              </p>
            ) : null}
          </div>
        </div>
      </Panel>

      {state.prospects.length === 0 ? (
        <Panel className="p-8 text-center">
          <p className="text-lg font-semibold text-white">No prospects found</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try a broader category, lower minimum rating, or switch website status to either.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {state.prospects.map((prospect) => (
          <article
            key={prospect.id}
            className="rounded-lg border border-white/10 bg-[#101214]/86 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="muted">{prospect.category}</Badge>
                  <Badge
                    tone={
                      prospect.websiteStatus === "no_website"
                        ? "green"
                        : prospect.websiteStatus === "weak_website"
                          ? "amber"
                          : "blue"
                    }
                  >
                    {prospect.websiteStatus === "no_website"
                      ? "No website"
                      : prospect.websiteStatus === "weak_website"
                        ? "Weak website"
                        : "Healthy website"}
                  </Badge>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">
                  {prospect.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">{prospect.address}</p>
              </div>
              <div className="relative grid place-items-center">
                <ProgressRing value={prospect.opportunityScore} />
                <span className="absolute text-sm font-bold text-white">
                  {prospect.opportunityScore}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-white/[0.05] p-3">
                <p className="text-zinc-500">Rating</p>
                <p className="mt-1 font-semibold text-white">
                  {prospect.rating} · {prospect.reviewCount} reviews
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.05] p-3">
                <p className="text-zinc-500">Phone</p>
                <p className="mt-1 font-semibold text-white">{prospect.phone}</p>
              </div>
              <div className="rounded-lg bg-white/[0.05] p-3">
                <p className="text-zinc-500">Deal value</p>
                <p className="mt-1 font-semibold text-white">
                  {currency(prospect.estimatedDealValue)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {prospect.whyGoodProspect}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              AI-inferred: {prospect.onlineBookingValue}
            </p>
            {prospect.currentWebsiteUrl ? (
              <a
                href={prospect.currentWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block truncate text-xs text-sky-200 hover:text-sky-100"
              >
                Existing website: {prospect.currentWebsiteUrl}
              </a>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/prospects/${prospect.id}`} onClick={() => selectProspect(prospect.id)}>
                <Button icon={<ArrowRight size={16} />}>Open workspace</Button>
              </Link>
              <Button
                variant="ghost"
                icon={<Sparkles size={16} />}
                onClick={() => generateWebsite(prospect.id)}
              >
                Generate website
              </Button>
              <Badge tone="purple" className="ml-auto">
                {prospect.status}
              </Badge>
            </div>
          </article>
        ))}
      </div>

      <Panel>
        <PanelHeader
          title="Scoring Inputs"
          eyebrow="transparent ranking"
          action={<Filter size={18} className="text-emerald-300" />}
        />
        <div className="grid gap-3 p-5 text-sm text-zinc-300 md:grid-cols-3">
          <p>No or weak website presence.</p>
          <p>Strong rating and review count.</p>
          <p>Public information is available for a useful draft.</p>
          <p>Booking or enquiry flow would create value.</p>
          <p>Social-only presence leaves an owned-channel gap.</p>
          <p>Category has local search intent.</p>
        </div>
      </Panel>
    </div>
  );
}
