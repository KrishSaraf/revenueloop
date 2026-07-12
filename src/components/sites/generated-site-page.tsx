"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeneratedSitePreview } from "@/components/sites/generated-site-preview";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

export function GeneratedSitePage({ slug }: { slug: string }) {
  const { state } = useRevenueLoop();
  const website = state.websites.find((item) => item.slug === slug);
  const prospect = website
    ? state.prospects.find((item) => item.id === website.prospectId)
    : undefined;

  if (!website || !prospect) {
    return (
      <main className="min-h-screen bg-[#080a0b] p-6 text-white">
        <div className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/[0.05] p-8">
          <Badge tone="amber">Preview unavailable</Badge>
          <h1 className="mt-4 text-3xl font-bold">Generated site not found</h1>
          <p className="mt-2 text-zinc-400">
            Run the demo or generate a website from a prospect workspace first.
          </p>
          <Link href="/dashboard" className="mt-5 inline-block">
            <Button>Back to command centre</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-3 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 text-white">
          <div className="flex flex-wrap gap-2">
            <Badge tone={website.published ? "green" : "amber"}>
              {website.published ? "Published demo" : "Draft demo"}
            </Badge>
            <Badge tone="purple">Owner approval required</Badge>
          </div>
          <Link href={`/prospects/${prospect.id}`}>
            <Button variant="ghost">Back to workspace</Button>
          </Link>
        </div>
        <GeneratedSitePreview website={website} prospect={prospect} />
      </div>
    </main>
  );
}
