import { Card, CardHeader, Badge, MetricTile } from "@/components/Card";
import { budgets, categories, transactions } from "@/lib/data";
import {
  budgetProgress,
  budgetPriorityTotals,
  budgetSummary,
  inMonth,
  latestMonth,
} from "@/lib/aggregate";
import { formatCurrency, formatMonth } from "@/lib/format";

export default function BudgetsPage() {
  const month = latestMonth(transactions);
  const monthTxns = inMonth(transactions, month);
  const progress = budgetProgress(budgets, categories, monthTxns);
  const summary = budgetSummary(progress);
  const prioritized = [...progress].sort((a, b) => b.ratio - a.ratio);
  const priorityTotals = budgetPriorityTotals(progress);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">{formatMonth(month)}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Budgets</h1>
      </header>

      <Card>
        <CardHeader
          title="Overall"
          subtitle={`${formatCurrency(summary.totalSpent)} of ${formatCurrency(summary.totalCap)} spent`}
        />
        <div className="h-2 rounded-full bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, summary.utilization * 100)}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <MetricTile label="Remaining" value={formatCurrency(summary.totalRemaining)} />
          <MetricTile label="Tight categories" value={summary.tightCount} />
          <MetricTile
            label="Over budget"
            value={summary.overCount}
            tone={summary.overCount > 0 ? "negative" : "neutral"}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Priority mix" subtitle="Monthly caps grouped by budget role" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {priorityTotals.map((item) => (
            <MetricTile
              key={item.priority}
              label={item.priority}
              value={formatCurrency(item.monthly)}
              hint={`${formatCurrency(item.spent)} spent · ${item.count} categories`}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prioritized.map(({ category, budget, spent, ratio, status }) => {
          const pct = Math.round(ratio * 100);
          const over = status === "over";
          const tone = over ? "negative" : status === "tight" ? "warning" : "positive";
          const label = over ? "Over" : status === "tight" ? "Tight" : "On track";
          return (
            <Card key={budget.categoryId}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatCurrency(spent)} of {formatCurrency(budget.monthly)}
                  </p>
                  {budget.note && <p className="text-[11px] text-muted mt-1">{budget.note}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={tone}>{label}</Badge>
                  {budget.priority && <Badge>{budget.priority}</Badge>}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: over ? "#fb7185" : category.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
                <span>{pct}% used</span>
                <span>
                  {over
                    ? `${formatCurrency(spent - budget.monthly)} over`
                    : `${formatCurrency(budget.monthly - spent)} left`}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
