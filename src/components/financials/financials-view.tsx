"use client";

import Link from "next/link";
import { DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency, percent } from "@/lib/utils";

export function FinancialsView() {
  const { state, metrics, hydrated } = useRevenueLoop();

  if (!hydrated) {
    return <div className="skeleton h-64 rounded-xl" aria-hidden />;
  }

  const costByProvider = state.costs.reduce<Record<string, number>>((acc, cost) => {
    acc[cost.provider] = (acc[cost.provider] ?? 0) + cost.amount;
    return acc;
  }, {});
  const maxCost = Math.max(...Object.values(costByProvider), 1);

  const deals = state.prospects
    .filter((p) =>
      ["WON", "PAYMENT_PENDING", "REJECTED"].includes(p.agentState),
    )
    .map((prospect) => {
      const payment = state.payments.find((p) => p.prospectId === prospect.id);
      const offer = state.offers.find((o) => o.prospectId === prospect.id);
      const cost = Math.max(
        state.costs
          .filter((c) => c.prospectId === prospect.id)
          .reduce((sum, c) => sum + c.amount, 0),
        prospect.estimatedDeliveryCost ?? 0,
      );
      const revenue = payment?.status === "Paid" ? payment.amount : 0;
      return { prospect, payment, offer, cost, revenue, profit: revenue - cost };
    });

  const hasHistory = metrics.revenue > 0 || metrics.operatingCost > 0;

  const avgMargin =
    metrics.revenue > 0
      ? ((metrics.revenue - metrics.operatingCost) / metrics.revenue) * 100
      : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Financials</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Unit economics for the loop — what it earns, what it costs, and whether each
          opportunity pays for itself.
        </p>
      </div>

      {!hasHistory ? (
        <EmptyState
          icon={DollarSign}
          title="No financial history yet"
          description="Revenue and cost data will appear after the first opportunity enters the sales process. Start the loop to generate the flagship deal."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Total revenue"
              tone="positive"
              value={currency(metrics.revenue)}
              hint={`${metrics.dealsClosed} deal${metrics.dealsClosed === 1 ? "" : "s"} won`}
            />
            <MetricCard
              label="Recurring / month"
              value={currency(metrics.recurringRevenue)}
              hint="From accepted offers"
            />
            <MetricCard
              label="Total cost"
              value={currency(metrics.operatingCost)}
              hint="Model, voice, delivery"
            />
            <MetricCard
              label="Net profit"
              tone={metrics.netProfit >= 0 ? "positive" : "negative"}
              value={currency(metrics.netProfit)}
              hint={`${percent(avgMargin)} margin`}
            />
            <MetricCard
              label="Avg selling price"
              value={
                metrics.averageSellingPrice > 0
                  ? currency(metrics.averageSellingPrice)
                  : "—"
              }
              hint="Per closed deal"
            />
            <MetricCard
              label="Cost / opportunity"
              value={
                metrics.averageCostPerOpportunity > 0
                  ? currency(metrics.averageCostPerOpportunity)
                  : "—"
              }
              hint={`${metrics.verifiedOpportunities} verified`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
              <PanelHeader eyebrow="Deals" title="Deal-level financials" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      {["Business", "Status", "Revenue", "Cost", "Profit"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {deals.map(({ prospect, payment, cost, revenue, profit }) => (
                      <tr key={prospect.id}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/prospects/${prospect.id}`}
                            className="text-zinc-200 underline-offset-2 hover:underline"
                          >
                            {prospect.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={
                              prospect.agentState === "WON"
                                ? "green"
                                : prospect.agentState === "PAYMENT_PENDING"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {prospect.agentState === "WON"
                              ? "Won"
                              : prospect.agentState === "PAYMENT_PENDING"
                                ? payment?.status === "Pending"
                                  ? "Payment pending"
                                  : "Negotiating"
                                : "Lost"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                          {currency(revenue)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                          {currency(cost)}
                        </td>
                        <td
                          className={`px-4 py-3 font-mono text-xs font-medium ${
                            profit >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {currency(profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-white/[0.06] px-4 py-3 font-mono text-[11px] text-zinc-500">
                <span>Deals won: {metrics.dealsClosed}</span>
                <span>Deals lost: {metrics.dealsLost}</span>
                <span>Conversion: {percent(metrics.conversionRate)}</span>
                <span>Next cycle budget: {currency(metrics.nextCycleBudget)}</span>
              </div>
            </Panel>

            <Panel>
              <PanelHeader eyebrow="Costs" title="Cost breakdown" />
              <div className="space-y-3 p-4 sm:p-5">
                {Object.entries(costByProvider)
                  .sort(([, a], [, b]) => b - a)
                  .map(([provider, amount]) => (
                    <div key={provider}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">{provider}</span>
                        <span className="font-mono text-xs text-zinc-300">
                          {currency(amount)}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-zinc-500"
                          style={{ width: `${(amount / maxCost) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                <p className="pt-1 text-[11px] leading-relaxed text-zinc-600">
                  Costs include model calls, voice minutes and delivery overhead tracked
                  per prospect in the ledger below.
                </p>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
