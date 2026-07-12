"use client";

import type { CallTranscriptEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CallTranscriptFeed({
  entries,
  className,
}: {
  entries: CallTranscriptEntry[];
  className?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {entries.map((entry) => (
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
  );
}
