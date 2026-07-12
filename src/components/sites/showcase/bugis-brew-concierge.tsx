"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Coffee, Croissant, Users } from "lucide-react";
import { ShowcaseChat } from "@/components/sites/showcase/showcase-chat";

const menu = [
  { name: "Seasonal pour-over", price: "S$8", note: "Ethiopia natural · bright" },
  { name: "Flat white", price: "S$5.50", note: "Double ristretto" },
  { name: "Butter croissant", price: "S$4.50", note: "Baked 7 am daily" },
];

export function BugisBrewConciergeShowcase() {
  return (
    <main className="min-h-screen bg-[#faf6f0] text-stone-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          href="/sites"
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft size={14} />
          Back to generated sites
        </Link>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-amber-100 bg-white p-6 shadow-[0_20px_60px_rgba(180,120,40,0.08)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-700 text-white">
                <Coffee size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Bugis Brew Lab
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">Concierge bot</h1>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-600">
              Specialty coffee with foot traffic but no owned menu site. Chat on the right
              to reserve a table, ask about the menu, or place a group order — powered by
              free Gemini or Groq API.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Users, label: "Tables", value: "Walk-in + reserve" },
                { icon: Croissant, label: "Menu", value: "Daily bake list" },
                { icon: Bot, label: "Routing", value: "Counter handoff" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4"
                >
                  <Icon size={16} className="text-amber-700" />
                  <p className="mt-2 text-sm font-medium">{label}</p>
                  <p className="text-xs text-stone-500">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                Menu highlights
              </p>
              <div className="mt-3 space-y-2">
                {menu.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.note}</p>
                    </div>
                    <span className="font-mono text-sm text-amber-800">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(180,120,40,0.08)]">
            <div className="border-b border-amber-50 bg-gradient-to-r from-amber-700 to-orange-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="font-medium">Brew Concierge</p>
                  <p className="text-sm text-amber-100">Live chat · tables & orders</p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
              <ShowcaseChat
                persona="concierge"
                theme="light-amber"
                assistantLabel="Concierge"
                userLabel="Guest"
                placeholder="Ask about tables, beans, or group orders…"
                greeting="Hey — Brew Concierge here. Need a table, menu help, or a group order?"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
