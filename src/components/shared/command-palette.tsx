"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  DollarSign,
  LayoutDashboard,
  ListChecks,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { state, runDemo, pauseAgent, resumeAgent, resetDemo } = useRevenueLoop();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const navigate = (path: string) => () => {
      router.push(path);
      setOpen(false);
    };
    const items: Command[] = [
      { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, run: navigate("/dashboard") },
      { id: "prospects", label: "Search prospects", icon: Search, run: navigate("/prospects") },
      { id: "approvals", label: "Open approval queue", icon: ListChecks, run: navigate("/sales-agent") },
      { id: "run-pipeline", label: "Run agent pipeline", icon: Bot, run: navigate("/dashboard?run=1") },
      { id: "sales", label: "Open sales agent", icon: Phone, run: navigate("/sales-agent") },
      { id: "financials", label: "Open financials", icon: DollarSign, run: navigate("/financials") },
      { id: "reset", label: "Reset workspace data", icon: RotateCcw, run: () => { resetDemo(); setOpen(false); } },
    ];
    if (state.agentStatus === "Running" || state.runningDemo) {
      items.unshift({
        id: "pause",
        label: "Pause VentureMint",
        icon: Pause,
        run: () => {
          pauseAgent();
          setOpen(false);
        },
      });
    } else {
      items.unshift({
        id: "start",
        label: "Start discovery run",
        hint: "Runs the full cycle on New Nature Spa",
        icon: Play,
        run: () => {
          void runDemo();
          router.push("/dashboard");
          setOpen(false);
        },
      });
      if (state.agentStatus === "Paused") {
        items.unshift({
          id: "resume",
          label: "Resume VentureMint",
          icon: Play,
          run: () => {
            resumeAgent();
            setOpen(false);
          },
        });
      }
    }
    return items;
  }, [router, state.agentStatus, state.runningDemo, runDemo, pauseAgent, resumeAgent, resetDemo]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((command) => command.label.toLowerCase().includes(q));
  }, [commands, query]);

  const toggle = useCallback(() => {
    setOpen((previous) => !previous);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#17171b] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && filtered[activeIndex]) {
              filtered[activeIndex].run();
            }
          }}
          placeholder="Type a command…"
          className="w-full border-b border-white/[0.08] bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          aria-label="Command search"
        />
        <ul className="max-h-72 overflow-y-auto py-1.5" role="listbox">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-zinc-500">
              No matching commands
            </li>
          ) : (
            filtered.map((command, index) => {
              const Icon = command.icon;
              return (
                <li key={command.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-white/[0.07] text-zinc-100"
                        : "text-zinc-400 hover:bg-white/[0.04]"
                    }`}
                    onClick={command.run}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <Icon size={15} className="shrink-0 text-zinc-500" aria-hidden />
                    <span className="flex-1">{command.label}</span>
                    {command.hint ? (
                      <span className="text-[10px] text-zinc-600">{command.hint}</span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="border-t border-white/[0.08] px-4 py-2 font-mono text-[10px] text-zinc-600">
          ↑↓ navigate · ↵ run · esc close
        </div>
      </div>
    </div>
  );
}
