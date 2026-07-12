import type { Metrics, RevenueLoopState } from "@/lib/types";

export function calculateMetrics(state: RevenueLoopState): Metrics {
  const prospectsDiscovered = state.prospects.length;
  const websitesGenerated = state.websites.length;
  const callsCompleted = state.calls.filter(
    (call) => call.status === "Completed",
  ).length;
  const dealsClosed = state.payments.filter(
    (payment) => payment.status === "Paid",
  ).length;
  const revenue = state.payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const operatingCost = state.costs.reduce((sum, cost) => sum + cost.amount, 0);
  const netProfit = revenue - operatingCost;
  const conversionRate =
    callsCompleted === 0 ? 0 : (dealsClosed / callsCompleted) * 100;

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
  };
}
