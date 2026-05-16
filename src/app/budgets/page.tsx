import { Card, CardHeader, Badge } from "@/components/Card";
import { budgets, categories, transactions } from "@/lib/data";
import {
  budgetProgress,
  inMonth,
  latestMonth,
} from "@/lib/aggregate";
import { formatCurrency, formatMonth } from "@/lib/format";

export default function BudgetsPage() {
  const month = latestMonth(transactions);
  const monthTxns = inMonth(transactions, month);
  const progress = budgetProgress(budgets, categories, monthTxns);

  const totalCap = budgets.reduce((s, b) => s + b.monthly, 0);
  const totalSpent = progress.reduce((s, p) => s + p.spent, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">{formatMonth(month)}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Budgets</h1>
      </header>

      <Card>
        <CardHeader
          title="Overall"
          subtitle={`${formatCurrency(totalSpent)} of ${formatCurrency(totalCap)} spent`}
        />
        <div className="h-2 rounded-full bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.min(100, (totalSpent / totalCap) * 100)}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progress.map(({ category, budget, spent, ratio }) => {
          const pct = Math.round(ratio * 100);
          const over = ratio > 1;
          const near = !over && ratio > 0.85;
          const tone = over ? "negative" : near ? "warning" : "positive";
          const label = over ? "Over" : near ? "Tight" : "On track";
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
                </div>
                <Badge tone={tone}>{label}</Badge>
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
