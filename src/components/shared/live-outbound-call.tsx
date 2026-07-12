"use client";

import { Phone, PhoneCall, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const VENTUREMINT_OUTBOUND_LINE = "+65 9811 7311";

export type LiveCallStatus =
  | "idle"
  | "dialling"
  | "ringing"
  | "connected"
  | "ended";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function statusLabel(status: LiveCallStatus) {
  if (status === "dialling") return "Dialling…";
  if (status === "ringing") return "Ringing…";
  if (status === "connected") return "On call";
  if (status === "ended") return "Call ended";
  return "Standby";
}

export function LiveOutboundCall({
  status,
  seconds = 0,
  calleeName,
  calleePhone,
  compact = false,
  outcome,
}: {
  status: LiveCallStatus;
  seconds?: number;
  calleeName?: string;
  calleePhone?: string;
  compact?: boolean;
  outcome?: string;
}) {
  if (status === "idle") return null;

  const live = status === "connected" || status === "ringing" || status === "dialling";

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-b from-orange-400/[0.1] to-black/50",
        live ? "border-orange-400/35" : "border-orange-400/20",
        compact ? "p-3" : "p-4 sm:p-5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-orange-200">
          {status === "ended" ? (
            <PhoneOff size={compact ? 14 : 16} aria-hidden />
          ) : (
            <PhoneCall
              size={compact ? 14 : 16}
              className={live ? "animate-pulse" : undefined}
              aria-hidden
            />
          )}
          <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            Outbound call
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono uppercase tracking-wide",
            compact ? "text-[9px]" : "text-[10px]",
            live
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-white/[0.06] text-zinc-400",
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">From</p>
          <p className="mt-1 font-mono text-sm text-zinc-100">{VENTUREMINT_OUTBOUND_LINE}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500">VentureMint outbound line</p>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">To</p>
          <p className="mt-1 truncate text-sm font-medium text-zinc-100">
            {calleeName ?? "Business owner"}
          </p>
          {calleePhone ? (
            <p className="mt-0.5 font-mono text-[11px] text-zinc-400">{calleePhone}</p>
          ) : null}
        </div>
      </div>

      {live ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-8 flex-1 items-end gap-0.5 px-1" aria-hidden>
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="w-1 rounded-full bg-orange-400/70"
                style={{
                  height: `${20 + ((index * 7 + seconds * 3) % 60)}%`,
                  animation:
                    status === "connected"
                      ? `pulse ${0.8 + (index % 5) * 0.1}s ease-in-out infinite alternate`
                      : undefined,
                }}
              />
            ))}
          </div>
          {status === "connected" ? (
            <p className="font-mono text-lg tabular-nums text-emerald-300">
              {formatDuration(seconds)}
            </p>
          ) : (
            <Phone size={16} className="animate-pulse text-orange-300/80" aria-hidden />
          )}
        </div>
      ) : null}

      {status === "ended" && outcome ? (
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">{outcome}</p>
      ) : null}
    </div>
  );
}
