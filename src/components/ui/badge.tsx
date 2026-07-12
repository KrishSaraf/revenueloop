import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "green" | "blue" | "purple" | "amber" | "red" | "muted";

const tones: Record<BadgeTone, string> = {
  green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  blue: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  purple: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  red: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  muted: "border-white/10 bg-white/[0.05] text-zinc-400",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  tone = "muted",
  pulse = false,
  className,
}: {
  tone?: BadgeTone;
  pulse?: boolean;
  className?: string;
}) {
  const colors: Record<BadgeTone, string> = {
    green: "bg-emerald-400",
    blue: "bg-sky-400",
    purple: "bg-violet-400",
    amber: "bg-amber-400",
    red: "bg-rose-400",
    muted: "bg-zinc-500",
  };
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        colors[tone],
        pulse && "pulse-dot",
        className,
      )}
    />
  );
}
