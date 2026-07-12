import type { Prospect, ScoreFactor, WebsiteStatus } from "@/lib/types";
import { clamp } from "@/lib/utils";

export interface ScoreInput {
  websiteStatus: WebsiteStatus;
  rating: number;
  reviewCount: number;
  hasPhone: boolean;
  hasAddress: boolean;
  socialPresenceCount: number;
  onlineBookingValuable: boolean;
  category: string;
}

export function calculateOpportunityScore(input: ScoreInput) {
  const websiteScore =
    input.websiteStatus === "no_website"
      ? 30
      : input.websiteStatus === "weak_website"
        ? 22
        : 4;
  const reviewScore = clamp(Math.round(input.reviewCount / 4), 0, 18);
  const ratingScore = input.rating >= 4.6 ? 16 : input.rating >= 4.2 ? 12 : 7;
  const infoScore = (input.hasPhone ? 6 : 0) + (input.hasAddress ? 6 : 0);
  const bookingScore = input.onlineBookingValuable ? 14 : 5;
  const socialGapScore = input.socialPresenceCount <= 1 ? 10 : 4;
  const categoryFit = /(salon|tuition|repair|wellness|cafe|clinic|studio)/i.test(
    input.category,
  )
    ? 6
    : 3;

  const score = clamp(
    websiteScore +
      reviewScore +
      ratingScore +
      infoScore +
      bookingScore +
      socialGapScore +
      categoryFit,
    0,
    100,
  );

  const factors: ScoreFactor[] = [
    {
      label: "Website gap",
      score: websiteScore,
      max: 30,
      evidence:
        input.websiteStatus === "no_website"
          ? "No website detected."
          : input.websiteStatus === "weak_website"
            ? "Website exists but appears weak or incomplete."
            : "Website presence already looks healthy.",
    },
    {
      label: "Demand signal",
      score: reviewScore + ratingScore,
      max: 34,
      evidence: `${input.rating.toFixed(1)} rating across ${input.reviewCount} reviews.`,
    },
    {
      label: "Reachability",
      score: infoScore,
      max: 12,
      evidence: "Public contact and address information are available.",
    },
    {
      label: "Booking value",
      score: bookingScore,
      max: 14,
      evidence: input.onlineBookingValuable
        ? "Bookings or enquiries are likely to convert online."
        : "Online booking is useful but not central.",
    },
    {
      label: "Social gap",
      score: socialGapScore,
      max: 10,
      evidence:
        input.socialPresenceCount <= 1
          ? "Limited social presence leaves room for a better web destination."
          : "Social presence already supports some discovery.",
    },
  ];

  return {
    score,
    factors,
    explanation:
      score >= 80
        ? "High-priority prospect: strong business signals with a clear digital gap."
        : score >= 65
          ? "Good prospect: enough demand and reachable public information to justify a preview site."
          : "Moderate prospect: worth nurturing, but the current conversion upside is less obvious.",
  };
}

export function scoreProspect(prospect: Prospect) {
  return calculateOpportunityScore({
    websiteStatus: prospect.websiteStatus,
    rating: prospect.rating,
    reviewCount: prospect.reviewCount,
    hasPhone: Boolean(prospect.phone),
    hasAddress: Boolean(prospect.address),
    socialPresenceCount: prospect.socialPresence.length,
    onlineBookingValuable: /booking|class|appointment|repair|consultation/i.test(
      prospect.onlineBookingValue,
    ),
    category: prospect.category,
  });
}
