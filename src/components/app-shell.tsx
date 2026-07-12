"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bot, Globe2, LayoutDashboard, Phone, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Command", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: Search },
  { href: "/sales-agent", label: "Sales Agent", icon: Phone },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useRevenueLoop();

  if (pathname.startsWith("/sites/")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#080a0b] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(57,255,136,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(96,165,250,0.13),transparent_24%)]" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/40 px-4 py-5 backdrop-blur md:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-300/40 bg-emerald-300/10 text-emerald-200">
              <Bot size={20} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-white">
                RevenueLoop
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Autonomous agency
              </span>
            </span>
          </Link>

          <nav className="mt-9 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-emerald-300/12 text-emerald-100"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Activity size={16} className="text-emerald-300" />
              Agent status
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={state.agentStatus === "Running" ? "green" : "amber"}>
                {state.agentStatus}
              </Badge>
              <Badge tone={state.settings.mode === "mock" ? "purple" : "blue"}>
                {state.settings.mode === "mock" ? "Mock mode" : "Live mode"}
              </Badge>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080a0b]/86 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                <Globe2 size={18} className="text-emerald-300" />
                RevenueLoop
              </Link>
              <Badge tone={state.settings.mode === "mock" ? "purple" : "blue"}>
                {state.settings.mode}
              </Badge>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
