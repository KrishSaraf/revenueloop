import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-500">
        <Icon size={18} aria-hidden />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-zinc-200">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
