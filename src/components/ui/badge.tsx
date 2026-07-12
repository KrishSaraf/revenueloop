import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "green" | "blue" | "purple" | "amber" | "red" | "muted";

const tones: Record<BadgeTone, string> = {
  green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  blue: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  purple: "border-violet-300/30 bg-violet-300/10 text-violet-200",
  amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  red: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  muted: "border-white/10 bg-white/[0.06] text-zinc-300",
};

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
