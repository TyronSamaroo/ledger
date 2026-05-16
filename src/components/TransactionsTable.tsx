import type { Account, Category, Transaction } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/format";

export function TransactionsTable({
  transactions,
  categories,
  accounts,
  limit,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  limit?: number;
}) {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const accById = new Map(accounts.map((a) => [a.id, a]));
  const rows = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted border-b border-border">
            <th className="font-medium py-2 pr-4">Date</th>
            <th className="font-medium py-2 pr-4">Merchant</th>
            <th className="font-medium py-2 pr-4">Category</th>
            <th className="font-medium py-2 pr-4 hidden md:table-cell">Account</th>
            <th className="font-medium py-2 pl-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const cat = catById.get(t.categoryId);
            const acc = accById.get(t.accountId);
            const positive = t.amount > 0;
            return (
              <tr
                key={t.id}
                className="border-b border-border/60 last:border-0 hover:bg-elevated/40 transition-colors"
              >
                <td className="py-3 pr-4 text-muted whitespace-nowrap">
                  {formatDateShort(t.date)}
                </td>
                <td className="py-3 pr-4 text-text">{t.merchant}</td>
                <td className="py-3 pr-4">
                  {cat && (
                    <span className="inline-flex items-center gap-2 text-xs text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: cat.color }}
                      />
                      {cat.name}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-muted hidden md:table-cell text-xs">
                  {acc?.name} ··{acc?.last4}
                </td>
                <td
                  className={`py-3 pl-4 text-right font-medium tabular-nums ${
                    positive ? "text-positive" : "text-text"
                  }`}
                >
                  {formatCurrency(t.amount, true)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
