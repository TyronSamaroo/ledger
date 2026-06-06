import { Card, CardHeader, Badge, MetricTile } from "@/components/Card";
import { accounts } from "@/lib/data";
import { accountSummary, accountTypeTotals } from "@/lib/aggregate";
import { formatCurrency, formatCurrencyCompact, formatPercent } from "@/lib/format";
import {
  Wallet,
  PiggyBank,
  CreditCard,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/lib/types";

const ICONS: Record<AccountType, LucideIcon> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: LineChart,
};

const TYPE_LABEL: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit card",
  investment: "Investment",
};

export default function AccountsPage() {
  const summary = accountSummary(accounts);
  const typeTotals = accountTypeTotals(accounts);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">{accounts.length} linked</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Accounts</h1>
      </header>

      <Card>
        <CardHeader title="Net worth" subtitle="Assets minus debts" />
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tabular-nums">
            {formatCurrencyCompact(summary.netWorth)}
          </span>
          <span className="text-xs text-muted">
            {formatCurrency(summary.assets)} assets · {formatCurrency(summary.debts)} debt
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <MetricTile
            label="Credit utilization"
            value={formatPercent(summary.creditUtilization)}
            tone={summary.creditUtilization > 0.3 ? "negative" : "neutral"}
          />
          <MetricTile label="Monthly targets" value={formatCurrency(summary.monthlyTargets)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="By account type" subtitle="Balance grouped by account role" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {typeTotals.map((total) => (
            <MetricTile
              key={total.type}
              label={TYPE_LABEL[total.type]}
              value={formatCurrency(total.balance)}
              hint={`${total.count} account${total.count === 1 ? "" : "s"}`}
              tone={total.balance < 0 ? "negative" : "neutral"}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((a) => {
          const Icon = ICONS[a.type];
          const isDebt = a.balance < 0;
          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-elevated flex items-center justify-center text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted">
                      {a.institution} ··{a.last4}
                    </p>
                  </div>
                </div>
                <Badge tone={isDebt ? "negative" : "neutral"}>{TYPE_LABEL[a.type]}</Badge>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-semibold tabular-nums ${
                    isDebt ? "text-negative" : "text-text"
                  }`}
                >
                  {formatCurrency(a.balance)}
                </span>
                <span className="text-xs text-muted">Available</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted">
                {a.creditLimit && (
                  <div className="rounded-md bg-elevated px-2 py-1.5">
                    <span>Limit </span>
                    <span className="text-text">{formatCurrency(a.creditLimit)}</span>
                  </div>
                )}
                {a.apy && (
                  <div className="rounded-md bg-elevated px-2 py-1.5">
                    <span>APY </span>
                    <span className="text-text">{formatPercent(a.apy, 1)}</span>
                  </div>
                )}
                {a.monthlyTarget && (
                  <div className="rounded-md bg-elevated px-2 py-1.5">
                    <span>Target </span>
                    <span className="text-text">{formatCurrency(a.monthlyTarget)}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
