export type ShowcaseKind = "client-site" | "telebot" | "sales-agent" | "concierge";

export interface ShowcaseSite {
  id: string;
  slug: string;
  prospectId?: string;
  name: string;
  tagline: string;
  category: string;
  kind: ShowcaseKind;
  agent: string;
  href: string;
  external: boolean;
  verified: boolean;
  published: boolean;
  interactive: boolean;
  accent: string;
  glow: string;
  previewGradient: string;
  highlights: string[];
  buildLabel: string;
}

export const showcaseSites: ShowcaseSite[] = [
  {
    id: "showcase-new-nature-spa",
    slug: "new-nature-spa",
    prospectId: "prospect-new-nature-spa",
    name: "New Nature Spa",
    tagline:
      "Full booking site for a Pandan Gardens massage spa — treatments, hours, and call-to-book.",
    category: "Massage & wellness",
    kind: "client-site",
    agent: "Build Agent",
    href: "https://6a534be9d32eef52379d3734--fabulous-pasca-9502b4.netlify.app/",
    external: true,
    verified: true,
    published: true,
    interactive: false,
    accent: "emerald",
    glow: "hover:shadow-[0_0_48px_rgba(52,211,153,0.18)]",
    previewGradient: "from-[#f5f0e8] via-[#e8f5ef] to-[#dceee6]",
    buildLabel: "Live website",
    highlights: ["6 sections", "Mobile-first", "S$28+ treatments"],
  },
  {
    id: "showcase-toa-payoh-telebot",
    slug: "toa-payoh-telebot",
    prospectId: "prospect-toa-payoh-dental",
    name: "Toa Payoh Family Dental",
    tagline:
      "Healthcare telebot that triages patients, offers slots, and hands off to clinic staff.",
    category: "Healthcare telebot",
    kind: "telebot",
    agent: "Telebot Agent",
    href: "/sites/toa-payoh-telebot",
    external: false,
    verified: true,
    published: true,
    interactive: true,
    accent: "sky",
    glow: "hover:shadow-[0_0_48px_rgba(56,189,248,0.18)]",
    previewGradient: "from-[#e8f4fc] via-[#f0f7ff] to-white",
    buildLabel: "Live telebot",
    highlights: ["Book slots", "NRIC handoff", "Gemini powered"],
  },
  {
    id: "showcase-sales-agent",
    slug: "sales-agent-demo",
    name: "VentureMint Sales Agent",
    tagline:
      "Outbound sales console — pitch, handle objections, and route to checkout.",
    category: "Automated sales",
    kind: "sales-agent",
    agent: "Sales Agent",
    href: "/sites/sales-agent-demo",
    external: false,
    verified: true,
    published: true,
    interactive: true,
    accent: "emerald",
    glow: "hover:shadow-[0_0_48px_rgba(52,211,153,0.22)]",
    previewGradient: "from-[#0f1412] via-[#111916] to-[#0a0a0c]",
    buildLabel: "Sales demo",
    highlights: ["Live transcript", "S$140 closed", "S$20/year"],
  },
  {
    id: "showcase-bugis-concierge",
    slug: "bugis-brew-concierge",
    name: "Bugis Brew Concierge",
    tagline:
      "Hospitality concierge for tables, menu questions, and group orders over chat.",
    category: "Hospitality concierge",
    kind: "concierge",
    agent: "Concierge Agent",
    href: "/sites/bugis-brew-concierge",
    external: false,
    verified: true,
    published: true,
    interactive: true,
    accent: "amber",
    glow: "hover:shadow-[0_0_48px_rgba(251,191,36,0.18)]",
    previewGradient: "from-[#faf3e8] via-[#fff8f0] to-[#f5efe6]",
    buildLabel: "Concierge bot",
    highlights: ["Table booking", "Menu Q&A", "Counter routing"],
  },
];

export const liveSite = showcaseSites.find((s) => s.external)!;
export const demoSites = showcaseSites.filter((s) => !s.external);

export function getShowcaseSite(slug: string) {
  return showcaseSites.find((site) => site.slug === slug);
}

export function getShowcaseSiteForProspect(prospectId: string) {
  return showcaseSites.find((site) => site.prospectId === prospectId);
}
