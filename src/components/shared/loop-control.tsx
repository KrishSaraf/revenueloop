"use client";

import { useState } from "react";
import { OctagonX, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

export function LoopControl({ compact = false }: { compact?: boolean }) {
  const {
    state,
    runDemo,
    pauseAgent,
    resumeAgent,
    emergencyStop,
    releaseSafetyLock,
    resetDemo,
  } = useRevenueLoop();
  const [stopOpen, setStopOpen] = useState(false);
  const [stopText, setStopText] = useState("");

  const running = state.agentStatus === "Running" || state.runningDemo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state.safetyLock ? (
        <Button
          size="sm"
          variant="danger"
          onClick={releaseSafetyLock}
          icon={<OctagonX size={14} />}
        >
          Release lock
        </Button>
      ) : running ? (
        <Button size="sm" variant="secondary" onClick={pauseAgent} icon={<Pause size={14} />}>
          {compact ? "Pause" : "Pause engine"}
        </Button>
      ) : (
        <>
          <Button
            size="sm"
            variant="primary"
            onClick={() => void runDemo()}
            icon={<Play size={14} />}
          >
            {compact ? "Start" : "Start engine"}
          </Button>
          {state.agentStatus === "Paused" ? (
            <Button size="sm" variant="ghost" onClick={resumeAgent}>
              Resume
            </Button>
          ) : null}
        </>
      )}
      {!compact ? (
        <>
          <Button size="sm" variant="ghost" onClick={resetDemo} icon={<RotateCcw size={14} />}>
            Reset workspace
          </Button>
          {!state.safetyLock ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-400/70 hover:text-rose-300"
              onClick={() => setStopOpen(true)}
              icon={<OctagonX size={14} />}
            >
              Emergency stop
            </Button>
          ) : null}
        </>
      ) : null}

      <Dialog open={stopOpen} onClose={() => setStopOpen(false)} title="Emergency stop">
        <p className="text-sm leading-relaxed text-zinc-400">
          This immediately blocks calls, messages, payment requests, publishing and
          all further agent execution. Type <strong className="font-mono text-rose-300">STOP</strong>{" "}
          to confirm.
        </p>
        <input
          value={stopText}
          onChange={(event) => setStopText(event.target.value)}
          placeholder="STOP"
          aria-label="Type STOP to confirm emergency stop"
          className="mt-3 w-full rounded-md border border-rose-500/30 bg-white/[0.04] px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStopOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={stopText !== "STOP"}
            onClick={() => {
              emergencyStop();
              setStopOpen(false);
              setStopText("");
            }}
          >
            Engage emergency stop
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
