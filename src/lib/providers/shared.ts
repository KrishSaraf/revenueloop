import type { BusinessSearchInput } from "@/lib/providers/types";
import type { WebsiteStatus } from "@/lib/types";

export function estimateDealValue(category: string) {
  if (/tuition|clinic|dental|medical|education/i.test(category)) return 499;
  if (/salon|wellness|spa|studio|fitness/i.test(category)) return 399;
  if (/repair|bicycle|bike/i.test(category)) return 349;
  if (/cafe|coffee|restaurant|bakery/i.test(category)) return 299;
  return 349;
}

export function bookingValueFor(category: string) {
  if (/tuition|education/i.test(category)) {
    return "Trial-class booking and level-based enquiry forms could improve parent conversion.";
  }
  if (/salon|wellness|spa|studio|clinic|dental|fitness/i.test(category)) {
    return "Appointment requests and package enquiries can be captured through a booking CTA.";
  }
  if (/repair|bicycle|bike/i.test(category)) {
    return "Repair quotes and service-slot enquiries can be routed through a quick contact form.";
  }
  if (/cafe|coffee|restaurant|bakery/i.test(category)) {
    return "Menu, hours, maps and group-order enquiries can convert local search traffic.";
  }
  return "A clear contact CTA could turn search traffic into enquiries.";
}

export function websiteStatusMatches(
  requested: BusinessSearchInput["websiteStatus"],
  actual: WebsiteStatus,
) {
  if (requested === "either") {
    return actual === "no_website" || actual === "weak_website";
  }

  return requested === actual;
}
