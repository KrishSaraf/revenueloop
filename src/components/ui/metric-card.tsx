"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "accent";
  className?: string;
}) {
  const valueColor =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
        ? "text-rose-300"
        : tone === "accent"
          ? "text-emerald-300"
          : "text-zinc-100";

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111114] px-4 py-3.5",
        className,
      )}
    >
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className={cn("mt-1 font-mono text-xl font-semibold tabular-nums tracking-tight", valueColor)}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
