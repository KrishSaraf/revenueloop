import { cn } from "@/lib/utils";

export function ConfidenceIndicator({
  value,
  className,
}: {
  value: number; // 0..1
  className?: string;
}) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-amber-400" : "bg-zinc-500";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
        <span
          className={cn("block h-full rounded-full", tone)}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="font-mono text-[11px] text-zinc-400">{pct}%</span>
    </span>
  );
}
