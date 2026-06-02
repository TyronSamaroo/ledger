import type { Account, Budget, Category, Transaction } from "./types";
import { monthKey } from "./format";

/** Net worth = sum of all account balances (credit cards are already negative). */
export function netWorth(accounts: Account[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

/** Total income (positive amounts) over a transaction set. */
export function totalIncome(txns: Transaction[]): number {
  return txns.reduce((sum, t) => (t.amount > 0 ? sum + t.amount : sum), 0);
}

/** Total spend (absolute value of negative amounts) over a transaction set. */
export function totalSpend(txns: Transaction[]): number {
  return txns.reduce((sum, t) => (t.amount < 0 ? sum - t.amount : sum), 0);
}

export interface CashFlowSummary {
  income: number;
  spend: number;
  net: number;
  savingsRate: number;
  transactionCount: number;
}

/** Income, spend, net, and savings rate over a transaction set. */
export function cashFlowSummary(txns: Transaction[]): CashFlowSummary {
  const income = totalIncome(txns);
  const spend = totalSpend(txns);
  const net = income - spend;
  return {
    income,
    spend,
    net,
    savingsRate: income === 0 ? 0 : net / income,
    transactionCount: txns.length,
  };
}

/** Group transactions by YYYY-MM and return monthly income/spend/net. */
export function monthlyTotals(txns: Transaction[]): Array<{
  month: string;
  income: number;
  spend: number;
  net: number;
}> {
  const buckets = new Map<string, { income: number; spend: number }>();
  for (const t of txns) {
    const key = monthKey(t.date);
    const cur = buckets.get(key) ?? { income: 0, spend: 0 };
    if (t.amount > 0) cur.income += t.amount;
    else cur.spend += -t.amount;
    buckets.set(key, cur);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, spend }]) => ({ month, income, spend, net: income - spend }));
}

/** Spend per expense category over a transaction set. */
export function spendByCategory(
  txns: Transaction[],
  categories: Category[]
): Array<{ category: Category; amount: number }> {
  const byId = new Map<string, number>();
  for (const t of txns) {
    if (t.amount >= 0) continue;
    byId.set(t.categoryId, (byId.get(t.categoryId) ?? 0) + -t.amount);
  }
  return categories
    .filter((c) => c.kind === "expense")
    .map((c) => ({ category: c, amount: byId.get(c.id) ?? 0 }))
    .sort((a, b) => b.amount - a.amount);
}

/** Filter to a specific YYYY-MM. */
export function inMonth(txns: Transaction[], key: string): Transaction[] {
  return txns.filter((t) => monthKey(t.date) === key);
}

/** YYYY-MM for the most recent transaction. */
export function latestMonth(txns: Transaction[]): string {
  if (txns.length === 0) return monthKey(new Date().toISOString().slice(0, 10));
  // Transactions are sorted newest-first by the seed.
  return monthKey(txns[0].date);
}

export interface BudgetProgress {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  /** 0..1+ — values >1 mean over budget. */
  ratio: number;
}

export function budgetProgress(
  budgets: Budget[],
  categories: Category[],
  txns: Transaction[]
): BudgetProgress[] {
  const catById = new Map(categories.map((c) => [c.id, c]));
  return budgets
    .map((b) => {
      const category = catById.get(b.categoryId);
      if (!category) return null;
      const spent = txns
        .filter((t) => t.categoryId === b.categoryId && t.amount < 0)
        .reduce((sum, t) => sum - t.amount, 0);
      return {
        budget: b,
        category,
        spent,
        remaining: Math.max(0, b.monthly - spent),
        ratio: b.monthly === 0 ? 0 : spent / b.monthly,
      } satisfies BudgetProgress;
    })
    .filter((b): b is BudgetProgress => b !== null);
}
