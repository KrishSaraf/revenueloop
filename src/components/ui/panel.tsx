import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111114]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </div>
      {action}
    </div>
  );
}
