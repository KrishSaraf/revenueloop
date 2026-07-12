"use client";

import {
  CalendarCheck,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import type { GeneratedWebsite, Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";

const styleMap = {
  emerald: {
    bg: "bg-emerald-50",
    soft: "bg-emerald-100/60",
    accent: "text-emerald-700",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
    ring: "border-emerald-200",
  },
  indigo: {
    bg: "bg-indigo-50",
    soft: "bg-indigo-100/60",
    accent: "text-indigo-700",
    button: "bg-indigo-600 text-white hover:bg-indigo-700",
    ring: "border-indigo-200",
  },
  amber: {
    bg: "bg-amber-50",
    soft: "bg-amber-100/60",
    accent: "text-amber-700",
    button: "bg-amber-600 text-white hover:bg-amber-700",
    ring: "border-amber-200",
  },
};

type CategoryKind =
  | "salon"
  | "food"
  | "education"
  | "fitness"
  | "health"
  | "service"
  | "generic";

function categoryKind(category: string): CategoryKind {
  const c = category.toLowerCase();
  if (/salon|nail|beauty|hair|spa|wellness/.test(c)) return "salon";
  if (/cafe|restaurant|bakery|kopi|food|kitchen/.test(c)) return "food";
  if (/tuition|school|education|tutor/.test(c)) return "education";
  if (/fitness|gym|yoga|studio/.test(c)) return "fitness";
  if (/dental|clinic|physio|medical/.test(c)) return "health";
  if (/cleaning|repair|workshop|motor|service/.test(c)) return "service";
  return "generic";
}

const categoryContent: Record<
  CategoryKind,
  {
    cta: string;
    navItems: string[];
    services: { name: string; note: string }[];
    servicesTitle: string;
  }
> = {
  salon: {
    cta: "Book appointment",
    navItems: ["Services", "Stylists", "Reviews", "Location"],
    servicesTitle: "Services & pricing",
    services: [
      { name: "[Signature cut & style]", note: "from S$[68]" },
      { name: "[Colour & treatment]", note: "from S$[128]" },
      { name: "[Bridal & event styling]", note: "by consultation" },
    ],
  },
  food: {
    cta: "View menu",
    navItems: ["Menu", "Reservations", "Hours", "Location"],
    servicesTitle: "Menu highlights",
    services: [
      { name: "[House specialty]", note: "S$[12]" },
      { name: "[Chef's set for two]", note: "S$[48]" },
      { name: "[Seasonal special]", note: "ask in store" },
    ],
  },
  education: {
    cta: "Book trial lesson",
    navItems: ["Programmes", "Schedule", "Teachers", "Contact"],
    servicesTitle: "Programmes",
    services: [
      { name: "[Primary programme]", note: "P1–P6" },
      { name: "[Secondary programme]", note: "S1–S4" },
      { name: "[Exam intensive]", note: "holiday terms" },
    ],
  },
  fitness: {
    cta: "Book a trial class",
    navItems: ["Classes", "Schedule", "Coaches", "Pricing"],
    servicesTitle: "Classes",
    services: [
      { name: "[Small-group strength]", note: "60 min" },
      { name: "[Personal coaching]", note: "by appointment" },
      { name: "[Beginner foundations]", note: "weekly intake" },
    ],
  },
  health: {
    cta: "Request appointment",
    navItems: ["Services", "Practitioners", "Insurance", "Location"],
    servicesTitle: "Services",
    services: [
      { name: "[General consultation]", note: "30 min" },
      { name: "[Specialist treatment]", note: "by referral" },
      { name: "[New patient screening]", note: "first visit" },
    ],
  },
  service: {
    cta: "Get instant quote",
    navItems: ["Services", "Pricing", "Coverage", "Contact"],
    servicesTitle: "Services",
    services: [
      { name: "[Standard service]", note: "from S$[80]" },
      { name: "[Deep / major service]", note: "quoted" },
      { name: "[Recurring plan]", note: "save [15]%" },
    ],
  },
  generic: {
    cta: "Enquire now",
    navItems: ["Services", "Reviews", "Location"],
    servicesTitle: "Services",
    services: [
      { name: "[Service 1]", note: "to confirm" },
      { name: "[Service 2]", note: "to confirm" },
      { name: "[Service 3]", note: "to confirm" },
    ],
  },
};

export function GeneratedSitePreview({
  website,
  prospect,
  compact = false,
}: {
  website: GeneratedWebsite;
  prospect: Prospect;
  compact?: boolean;
}) {
  const styles = styleMap[website.theme.style];
  const kind = categoryKind(prospect.category);
  const content = categoryContent[kind];
  const hero = website.sections.find((section) => section.kind === "hero");
  const overview = website.sections.find((section) => section.kind === "overview");
  const reasons = website.sections.find((section) => section.kind === "reasons");
  const location = website.sections.find((section) => section.kind === "location");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200 bg-white font-sans text-zinc-900 shadow-2xl shadow-black/30",
        compact ? "text-[11px]" : "text-sm",
      )}
    >
      {/* Preview banner */}
      <div className="bg-zinc-900 px-5 py-1.5 text-center font-mono text-[10px] tracking-wide text-zinc-400">
        SITE PREVIEW — generated by VentureMint from public data · [bracketed] items
        await owner confirmation
      </div>

      {/* Nav */}
      <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
        <div className="font-bold tracking-tight">{prospect.name}</div>
        <nav className="hidden items-center gap-4 text-xs text-zinc-500 sm:flex">
          {content.navItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              styles.button,
            )}
          >
            {content.cta}
          </span>
        </nav>
      </header>

      {/* Hero */}
      <section className={cn("px-5 py-10 sm:px-8", styles.bg)}>
        <p className={cn("text-xs font-semibold uppercase tracking-wide", styles.accent)}>
          {prospect.category} · {prospect.location}, Singapore
        </p>
        <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          {hero?.title ?? prospect.name}
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-zinc-600">
          {overview?.body ?? hero?.body}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
              styles.button,
            )}
          >
            <CalendarCheck size={15} aria-hidden />
            {content.cta}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700">
            <MessageCircle size={15} aria-hidden />
            WhatsApp us
          </span>
        </div>
        <div className="mt-5 flex items-center gap-1.5 text-xs text-zinc-600">
          <span className="flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={13}
                className={
                  index < Math.round(prospect.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-300"
                }
              />
            ))}
          </span>
          <span className="font-semibold">{prospect.rating.toFixed(1)}</span>
          <span>· {prospect.reviewCount} public reviews</span>
        </div>
      </section>

      {/* Services */}
      <section className="px-5 py-8 sm:px-8">
        <h2 className="text-lg font-bold tracking-tight">{content.servicesTitle}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {content.services.map((service) => (
            <div
              key={service.name}
              className={cn("rounded-xl border p-4", styles.ring)}
            >
              <p className="font-semibold">{service.name}</p>
              <p className={cn("mt-1 text-xs font-medium", styles.accent)}>
                {service.note}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-zinc-400">
          Placeholder items — final services and prices confirmed with the owner before
          publication.
        </p>
      </section>

      {/* Why choose */}
      <section className={cn("px-5 py-8 sm:px-8", styles.soft)}>
        <h2 className="text-lg font-bold tracking-tight">Why customers choose us</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-zinc-600">
          {reasons?.body}
        </p>
      </section>

      {/* Location + CTA */}
      <section className="grid gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Visit us</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-600">
            <p className="flex items-start gap-2">
              <MapPin size={15} className={cn("mt-0.5 shrink-0", styles.accent)} aria-hidden />
              {prospect.address}
            </p>
            <p className="flex items-start gap-2">
              <Clock size={15} className={cn("mt-0.5 shrink-0", styles.accent)} aria-hidden />
              {location?.body.includes("[confirm hours]")
                ? "Opening hours: [confirm hours]"
                : location?.body}
            </p>
            <p className="flex items-start gap-2">
              <Phone size={15} className={cn("mt-0.5 shrink-0", styles.accent)} aria-hidden />
              {prospect.phone}
            </p>
          </div>
        </div>
        <div className={cn("flex flex-col justify-center rounded-xl border p-5", styles.ring)}>
          <h3 className="font-bold">Ready to {content.cta.toLowerCase()}?</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Send an enquiry and we will reply within [1 business day].
          </p>
          <span
            className={cn(
              "mt-3 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
              styles.button,
            )}
          >
            <MessageCircle size={13} aria-hidden />
            {content.cta}
          </span>
        </div>
      </section>

      <footer className="border-t border-zinc-100 px-5 py-4 text-center text-[11px] text-zinc-400">
        Preview generated by VentureMint from public information. Owner approval
        required before publication.
      </footer>
    </div>
  );
}
