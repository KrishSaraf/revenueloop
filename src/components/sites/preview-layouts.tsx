"use client";

import type { ComponentType } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Star,
} from "lucide-react";
import type { Prospect } from "@/lib/types";
import type { PreviewLayoutId, PreviewSections } from "@/lib/site-design";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
        />
      ))}
    </span>
  );
}

function PreviewBanner() {
  return (
    <div className="bg-zinc-900 px-4 py-1.5 text-center font-mono text-[9px] tracking-wide text-zinc-500">
      SITE PREVIEW · VentureMint · bracketed items await owner sign-off
    </div>
  );
}

function PreviewFooter() {
  return (
    <footer className="border-t border-zinc-100/80 px-4 py-3 text-center text-[10px] text-zinc-400">
      Generated from public listing data · owner approval before publish
    </footer>
  );
}

interface LayoutProps {
  prospect: Prospect;
  sections: PreviewSections;
  compact?: boolean;
}

export function SpaSereneLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-[#f7f5f0] font-sans text-stone-800", compact && "text-xs")}>
      <PreviewBanner />
      <header className="flex items-center justify-between px-5 py-4">
        <span className="font-serif text-lg tracking-wide text-[#3d5c4a]">{prospect.name}</span>
        <span className="rounded-full bg-[#3d5c4a] px-3 py-1 text-[10px] font-medium text-white">
          Book now
        </span>
      </header>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8efe9] to-[#f7f5f0] px-5 pb-10 pt-8">
        <div className="absolute -right-8 top-4 size-32 rounded-full bg-[#3d5c4a]/10 blur-2xl" aria-hidden />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5c8f72]">
          {prospect.location}
        </p>
        <h1 className="mt-2 max-w-sm font-serif text-3xl leading-tight text-[#2c3e32]">
          {sections.hero?.title ?? prospect.name}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          {sections.overview?.body ?? sections.hero?.body}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Swedish", "Foot reflexology", "Body scrub"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-[#3d5c4a]/20 bg-white/70 px-3 py-1 text-[11px] text-[#3d5c4a]"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
      <section className="grid grid-cols-3 gap-2 px-5 py-6">
        {[
          { label: "From", value: "S$28" },
          { label: "Rating", value: prospect.rating.toFixed(1) },
          { label: "Reviews", value: String(prospect.reviewCount) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-[9px] uppercase tracking-wide text-stone-400">{s.label}</p>
            <p className="mt-1 font-semibold text-[#3d5c4a]">{s.value}</p>
          </div>
        ))}
      </section>
      <LocationStrip prospect={prospect} sections={sections} accent="#3d5c4a" />
      <PreviewFooter />
    </div>
  );
}

