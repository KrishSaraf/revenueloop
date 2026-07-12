"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseChat } from "@/components/sites/showcase/showcase-chat";

export function SalesAgentShowcase() {
  return (
    <main className="min-h-screen bg-[#08090c] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          href="/sites"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft size={14} />
          Back to generated sites
        </Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
              VentureMint · Sales Agent
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Automated outbound that still sounds human.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Play the business owner on the right — the Sales Agent replies live via
              Gemini or Groq free API.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-emerald-300">LIVE DEMO</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#111114] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">Active prospect</p>
                  <h2 className="mt-1 text-xl font-semibold">New Nature Spa</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Massage spa · Pandan Gardens · no website on Maps
                  </p>
                </div>
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-300">
                  In call
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Score", value: "79" },
                  { label: "Offer", value: "S$140" },
                  { label: "Conv.", value: "62%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 font-mono text-lg text-emerald-300">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#111114] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Objection pack
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  “We get walk-ins” → show competitor comparison traffic
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  “Already on Maps” → owned booking page + call CTA
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  “Too expensive” → S$140 setup vs lost enquiries framing
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" icon={<Sparkles size={14} />}>
                Send checkout link
              </Button>
              <Button size="sm" variant="secondary" icon={<Target size={14} />}>
                View preview
              </Button>
            </div>
          </section>

          <section className="flex min-h-[28rem] flex-col rounded-2xl border border-emerald-400/15 bg-gradient-to-b from-[#101512] to-[#0d0d10] p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-300">
              <Phone size={16} />
              <span className="text-sm font-medium">Live call — you are the owner</span>
            </div>

            <ShowcaseChat
              persona="sales-agent"
              theme="dark-emerald"
              assistantLabel="Sales Agent"
              userLabel="Owner"
              placeholder="Reply as the spa owner…"
              greeting="Hi — this is VentureMint's assistant. I prepared a website preview for New Nature Spa. Do you have 30 seconds?"
            />
          </section>
        </div>
      </div>
    </main>
  );
}
