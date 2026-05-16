import { Card, CardHeader, StatCard } from "@/components/Card";
import { SpendingChart } from "@/components/SpendingChart";
import { TransactionsTable } from "@/components/TransactionsTable";
import { accounts, categories, transactions } from "@/lib/data";
import {
  inMonth,
  latestMonth,
  monthlyTotals,
  netWorth,
  spendByCategory,
  totalIncome,
  totalSpend,
} from "@/lib/aggregate";
import { formatCurrency, formatCurrencyCompact, formatMonth } from "@/lib/format";

export default function DashboardPage() {
  const thisMonth = latestMonth(transactions);
  const monthTxns = inMonth(transactions, thisMonth);
  const monthly = monthlyTotals(transactions);
  const cats = spendByCategory(monthTxns, categories);

  const incomeMTD = totalIncome(monthTxns);
  const spendMTD = totalSpend(monthTxns);
  const netMTD = incomeMTD - spendMTD;
  const nw = netWorth(accounts);

  const prevIdx = monthly.findIndex((m) => m.month === thisMonth) - 1;
  const prev = prevIdx >= 0 ? monthly[prevIdx] : null;
  const spendDelta = prev ? spendMTD - prev.spend : 0;
  const spendTone = spendDelta > 0 ? "negative" : spendDelta < 0 ? "positive" : "neutral";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs text-muted">{formatMonth(thisMonth)}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Dashboard</h1>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net worth"
          value={formatCurrencyCompact(nw)}
          hint="All accounts"
        />
        <StatCard
          label="Income (MTD)"
          value={formatCurrency(incomeMTD)}
          tone="positive"
        />
        <StatCard
          label="Spend (MTD)"
          value={formatCurrency(spendMTD)}
          delta={
            prev
              ? `${spendDelta >= 0 ? "+" : "−"}${formatCurrency(Math.abs(spendDelta))} vs last month`
              : undefined
          }
          tone={spendTone}
        />
        <StatCard
          label="Net (MTD)"
          value={formatCurrency(netMTD, true)}
          tone={netMTD >= 0 ? "positive" : "negative"}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Income vs spend" subtitle="Last 6 months" />
          <SpendingChart data={monthly} />
        </Card>
        <Card>
          <CardHeader title="Top categories" subtitle={formatMonth(thisMonth)} />
          <ul className="space-y-3">
            {cats.slice(0, 6).map(({ category, amount }) => {
              const max = cats[0]?.amount || 1;
              const pct = Math.round((amount / max) * 100);
              return (
                <li key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-text">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: category.color }}
                      />
                      {category.name}
                    </span>
                    <span className="text-muted tabular-nums">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: category.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader title="Recent activity" subtitle="Latest 10 transactions" />
          <TransactionsTable
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            limit={10}
          />
        </Card>
      </section>
    </div>
  );
}