export function CafeNoirLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-[#14100e] font-sans text-stone-100", compact && "text-xs")}>
      <PreviewBanner />
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="text-sm font-semibold tracking-tight">{prospect.name}</span>
        <nav className="hidden gap-4 text-[10px] text-stone-400 sm:flex">
          <span>Menu</span>
          <span>Hours</span>
          <span>Visit</span>
        </nav>
      </header>
      <section className="grid gap-0 sm:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-10">
          <p className="text-[10px] font-medium uppercase tracking-widest text-amber-500">
            Specialty coffee · {prospect.location}
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {sections.hero?.title ?? "Craft pours & slow mornings"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">
            {sections.overview?.body}
          </p>
          <button
            type="button"
            className="mt-5 w-fit rounded-none border border-amber-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-500"
          >
            View menu
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1 bg-stone-900 p-1">
          {["Espresso", "Pour-over", "Pastries", "Events"].map((item) => (
            <div
              key={item}
              className="flex aspect-square items-end bg-gradient-to-t from-black/80 to-amber-900/30 p-3"
            >
              <span className="text-[11px] font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-[11px] text-stone-500">
        <span className="flex items-center gap-1">
          <Stars rating={prospect.rating} />
          {prospect.rating} · {prospect.reviewCount} reviews
        </span>
        <span>{prospect.phone}</span>
      </div>
      <PreviewFooter />
    </div>
  );
}

export function AcademicLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-white font-sans text-slate-900", compact && "text-xs")}>
      <PreviewBanner />
      <div className="border-b-4 border-[#1e4d8c] px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1e4d8c]">
          {prospect.category}
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">{prospect.name}</h1>
      </div>
      <section className="bg-slate-50 px-5 py-8">
        <h2 className="text-lg font-bold text-[#1e4d8c]">
          {sections.hero?.title ?? "Results-focused tuition"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {sections.overview?.body}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { k: "Score", v: `${prospect.opportunityScore}/100` },
            { k: "Rating", v: prospect.rating.toFixed(1) },
            { k: "Location", v: prospect.location },
          ].map((item) => (
            <div key={item.k} className="rounded-lg border border-slate-200 bg-white p-2.5">
              <p className="text-[9px] uppercase text-slate-400">{item.k}</p>
              <p className="mt-0.5 text-sm font-semibold text-[#1e4d8c]">{item.v}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-5 py-6">
        <h3 className="text-sm font-bold">Programmes</h3>
        <ul className="mt-3 space-y-2">
          {["Primary · P1–P6", "Secondary · S1–O levels", "Holiday intensive"].map((p) => (
            <li
              key={p}
              className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-xs"
            >
              <span>{p}</span>
              <ArrowRight size={12} className="text-[#1e4d8c]" />
            </li>
          ))}
        </ul>
      </section>
      <LocationStrip prospect={prospect} sections={sections} accent="#1e4d8c" light />
      <PreviewFooter />
    </div>
  );
}

export function FitnessBoldLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-black font-sans text-white", compact && "text-xs")}>
      <PreviewBanner />
      <section className="relative overflow-hidden px-5 pb-8 pt-10">
        <div className="absolute right-0 top-0 h-full w-1/3 skew-x-[-12deg] bg-orange-600/90" aria-hidden />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
          {prospect.location}
        </p>
        <h1 className="relative mt-2 max-w-[14rem] text-3xl font-black uppercase leading-none tracking-tighter">
          {sections.hero?.title ?? prospect.name}
        </h1>
        <p className="relative mt-4 max-w-xs text-sm text-zinc-400">
          {sections.overview?.body}
        </p>
        <button
          type="button"
          className="relative mt-6 bg-orange-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
        >
          Book trial class
        </button>
      </section>
      <section className="border-t border-zinc-800 px-5 py-5">
        <div className="grid grid-cols-2 gap-2">
          {["Strength", "HIIT", "Mobility", "1:1 coaching"].map((c) => (
            <div key={c} className="border border-zinc-800 p-3">
              <p className="text-xs font-bold uppercase text-orange-500">{c}</p>
              <p className="mt-1 text-[10px] text-zinc-500">60 min · [schedule]</p>
            </div>
          ))}
        </div>
      </section>
      <div className="flex items-center gap-4 border-t border-zinc-800 px-5 py-3 text-[10px] text-zinc-500">
        <Phone size={12} /> {prospect.phone}
      </div>
      <PreviewFooter />
    </div>
  );
}

export function SalonEditorialLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-[#fdf8f8] font-sans text-zinc-900", compact && "text-xs")}>
      <PreviewBanner />
      <header className="px-5 py-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#db7093]">Est. Singapore</p>
        <h1 className="mt-2 font-serif text-4xl font-light italic tracking-tight text-zinc-800">
          {prospect.name}
        </h1>
        <p className="mt-2 text-xs text-zinc-500">{prospect.category} · {prospect.location}</p>
      </header>
      <section className="mx-5 border-y border-[#db7093]/30 py-6">
        <p className="text-center text-sm leading-relaxed text-zinc-600">
          {sections.overview?.body}
        </p>
      </section>
      <section className="px-5 py-5">
        {[
          { name: "[Gel manicure]", price: "from S$45" },
          { name: "[Classic pedicure]", price: "from S$55" },
          { name: "[Nail art set]", price: "by design" },
        ].map((row, i) => (
          <div
            key={row.name}
            className={cn(
              "flex items-baseline justify-between py-3",
              i > 0 && "border-t border-dashed border-zinc-200",
            )}
          >
            <span className="text-sm">{row.name}</span>
            <span className="text-xs font-medium text-[#db7093]">{row.price}</span>
          </div>
        ))}
      </section>
      <div className="mx-5 mb-5 rounded-full bg-[#db7093] py-3 text-center text-xs font-semibold text-white">
        Book appointment
      </div>
      <PreviewFooter />
    </div>
  );
}

export function ClinicalLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-white font-sans text-slate-800", compact && "text-xs")}>
      <PreviewBanner />
      <header className="flex items-center gap-3 border-b border-sky-100 bg-sky-50/80 px-5 py-4">
        <div className="grid size-10 place-items-center rounded-lg bg-sky-500 text-white">
          <Shield size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900">{prospect.name}</h1>
          <p className="text-[10px] text-sky-700">{prospect.location} · family dental care</p>
        </div>
      </header>
      <section className="px-5 py-8">
        <h2 className="text-xl font-bold text-slate-900">
          {sections.hero?.title ?? "Gentle care, clear booking"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {sections.overview?.body}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Check-ups", "Scaling", "Emergency slots"].map((s) => (
            <span
              key={s}
              className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-medium text-sky-800"
            >
              {s}
            </span>
          ))}
        </div>
      </section>
      <section className="mx-5 rounded-xl border border-sky-100 bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-900">Request appointment</p>
        <div className="mt-3 grid gap-2">
          <div className="h-8 rounded-md border border-slate-200 bg-white" />
          <div className="h-8 rounded-md border border-slate-200 bg-white" />
          <button type="button" className="rounded-md bg-sky-500 py-2 text-xs font-semibold text-white">
            Submit request
          </button>
        </div>
      </section>
      <div className="mt-4 flex items-center gap-2 px-5 pb-4 text-[10px] text-slate-500">
        <Stars rating={prospect.rating} />
        {prospect.rating} from {prospect.reviewCount} reviews
      </div>
      <PreviewFooter />
    </div>
  );
}

