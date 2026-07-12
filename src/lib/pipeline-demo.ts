/** Hardcoded discovery wave for the dashboard Run demo — not New Nature Spa (already closed). */

export interface DiscoveredProspect {
  rank: number;
  id: string;
  name: string;
  category: string;
  location: string;
  score: number;
  gap: string;
  phone: string;
  slug: string;
  /** Pre-built showcase slug judges can open after Build / Verify */
  siteSlug: string;
  siteLabel: string;
}

export const discoveredProspects: DiscoveredProspect[] = [
  {
    rank: 1,
    id: "prospect-toa-payoh-dental",
    name: "Toa Payoh Family Dental",
    category: "Dental clinic",
    location: "Toa Payoh",
    score: 88,
    gap: "No appointment booking — site not mobile-friendly",
    phone: "+65 6000 0600",
    slug: "toa-payoh-family-dental",
    siteSlug: "toa-payoh-telebot",
    siteLabel: "Live telebot + booking site",
  },
  {
    rank: 2,
    id: "prospect-bedok-bakes",
    name: "Morning Bakes",
    category: "Bakery",
    location: "Bedok",
    score: 76,
    gap: "Custom cake orders stuck in Instagram DMs",
    phone: "+65 6000 0700",
    slug: "bedok-morning-bakes",
    siteSlug: "",
    siteLabel: "",
  },
  {
    rank: 3,
    id: "prospect-bugis-blooms",
    name: "Petal Atelier",
    category: "Florist",
    location: "Bugis",
    score: 74,
    gap: "No order form for same-day arrangements",
    phone: "+65 6000 1100",
    slug: "bugis-petal-atelier",
    siteSlug: "",
    siteLabel: "",
  },
];

export const runProspect = discoveredProspects[0];

/** Pitch package shown in the dashboard Run demo approval gate. */
export const runProspectOffer = {
  packageName: "Launch Site Sprint",
  setupAmount: 180,
  anchorAmount: 220,
  annualHosting: 29,
  deliveryCost: 36.4,
} as const;

export const discoveryStats = {
  scanned: 142,
  matched: 3,
  region: "Toa Payoh · Bedok · Bugis",
};
