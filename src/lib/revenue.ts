import type { Metrics, RevenueLoopState } from "@/lib/types";

export interface ExtendedMetrics extends Metrics {
  verifiedOpportunities: number;
  pipelineValue: number;
  awaitingApproval: number;
  averageCostPerOpportunity: number;
  averageSellingPrice: number;
  recurringRevenue: number;
  dealsLost: number;
}

export function calculateMetrics(state: RevenueLoopState): ExtendedMetrics {
  const prospectsDiscovered = state.prospects.length;
  const websitesGenerated = state.websites.length;
  const callsCompleted = state.calls.filter(
    (call) => call.status === "Completed",
  ).length;
  const paidPayments = state.payments.filter(
    (payment) => payment.status === "Paid",
  );
  const dealsClosed = paidPayments.length;
  const revenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const operatingCost = state.costs.reduce((sum, cost) => sum + cost.amount, 0);
  const netProfit = revenue - operatingCost;
  const conversionRate =
    callsCompleted === 0 ? 0 : (dealsClosed / callsCompleted) * 100;

  // A verified opportunity: a generated + verified solution exists for the prospect
  // and the prospect is not blocked or lost.
  const verifiedOpportunities = state.websites.filter((website) => {
    const prospect = state.prospects.find((p) => p.id === website.prospectId);
    return (
      website.verified &&
      prospect &&
      !prospect.doNotContact &&
      prospect.agentState !== "REJECTED"
    );
  }).length;

  const activeStates = new Set([
    "RESEARCHING",
    "SCORING",
    "GENERATING_SITE",
    "PREPARING_PITCH",
    "AWAITING_APPROVAL",
    "CALLING",
    "FOLLOWING_UP",
    "PAYMENT_PENDING",
  ]);
  const pipelineValue = state.prospects
    .filter((p) => activeStates.has(p.agentState) && !p.doNotContact)
    .reduce((sum, p) => sum + p.estimatedDealValue, 0);

  const awaitingApproval = state.prospects.filter(
    (p) => p.agentState === "AWAITING_APPROVAL" && !p.doNotContact,
  ).length;

  const averageCostPerOpportunity =
    verifiedOpportunities === 0
      ? 0
      : Math.round((operatingCost / verifiedOpportunities) * 100) / 100;

  const averageSellingPrice =
    dealsClosed === 0 ? 0 : Math.round(revenue / dealsClosed);

  const recurringRevenue = state.offers
    .filter((offer) => offer.status === "Accepted")
    .reduce((sum, offer) => sum + offer.monthlyAmount, 0);

  const dealsLost = state.prospects.filter(
    (p) => p.agentState === "REJECTED",
  ).length;

  return {
    prospectsDiscovered,
    websitesGenerated,
    callsCompleted,
    dealsClosed,
    revenue,
    operatingCost,
    netProfit,
    conversionRate,
    nextCycleBudget: Math.max(0, Math.round(netProfit * 0.35)),
    verifiedOpportunities,
    pipelineValue,
    awaitingApproval,
    averageCostPerOpportunity,
    averageSellingPrice,
    recurringRevenue,
    dealsLost,
  };
}
