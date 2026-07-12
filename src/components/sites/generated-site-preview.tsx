"use client";

import type { GeneratedWebsite, Prospect } from "@/lib/types";
import {
  extractPreviewSections,
  getPreviewLayoutId,
} from "@/lib/site-design";
import { PreviewLayoutRouter } from "@/components/sites/preview-layouts";
import { cn } from "@/lib/utils";

export function GeneratedSitePreview({
  website,
  prospect,
  compact = false,
}: {
  website: GeneratedWebsite;
  prospect: Prospect;
  compact?: boolean;
}) {
  const layoutId = getPreviewLayoutId(prospect);
  const sections = extractPreviewSections(website);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200 shadow-2xl shadow-black/30",
        compact ? "text-[11px]" : "text-sm",
      )}
    >
      <PreviewLayoutRouter
        layoutId={layoutId}
        prospect={prospect}
        sections={sections}
        compact={compact}
      />
    </div>
  );
}
