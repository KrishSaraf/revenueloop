"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  CircleDollarSign,
  FileSearch,
  Hammer,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    key: "find",
    label: "Find",
    message: "Scanning local businesses",
    icon: Search,
  },
  {
    key: "analyse",
    label: "Analyse",
    message: "High-value workflow gap detected",
    icon: FileSearch,
  },
  {
    key: "build",
    label: "Build",
    message: "Creating the tailored solution",
    icon: Hammer,
  },
  {
    key: "pitch",
    label: "Pitch",
    message: "Preparing price and sales pitch",
    icon: BadgeCheck,
  },
  {
    key: "sell",
    label: "Sell",
    message: "Opportunity ready",
    icon: CircleDollarSign,
  },
] as const;

const stageDurations = [1100, 1100, 1100, 1100, 1600];

export type VentureMintWorkflowHandle = {
  restart: () => void;
};

export const VentureMintWorkflow = forwardRef<
  VentureMintWorkflowHandle,
  {
    className?: string;
    id?: string;
    embedded?: boolean;
    variant?: "dark" | "light";
  }
>(function VentureMintWorkflow(
  { className, id, embedded, variant = "dark" },
  ref,
) {
  const light = variant === "light";
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const reducedMotion = useReducedMotion();

  useImperativeHandle(ref, () => ({
    restart: () => {
      setActive(0);
      setCycle((value) => value + 1);
    },
  }));

  useEffect(() => {
    if (reducedMotion) {
      setActive(stages.length - 1);
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const run = (index: number) => {
      if (cancelled) return;
      setActive(index);
      timeout = setTimeout(() => {
        run((index + 1) % stages.length);
      }, stageDurations[index]);
    };

    run(0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [reducedMotion, cycle]);

  const progress =
    reducedMotion ? 100 : ((active + 1) / stages.length) * 100;

  return (
    <section
      id={id}
      className={cn(
        embedded
          ? ""
          : light
            ? "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
            : "rounded-xl border border-white/[0.08] bg-[#111114] p-4 sm:p-5",
        className,
      )}
      aria-label="VentureMint workflow animation"
    >
      {!embedded ? (
        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.16em]",
              light ? "text-zinc-500" : "text-zinc-500",
            )}
          >
            VentureMint workflow
          </p>
          <span
            className={cn(
              "flex items-center gap-1.5 font-mono text-[10px]",
              light ? "text-emerald-700" : "text-emerald-300",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full pulse-dot",
                light ? "bg-emerald-600" : "bg-emerald-400",
              )}
              aria-hidden
            />
            {reducedMotion ? "READY" : "RUNNING"}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          embedded ? "" : "mt-4",
          "h-1 overflow-hidden rounded-full",
          light ? "bg-zinc-200" : "bg-white/[0.06]",
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Workflow progress"
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            light
              ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
              : "bg-gradient-to-r from-emerald-500 to-emerald-300",
          )}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <ol className="mt-4 grid grid-cols-5 gap-1 sm:gap-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === active;
          const isPast = index < active;

          return (
            <li key={stage.key} className="min-w-0 text-center">
              <motion.div
                className={cn(
                  "relative mx-auto grid place-items-center rounded-md border transition-colors duration-300",
                  embedded ? "h-9 w-9 sm:h-10 sm:w-10" : "h-8 w-8 sm:h-9 sm:w-9",
                  isActive
                    ? light
                      ? "border-emerald-600/40 bg-emerald-50 text-emerald-700 shadow-[0_0_16px_rgba(5,150,105,0.15)]"
                      : "border-emerald-400/50 bg-emerald-400/[0.15] text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : isPast
                      ? light
                        ? "border-transparent bg-emerald-50/80 text-emerald-600"
                        : "border-transparent bg-white/[0.04] text-emerald-400/70"
                      : light
                        ? "border-transparent bg-zinc-100 text-zinc-400"
                        : "border-transparent bg-white/[0.03] text-zinc-600",
                )}
                animate={{
                  scale: isActive && !reducedMotion ? [1, 1.08, 1] : 1,
                }}
                transition={
                  isActive && !reducedMotion
                    ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.25 }
                }
              >
                {isActive && !reducedMotion ? (
                  <motion.span
                    className={cn(
                      "absolute inset-0 rounded-md border",
                      light ? "border-emerald-600/30" : "border-emerald-400/40",
                    )}
                    animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    aria-hidden
                  />
                ) : null}
                <Icon size={14} className="relative z-10" aria-hidden />
              </motion.div>
              <p
                className={cn(
                  "mt-1.5 truncate text-[10px] font-medium sm:text-[11px]",
                  isActive
                    ? light
                      ? "text-emerald-800"
                      : "text-emerald-200"
                    : isPast
                      ? light
                        ? "text-zinc-600"
                        : "text-zinc-400"
                      : light
                        ? "text-zinc-400"
                        : "text-zinc-600",
                )}
              >
                {stage.label}
              </p>
            </li>
          );
        })}
      </ol>

      <motion.p
        key={`${cycle}-${active}`}
        className={cn(
          "mt-3 min-h-[1.25rem] font-mono text-xs",
          light ? "text-zinc-500" : "text-zinc-400",
        )}
        initial={reducedMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        aria-live="polite"
      >
        <span className={light ? "text-emerald-700" : "text-emerald-300/80"}>
          {stages[active].label}:
        </span>{" "}
        {stages[active].message}
      </motion.p>
    </section>
  );
});
