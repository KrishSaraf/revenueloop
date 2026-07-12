"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GeneratedSitePreview } from "@/components/sites/generated-site-preview";
import { BugisBrewConciergeShowcase } from "@/components/sites/showcase/bugis-brew-concierge";
import { SalesAgentShowcase } from "@/components/sites/showcase/sales-agent-demo";
import { ToaPayohTelebotShowcase } from "@/components/sites/showcase/toa-payoh-telebot";
import { getShowcaseSite } from "@/lib/showcase-sites";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

const showcaseComponents: Record<string, () => ReactNode> = {
  "toa-payoh-telebot": () => <ToaPayohTelebotShowcase />,
  "sales-agent-demo": () => <SalesAgentShowcase />,
  "bugis-brew-concierge": () => <BugisBrewConciergeShowcase />,
};

export function GeneratedSitePage({ slug }: { slug: string }) {
  const showcase = getShowcaseSite(slug);
  const ShowcaseComponent = showcaseComponents[slug];
  const { state, hydrated } = useRevenueLoop();
  const website = state.websites.find((item) => item.slug === slug);
  const prospect = website
    ? state.prospects.find((item) => item.id === website.prospectId)
    : undefined;

  if (ShowcaseComponent) {
    return <>{ShowcaseComponent()}</>;
  }

  if (showcase?.external) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0a0a0c] p-6 text-zinc-100">
        <EmptyState
          icon={Globe2}
          title={`${showcase.name} is live`}
          description="This build is hosted outside VentureMint. Open the live Netlify site to view the full massage booking experience."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href={showcase.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary">Open live site</Button>
              </a>
              <Link href="/sites">
                <Button variant="ghost" icon={<ArrowLeft size={14} />}>
                  Back to sites
                </Button>
              </Link>
            </div>
          }
          className="w-full max-w-md border-white/10"
        />
      </main>
    );
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#0a0a0c] p-6">
        <div className="mx-auto max-w-5xl">
          <div className="skeleton h-96 rounded-xl" aria-hidden />
        </div>
      </main>
    );
  }

  if (!website || !prospect) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0a0a0c] p-6 text-zinc-100">
        <EmptyState
          icon={Globe2}
          title="Generated site not found"
          description="This preview is not in the showcase catalog. Return to generated sites to view the four flagship builds."
          action={
            <Link href="/sites">
              <Button icon={<ArrowLeft size={14} />}>Back to sites</Button>
            </Link>
          }
          className="w-full max-w-md border-white/10"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] p-3 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#111114] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={website.published ? "green" : "amber"}>
              {website.published ? "Published preview" : "Draft"}
            </Badge>
            <Badge tone={website.verified ? "green" : "amber"}>
              {website.verified ? "Verification passed" : "Unverified"}
            </Badge>
            <Badge tone="purple">Owner approval required</Badge>
          </div>
          <Link href={`/prospects/${prospect.id}`}>
            <Button size="sm" variant="ghost" icon={<ArrowLeft size={14} />}>
              Back to workspace
            </Button>
          </Link>
        </div>
        <GeneratedSitePreview website={website} prospect={prospect} />
      </div>
    </main>
  );
}
