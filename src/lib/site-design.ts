import type { GeneratedWebsite, Prospect, WebsiteSection } from "@/lib/types";

export type PreviewLayoutId =
  | "spa-serene"
  | "cafe-noir"
  | "academic"
  | "fitness-bold"
  | "salon-editorial"
  | "clinical"
  | "bakery-warm"
  | "florist"
  | "default-modern";

const layoutByProspectId: Record<string, PreviewLayoutId> = {
  "prospect-new-nature-spa": "spa-serene",
  "prospect-bugis-brew": "cafe-noir",
  "prospect-tampines-tutors": "academic",
  "prospect-jurong-fit": "fitness-bold",
  "prospect-orchard-nails": "salon-editorial",
  "prospect-toa-payoh-dental": "clinical",
  "prospect-bedok-bakes": "bakery-warm",
  "prospect-bugis-blooms": "florist",
};

export function getPreviewLayoutId(prospect: Prospect): PreviewLayoutId {
  if (layoutByProspectId[prospect.id]) {
    return layoutByProspectId[prospect.id];
  }

  const c = prospect.category.toLowerCase();
  if (/spa|massage|wellness/.test(c)) return "spa-serene";
  if (/cafe|restaurant|kitchen/.test(c)) return "cafe-noir";
  if (/bakery|bakes/.test(c)) return "bakery-warm";
  if (/tuition|education|tutor/.test(c)) return "academic";
  if (/fitness|gym|yoga/.test(c)) return "fitness-bold";
  if (/nail|salon|beauty/.test(c)) return "salon-editorial";
  if (/dental|clinic|physio|medical/.test(c)) return "clinical";
  if (/florist|flower/.test(c)) return "florist";
  return "default-modern";
}

export interface PreviewSections {
  hero?: WebsiteSection;
  overview?: WebsiteSection;
  services?: WebsiteSection;
  reasons?: WebsiteSection;
  reviews?: WebsiteSection;
  location?: WebsiteSection;
  cta?: WebsiteSection;
}

export function extractPreviewSections(website: GeneratedWebsite): PreviewSections {
  const find = (kind: WebsiteSection["kind"]) =>
    website.sections.find((s) => s.kind === kind);

  return {
    hero: find("hero"),
    overview: find("overview"),
    services: find("services"),
    reasons: find("reasons"),
    reviews: find("reviews"),
    location: find("location"),
    cta: find("cta"),
  };
}

export const prospectThemeById: Record<
  string,
  { accent: string; style: "emerald" | "indigo" | "amber" }
> = {
  "prospect-new-nature-spa": { accent: "#5c8f72", style: "emerald" },
  "prospect-bugis-brew": { accent: "#c97b3a", style: "amber" },
  "prospect-tampines-tutors": { accent: "#1e4d8c", style: "indigo" },
  "prospect-jurong-fit": { accent: "#ea580c", style: "amber" },
  "prospect-orchard-nails": { accent: "#db7093", style: "emerald" },
  "prospect-toa-payoh-dental": { accent: "#0ea5e9", style: "indigo" },
  "prospect-bedok-bakes": { accent: "#d97706", style: "amber" },
  "prospect-bugis-blooms": { accent: "#16a34a", style: "emerald" },
};
