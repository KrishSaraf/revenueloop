"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { PreviewLayoutRouter } from "@/components/sites/preview-layouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { extractPreviewSections } from "@/lib/site-design";
import type { BuildPreviewSite } from "@/lib/showcase-sites";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function BrowserChrome({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0d0d10] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#16161a] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md bg-black/40 px-2.5 py-0.5 font-mono text-[9px] text-zinc-500">
          {url}
        </div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-white">{children}</div>
    </div>
  );
}

function BuildPreviewThumb({ site }: { site: BuildPreviewSite }) {
  const sections = extractPreviewSections(site.website);

  return (
    <BrowserChrome url={`venturemint.sg/${site.slug}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none origin-top-left scale-[0.36] w-[280%]">
          <PreviewLayoutRouter
            layoutId={site.layoutId}
            prospect={site.prospect}
            sections={sections}
            compact
          />
        </div>
      </div>
    </BrowserChrome>
  );
}

export function BuildPreviewCard({
  site,
  index,
}: {
  site: BuildPreviewSite;
  index: number;
}) {
  return (
    <motion.article
      variants={fade}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114] transition-all duration-300",
        site.glow,
      )}
    >
      <div className="border-b border-white/[0.06] p-3 sm:p-4">
        <BuildPreviewThumb site={site} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] text-zinc-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-zinc-400">
              <Globe2 size={15} aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">{site.name}</h3>
              <p className="text-[11px] text-zinc-500">{site.buildLabel}</p>
            </div>
          </div>
          <Badge tone="muted">Preview</Badge>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{site.tagline}</p>

        <div className="flex flex-wrap gap-1.5">
          {site.highlights.map((item) => (
            <span
              key={item}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[10px] text-zinc-600">{site.agent}</span>
          <div className="flex gap-2">
            {site.prospectId ? (
              <Link href={`/prospects/${site.prospectId}`}>
                <Button size="sm" variant="ghost">
                  Prospect
                </Button>
              </Link>
            ) : null}
            <Link href={site.href}>
              <Button
                size="sm"
                variant="secondary"
                icon={<ArrowUpRight size={13} />}
                className="group-hover:border-emerald-400/30 group-hover:text-emerald-300"
              >
                Open preview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
