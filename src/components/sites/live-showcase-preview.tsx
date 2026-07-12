"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ShowcaseSite } from "@/lib/showcase-sites";
import { cn } from "@/lib/utils";

function BrowserChrome({
  url,
  children,
  className,
  tall,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
  tall?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.1] bg-[#1a1a1e] shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#111114] px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[10px] text-zinc-500">
          {url}
        </div>
      </div>
      <div
        className={cn(
          "relative overflow-hidden bg-white",
          tall ? "h-[min(72vh,720px)]" : "aspect-[16/10]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function LiveShowcasePreview({
  site,
  tall = false,
  showActions = true,
}: {
  site: ShowcaseSite;
  tall?: boolean;
  showActions?: boolean;
}) {
  const displayUrl = site.external
    ? site.href.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `venturemint.app${site.href}`;

  return (
    <div className="space-y-4">
      {showActions ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">Live</Badge>
            <Badge tone="green">Verified</Badge>
            <Badge tone="muted">{site.buildLabel}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={site.href} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="primary" icon={<ExternalLink size={13} />}>
                Open live site
              </Button>
            </a>
            {!site.external ? (
              <Link href={site.href}>
                <Button size="sm" variant="ghost">
                  View in VentureMint
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <BrowserChrome url={displayUrl} tall={tall}>
        {site.external ? (
          <iframe
            src={site.href}
            title={`${site.name} live preview`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
        ) : (
          <iframe
            src={site.href}
            title={`${site.name} preview`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
          />
        )}
      </BrowserChrome>

      {showActions ? (
        <p className="text-xs leading-relaxed text-zinc-500">{site.tagline}</p>
      ) : null}
    </div>
  );
}
