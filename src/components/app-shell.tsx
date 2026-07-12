"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DollarSign,
  Globe2,
  LayoutDashboard,
  Menu,
  OctagonX,
  Phone,
  Search,
  X,
} from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { CommandPalette } from "@/components/shared/command-palette";
import { VentureMintLogo } from "@/components/landing/venturemint-logo";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Search },
  { href: "/sales-agent", label: "Sales Agent", icon: Phone },
  { href: "/sites", label: "Generated Sites", icon: Globe2 },
  { href: "/financials", label: "Financials", icon: DollarSign },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { metrics } = useRevenueLoop();

  return (
    <nav className="space-y-0.5" aria-label="Main navigation">
      {nav.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const showApprovalCount =
          item.href === "/sales-agent" && metrics.awaitingApproval > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
              active
                ? "bg-emerald-400/10 text-emerald-300"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100",
            )}
          >
            <Icon size={15} aria-hidden />
            <span className="flex-1">{item.label}</span>
            {showApprovalCount ? (
              <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                {metrics.awaitingApproval}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { state } = useRevenueLoop();
  return (
    <div className="mt-auto space-y-3 pt-6">
      <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Loop status</span>
          <StatusDot
            tone={
              state.safetyLock
                ? "red"
                : state.agentStatus === "Running"
                  ? "green"
                  : state.agentStatus === "Awaiting Approval"
                    ? "amber"
                    : "muted"
            }
            pulse={state.agentStatus === "Running"}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge
            tone={
              state.safetyLock
                ? "red"
                : state.agentStatus === "Running"
                  ? "green"
                  : state.agentStatus === "Awaiting Approval"
                    ? "amber"
                    : "muted"
            }
          >
            {state.safetyLock ? "Emergency stop" : state.agentStatus}
          </Badge>
          <Badge tone={state.settings.mode === "mock" ? "purple" : "blue"}>
            {state.settings.mode === "mock" ? "Sandbox" : "Live"}
          </Badge>
        </div>
      </div>
      <p className="px-1 font-mono text-[10px] text-zinc-600">
        ⌘K command palette
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useRevenueLoop();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Full-bleed routes: generated site previews and the marketing landing page.
  if (pathname.startsWith("/sites/") || pathname === "/") {
    return (
      <>
        {children}
        <CommandPalette />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-white/[0.07] bg-[#0d0d10] px-3 py-4 lg:flex">
          <Link href="/dashboard" className="px-1.5" aria-label="VentureMint home">
            <VentureMintLogo showTagline />
          </Link>
          <div className="mt-6 flex-1 overflow-y-auto">
            <NavLinks />
          </div>
          <SidebarFooter />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="flex h-full w-64 flex-col border-r border-white/[0.07] bg-[#0d0d10] px-3 py-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-1.5">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  aria-label="VentureMint home"
                >
                  <VentureMintLogo />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-6 flex-1 overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
              <SidebarFooter />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col lg:pl-56">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0a0a0c]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu size={17} />
                </button>
                <div className="hidden items-center gap-2 sm:flex">
                  <StatusDot
                    tone={
                      state.safetyLock
                        ? "red"
                        : state.agentStatus === "Running"
                          ? "green"
                          : state.agentStatus === "Awaiting Approval"
                            ? "amber"
                            : "muted"
                    }
                    pulse={state.agentStatus === "Running"}
                  />
                  <span className="text-xs text-zinc-400">
                    {state.safetyLock
                      ? "Emergency stop engaged"
                      : state.agentStatus === "Running"
                        ? "Loop running"
                        : state.agentStatus === "Awaiting Approval"
                          ? "Awaiting your approval"
                          : state.agentStatus === "Paused"
                            ? "Loop paused"
                            : "Loop idle"}
                  </span>
                </div>
              </div>
              <Badge tone={state.settings.mode === "mock" ? "purple" : "blue"}>
                {state.settings.mode === "mock" ? "Sandbox" : "Live"}
              </Badge>
            </div>
            {state.safetyLock ? (
              <div className="border-t border-rose-500/20 bg-rose-500/10 px-4 py-1.5 sm:px-6">
                <p className="flex items-center gap-2 text-[11px] font-medium text-rose-300">
                  <OctagonX size={12} aria-hidden />
                  Emergency stop engaged — all outbound actions and agent execution are
                  blocked. Release the lock from the loop controls.
                </p>
              </div>
            ) : null}
          </header>

          <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-5 sm:px-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
