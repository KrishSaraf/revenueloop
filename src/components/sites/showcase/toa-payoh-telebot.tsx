"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Check, MessageCircle, Phone } from "lucide-react";
import { ShowcaseChat } from "@/components/sites/showcase/showcase-chat";

export function ToaPayohTelebotShowcase() {
  return (
    <main className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          href="/sites"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          Back to generated sites
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_24px_80px_rgba(14,116,144,0.08)]">
            <div className="border-b border-sky-50 bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-lg font-semibold">Toa Payoh Family Dental</p>
                  <p className="text-sm text-sky-100">Live telebot · try booking below</p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
              <ShowcaseChat
                persona="telebot"
                theme="light-blue"
                assistantLabel="Dental assistant"
                userLabel="Patient"
                placeholder="Ask about check-ups, scaling, or emergency slots…"
                greeting="Hi — I'm the Toa Payoh Family Dental assistant. I can help with check-ups, scaling, and emergency slots. What do you need?"
              />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                What it does
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Triage, book, and hand off — without holding the line.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                VentureMint built this telebot for a neighbourhood dental clinic with no
                online booking. Type on the left — replies are powered by a free AI API
                (Gemini or Groq).
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { icon: Calendar, label: "Slot matching", value: "Clinic hours synced" },
                { icon: Check, label: "Verified claims", value: "No invented pricing" },
                { icon: Phone, label: "Human handoff", value: "NRIC check on arrival" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                >
                  <Icon size={16} className="text-sky-500" />
                  <p className="mt-2 text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
