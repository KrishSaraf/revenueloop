"use client";

import { cn } from "@/lib/utils";

export function TabList<T extends string>({
  tabs,
  active,
  onSelect,
  className,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onSelect: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-white/[0.08] pb-px",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="ml-1.5 rounded-full bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {tab.count}
              </span>
            ) : null}
            {isActive ? (
              <span
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-400"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
