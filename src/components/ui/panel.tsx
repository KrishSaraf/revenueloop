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
        "rounded-lg border border-white/10 bg-[#111315]/86 shadow-[0_18px_70px_rgba(0,0,0,0.32)]",
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
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
