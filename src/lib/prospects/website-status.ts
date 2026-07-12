import type { WebsiteStatus } from "@/lib/types";

export interface WebsiteProbeResult {
  status: WebsiteStatus;
  reachable: boolean;
  finalUrl?: string;
  title?: string;
  evidence: string[];
}

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const weakHostPatterns = [
  "business.site",
  "sites.google.com",
  "facebook.com",
  "instagram.com",
  "linktr.ee",
  "wa.me",
];

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim();
}

export function classifyWebsiteHtml(url: string, html: string): WebsiteProbeResult {
  const lowerHtml = html.toLowerCase();
  const host = new URL(url).hostname.replace(/^www\./, "");
  const title = extractTitle(html);
  const evidence: string[] = [];
  let weakSignals = 0;

  if (weakHostPatterns.some((pattern) => host.includes(pattern))) {
    weakSignals += 2;
    evidence.push("Website is hosted on a social/link/profile platform rather than a dedicated owned site.");
  }

  if (!title || title.length < 6) {
    weakSignals += 1;
    evidence.push("Homepage title is missing or very short.");
  } else {
    evidence.push(`Homepage title detected: "${title}".`);
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
    weakSignals += 1;
    evidence.push("No mobile viewport meta tag detected.");
  }

  if (html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length < 700) {
    weakSignals += 1;
    evidence.push("Homepage has very little readable content.");
  }

  if (/coming soon|under construction|domain for sale|parked domain/i.test(html)) {
    weakSignals += 2;
    evidence.push("Homepage contains placeholder or parked-domain language.");
  }

  if (!/contact|book|appointment|hours|location|whatsapp|call/i.test(lowerHtml)) {
    weakSignals += 1;
    evidence.push("No obvious contact, booking, hours or location language detected.");
  }

  return {
    status: weakSignals >= 2 ? "weak_website" : "healthy_website",
    reachable: true,
    finalUrl: url,
    title,
    evidence:
      evidence.length > 0
        ? evidence
        : ["Homepage is reachable and has enough basic structure."],
  };
}

export async function probeWebsiteStatus(
  websiteUrl?: string,
  fetchImpl: FetchLike = fetch,
  timeoutMs = 5000,
): Promise<WebsiteProbeResult> {
  if (!websiteUrl) {
    return {
      status: "no_website",
      reachable: false,
      evidence: ["Google Places did not return an official website URL."],
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(websiteUrl);
  } catch {
    return {
      status: "weak_website",
      reachable: false,
      finalUrl: websiteUrl,
      evidence: ["Website URL is malformed."],
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      status: "weak_website",
      reachable: false,
      finalUrl: websiteUrl,
      evidence: ["Website URL is not HTTP or HTTPS."],
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(parsedUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "RevenueLoop/0.1 website-status-checker (+https://localhost)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const finalUrl = response.url || parsedUrl.toString();

    if (!response.ok) {
      return {
        status: "weak_website",
        reachable: false,
        finalUrl,
        evidence: [`Homepage returned HTTP ${response.status}.`],
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("text/html")) {
      return {
        status: "weak_website",
        reachable: true,
        finalUrl,
        evidence: [`Homepage content type is ${contentType}, not HTML.`],
      };
    }

    const html = await response.text();
    return classifyWebsiteHtml(finalUrl, html);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Homepage request timed out."
        : "Homepage could not be reached.";
    return {
      status: "weak_website",
      reachable: false,
      finalUrl: parsedUrl.toString(),
      evidence: [message],
    };
  } finally {
    clearTimeout(timeout);
  }
}
