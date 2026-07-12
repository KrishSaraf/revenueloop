"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const logLines = [
  {
    stage: "discover",
    text: "Scanned local businesses in Pandan Gardens",
  },
  {
    stage: "analyse",
    text: "New Nature Spa — Google listing has no website, phone-only enquiries",
  },
  {
    stage: "build",
    text: "Built newnaturespa.sg — massage services, location, call-to-book",
  },
  {
    stage: "pitch",
    text: "Proposal prepared — S$1,800 build · S$120/mo care plan",
  },
  {
    stage: "ready",
    text: "Opportunity ready for your approval",
  },
] as const;

const stageColor: Record<(typeof logLines)[number]["stage"], string> = {
  discover: "text-zinc-500",
  analyse: "text-amber-400/80",
  build: "text-sky-400/80",
  pitch: "text-violet-400/70",
  ready: "text-emerald-400",
};

const LINE_INTERVAL = 1400;
const HOLD_AFTER_COMPLETE = 4200;

export function SplashEngineConsole({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(reduced ? logLines.length : 1);

  useEffect(() => {
    if (reduced) return;

    let timeout: ReturnType<typeof setTimeout>;

    const advance = (count: number) => {
      if (count < logLines.length) {
        timeout = setTimeout(() => {
          setVisibleCount(count + 1);
          advance(count + 1);
        }, LINE_INTERVAL);
      } else {
        timeout = setTimeout(() => {
          setVisibleCount(1);
          advance(1);
        }, HOLD_AFTER_COMPLETE);
      }
    };

    advance(visibleCount);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const done = visibleCount === logLines.length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111114] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]",
        className,
      )}
      role="figure"
      aria-label="VentureMint engine run: discovering a gap at New Nature Spa, building the solution, and preparing the pitch"
    >
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <p className="font-mono text-[10px] tracking-wide text-zinc-500">
          venturemint · engine
        </p>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-[10px]",
            done ? "text-emerald-400" : "text-zinc-500",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              done ? "bg-emerald-400" : "bg-zinc-500",
              reduced ? "" : "pulse-dot",
            )}
            aria-hidden
          />
          {done ? "READY" : "RUNNING"}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <ol className="min-h-[10.5rem] space-y-2.5 sm:min-h-[9rem]" aria-live="polite">
          {logLines.slice(0, visibleCount).map((line) => (
            <motion.li
              key={`${line.stage}-${visibleCount >= logLines.length}`}
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 font-mono text-[11px] leading-relaxed sm:text-xs"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className={cn("w-16 uppercase tracking-wider", stageColor[line.stage])}>
                {line.stage}
              </span>
              <span className="text-zinc-300">{line.text}</span>
            </motion.li>
          ))}
        </ol>

        <div className="mt-5 border-t border-dashed border-white/10 pt-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">New Nature Spa</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Pandan Gardens, Singapore · Massage spa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
