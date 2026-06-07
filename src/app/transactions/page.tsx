import { Card, CardHeader } from "@/components/Card";
import { TransactionsTable } from "@/components/TransactionsTable";
import { accounts, categories, transactions } from "@/lib/data";
import { inMonth, latestMonth, merchantTotals } from "@/lib/aggregate";
import { formatCurrency, formatMonth } from "@/lib/format";

export default function TransactionsPage() {
  const month = latestMonth(transactions);
  const monthTxns = inMonth(transactions, month);
  const merchants = merchantTotals(monthTxns).slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">{transactions.length} entries</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Transactions</h1>
      </header>

      <Card>
        <CardHeader title="Top merchants" subtitle={formatMonth(month)} />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {merchants.map((merchant) => (
            <div key={merchant.merchant} className="rounded-lg bg-elevated p-3">
              <p className="truncate text-xs text-muted">{merchant.merchant}</p>
              <p className="mt-1 text-sm font-medium text-text">
                {formatCurrency(merchant.amount)}
              </p>
              <p className="mt-1 text-[11px] text-muted">{merchant.count} txns</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="All transactions"
          subtitle="Sorted newest first. Filtering and pagination are intentionally left to whoever forks this."
        />
        <TransactionsTable
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          limit={75}
        />
      </Card>
    </div>
  );
}
