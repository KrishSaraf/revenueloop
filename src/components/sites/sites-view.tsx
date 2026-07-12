"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  ExternalLink,
  Globe2,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuildPreviewCard } from "@/components/sites/build-preview-card";
import { LiveShowcasePreview } from "@/components/sites/live-showcase-preview";
import { builtPreviewSites, demoSites, liveSite, type ShowcaseSite } from "@/lib/showcase-sites";
import { cn } from "@/lib/utils";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function kindIcon(kind: ShowcaseSite["kind"]) {
  if (kind === "client-site") return Globe2;
  if (kind === "telebot") return MessageCircle;
  if (kind === "sales-agent") return Phone;
  return Bot;
}

function PreviewMock({ site, large = false }: { site: ShowcaseSite; large?: boolean }) {
  const text = large ? "text-base" : "text-xs";
  const title = large ? "text-3xl sm:text-4xl" : "text-2xl";

  if (site.kind === "client-site") {
    return (
      <div className="flex h-full flex-col justify-between p-6 text-stone-800 sm:p-8">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500">
          <span>Pandan Gardens · Singapore</span>
          <span className="rounded-full bg-emerald-700/10 px-2.5 py-1 text-emerald-800">
            Open today
          </span>
        </div>
        <div>
          <p className={cn("font-serif font-semibold tracking-tight text-stone-900", title)}>
            NEW NATURE SPA
          </p>
          <p className={cn("mt-3 max-w-sm leading-relaxed text-stone-600", text)}>
            Traditional bodywork, foot massage & wellness. Treatments from S$28.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white">
            Book appointment
          </span>
          <span className="rounded-full border border-stone-300 px-4 py-2 text-xs text-stone-700">
            View treatments
          </span>
        </div>
      </div>
    );
  }

  if (site.kind === "telebot") {
    return (
      <div className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-sky-100 pb-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-white">
            <MessageCircle size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-sky-950">Dental assistant</p>
            <p className="text-[11px] text-sky-600">Online · replies in seconds</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {[
            "Hi — I can help book a check-up. When works for you?",
            "Thursday afternoon please",
            "2:30 pm or 4:00 pm available ✓",
          ].map((line, i) => (
            <div
              key={line}
              className={cn(
                "max-w-[88%] rounded-2xl px-3 py-2.5 text-[11px] leading-relaxed",
                i % 2 === 0
                  ? "ml-auto rounded-tr-sm bg-sky-500 text-white"
                  : "rounded-tl-sm bg-white text-sky-950 shadow-sm",
              )}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (site.kind === "sales-agent") {
    return (
      <div className="flex h-full flex-col justify-between p-5 text-zinc-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-400/15 text-emerald-300">
              <Phone size={14} />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-100">Live outbound</p>
              <p className="font-mono text-[10px] text-emerald-400">CALLING · 00:58</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 font-mono text-[10px] text-emerald-300">
            INTERESTED
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/35 p-4">
          <p className="text-[10px] text-zinc-500">Prospect · New Nature Spa</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">
            “Send me the preview — we only take phone bookings now.”
          </p>
        </div>
        <div className="flex gap-2 font-mono text-[10px]">
          <span className="rounded bg-emerald-400/10 px-2 py-1 text-emerald-300">
            pitch sent
          </span>
          <span className="rounded bg-white/5 px-2 py-1 text-zinc-500">checkout queued</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between p-5 text-stone-800">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-600 text-white">
          <Bot size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold">Brew Concierge</p>
          <p className="text-[11px] text-amber-700">Menu · tables · group orders</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { from: "guest", text: "Table for 4 tonight?" },
          { from: "bot", text: "7:30 pm works. Add the pour-over set?" },
          { from: "guest", text: "Yes — 2 croissants too" },
        ].map((line) => (
          <div
            key={line.text}
            className={cn(
              "max-w-[90%] rounded-xl px-3 py-2.5 text-[11px]",
              line.from === "bot"
                ? "ml-6 bg-amber-600 text-white"
                : "bg-white/85 text-stone-800 shadow-sm",
            )}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserChrome({ children, url }: { children: ReactNode; url: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0d0d10] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[#16161a] px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="min-w-0 flex-1 rounded-md bg-black/40 px-3 py-1 font-mono text-[10px] text-zinc-500 truncate">
          {url}
        </div>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#f5f0e8] to-[#dceee6]">
        {children}
      </div>
    </div>
  );
}

function FeaturedLiveSite() {
  const site = liveSite;
  return (
    <motion.article
      variants={fade}
      className="overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.06] via-[#111114] to-[#0d0d10]"
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">Live</Badge>
            <Badge tone="muted">{site.buildLabel}</Badge>
            <Badge tone="green">Verified</Badge>
          </div>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            {site.name}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">{site.category}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
            {site.tagline}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.highlights.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={site.href} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" icon={<ExternalLink size={14} />}>
                Open live site
              </Button>
            </a>
            <Link href="/prospects/prospect-new-nature-spa">
              <Button variant="secondary">View prospect</Button>
            </Link>
          </div>
        </div>
        <LiveShowcasePreview site={site} showActions={false} />
      </div>
    </motion.article>
  );
}

function DemoCard({ site, index }: { site: ShowcaseSite; index: number }) {
  const Icon = kindIcon(site.kind);

  return (
    <motion.article
      variants={fade}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111114] transition-all duration-300",
        site.glow,
      )}
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden border-b border-white/[0.06] bg-gradient-to-br",
          site.previewGradient,
        )}
      >
        <PreviewMock site={site} />
        {site.interactive ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
            <Sparkles size={10} />
            Live AI chat
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] text-zinc-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-zinc-400">
              <Icon size={15} aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">{site.name}</h3>
              <p className="text-[11px] text-zinc-500">{site.buildLabel}</p>
            </div>
          </div>
          <Badge tone="purple">Interactive</Badge>
        </div>

        <p className="text-xs leading-relaxed text-zinc-400">{site.tagline}</p>

        <div className="flex flex-wrap gap-1.5">
          {site.highlights.map((item) => (
            <span
              key={item}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[10px] text-zinc-600">{site.agent}</span>
          <Link href={site.href}>
            <Button
              size="sm"
              variant="secondary"
              icon={<ArrowUpRight size={13} />}
              className="group-hover:border-emerald-400/30 group-hover:text-emerald-300"
            >
              Open site
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function SitesView() {
  const reduced = useReducedMotion();
  const [aiLive, setAiLive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/showcase/chat")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => setAiLive(Boolean(data.configured)))
      .catch(() => setAiLive(false));
  }, []);

  return (
    <motion.div
      className="space-y-8"
      initial={reduced ? false : "hidden"}
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fade} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Generated sites
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            One live client build, seven Build Agent previews with distinct layouts,
            plus three interactive showcases. Open any site and chat — AI replies in
            real time.
          </p>
        </div>
        {aiLive !== null ? (
          <Badge tone={aiLive ? "green" : "amber"}>
            {aiLive ? "AI online" : "AI key not set"}
          </Badge>
        ) : null}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
        {[
          { label: "Live sites", value: "1" },
          { label: "Build previews", value: String(builtPreviewSites.length) },
          { label: "Interactive", value: "3" },
          { label: "Verified", value: "4" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fade}
            className="rounded-xl border border-white/[0.08] bg-[#111114] px-4 py-3"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-zinc-100">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <FeaturedLiveSite />

      <motion.div variants={fade}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Build Agent portfolio</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Seven distinct layouts — cafe, tuition, fitness, salon, dental, bakery, and florist
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {builtPreviewSites.map((site, index) => (
            <BuildPreviewCard key={site.id} site={site} index={index} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={fade}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Interactive showcases</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Telebot, sales agent, and concierge — type and get real AI replies
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {demoSites.map((site, index) => (
            <DemoCard key={site.id} site={site} index={index} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
