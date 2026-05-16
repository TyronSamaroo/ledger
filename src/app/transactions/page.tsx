import { Card, CardHeader } from "@/components/Card";
import { TransactionsTable } from "@/components/TransactionsTable";
import { accounts, categories, transactions } from "@/lib/data";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-muted">{transactions.length} entries</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Transactions</h1>
      </header>

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