export function BakeryWarmLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-[#fff9f0] font-sans text-amber-950", compact && "text-xs")}>
      <PreviewBanner />
      <section className="px-5 pb-6 pt-8 text-center">
        <p className="font-serif text-5xl leading-none text-amber-800/90">✦</p>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-amber-950">
          {prospect.name}
        </h1>
        <p className="mt-2 text-sm text-amber-800/80">{sections.overview?.body}</p>
      </section>
      <div className="grid grid-cols-2 gap-2 px-5">
        {["Sourdough", "Custom cakes", "Tarts", "Seasonal"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 aspect-[4/3] rounded-xl bg-gradient-to-br from-amber-100 to-orange-100" />
            <p className="text-xs font-semibold">{item}</p>
            <p className="text-[10px] text-amber-700/70">[price TBC]</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mt-5 flex items-center justify-between rounded-full bg-amber-800 px-4 py-2.5 text-xs font-medium text-amber-50">
        <span>Order via WhatsApp</span>
        <MessageCircle size={14} />
      </div>
      <LocationStrip prospect={prospect} sections={sections} accent="#b45309" />
      <PreviewFooter />
    </div>
  );
}

export function FloristLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-[#f4faf5] font-sans text-emerald-950", compact && "text-xs")}>
      <PreviewBanner />
      <section className="grid min-h-[200px] grid-cols-5">
        <div className="col-span-3 flex flex-col justify-end bg-gradient-to-br from-emerald-100 to-emerald-50 p-5">
          <h1 className="font-serif text-2xl leading-tight text-emerald-900">
            {sections.hero?.title ?? prospect.name}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-emerald-800/80">
            {sections.overview?.body}
          </p>
        </div>
        <div className="col-span-2 bg-emerald-700/20" aria-hidden />
      </section>
      <section className="px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
          Arrangements
        </p>
        <div className="mt-3 space-y-2">
          {["Same-day bouquet", "Wedding florals", "Corporate gifting"].map((a) => (
            <div
              key={a}
              className="flex items-center justify-between border-b border-emerald-200/60 py-2 text-xs"
            >
              <span>{a}</span>
              <span className="text-emerald-600">Enquire</span>
            </div>
          ))}
        </div>
      </section>
      <LocationStrip prospect={prospect} sections={sections} accent="#15803d" />
      <PreviewFooter />
    </div>
  );
}

export function DefaultModernLayout({ prospect, sections, compact }: LayoutProps) {
  return (
    <div className={cn("min-w-[300px] bg-zinc-50 font-sans text-zinc-900", compact && "text-xs")}>
      <PreviewBanner />
      <header className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold">{prospect.name}</span>
        <span className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[10px] font-medium text-white">
          Enquire
        </span>
      </header>
      <section className="bg-white px-5 py-10 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {prospect.category} · {prospect.location}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {sections.hero?.title ?? prospect.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          {sections.overview?.body}
        </p>
        <div className="mt-4 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-[11px]">
            <Stars rating={prospect.rating} />
            {prospect.rating}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px]">
            {prospect.reviewCount} reviews
          </span>
        </div>
      </section>
      <section className="px-5 py-6">
        <p className="text-sm text-zinc-600">{sections.reasons?.body}</p>
      </section>
      <LocationStrip prospect={prospect} sections={sections} accent="#18181b" />
      <PreviewFooter />
    </div>
  );
}

function LocationStrip({
  prospect,
  sections,
  accent,
  light,
}: {
  prospect: Prospect;
  sections: PreviewSections;
  accent: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 px-5 py-4 text-[10px]",
        light ? "text-slate-500" : "text-stone-500",
      )}
    >
      <span className="inline-flex items-center gap-1">
        <MapPin size={11} style={{ color: accent }} />
        {prospect.address}
      </span>
      <span className="inline-flex items-center gap-1">
        <Phone size={11} style={{ color: accent }} />
        {prospect.phone}
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock size={11} style={{ color: accent }} />
        {sections.location?.body?.slice(0, 48) ?? "[confirm hours]"}
      </span>
    </div>
  );
}

const layoutComponents: Record<PreviewLayoutId, ComponentType<LayoutProps>> = {
  "spa-serene": SpaSereneLayout,
  "cafe-noir": CafeNoirLayout,
  academic: AcademicLayout,
  "fitness-bold": FitnessBoldLayout,
  "salon-editorial": SalonEditorialLayout,
  clinical: ClinicalLayout,
  "bakery-warm": BakeryWarmLayout,
  florist: FloristLayout,
  "default-modern": DefaultModernLayout,
};

export function PreviewLayoutRouter(props: LayoutProps & { layoutId: PreviewLayoutId }) {
  const { layoutId, ...rest } = props;
  const Component = layoutComponents[layoutId];
  return <Component {...rest} />;
}
