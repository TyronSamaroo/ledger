import type { Account, Budget, Category, Transaction } from "./types";
import { monthKey } from "./format";

/** Net worth = sum of all account balances (credit cards are already negative). */
export function netWorth(accounts: Account[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export interface AccountSummary {
  assets: number;
  debts: number;
  netWorth: number;
  creditLimit: number;
  creditUsed: number;
  creditUtilization: number;
  availableCredit: number;
  monthlyTargets: number;
}

/** Roll up account balances and optional planning metadata. */
export function accountSummary(accounts: Account[]): AccountSummary {
  const assets = accounts.filter((a) => a.balance >= 0).reduce((sum, a) => sum + a.balance, 0);
  const debts = accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum - a.balance, 0);
  const creditLimit = accounts.reduce((sum, a) => sum + (a.creditLimit ?? 0), 0);
  const monthlyTargets = accounts.reduce((sum, a) => sum + (a.monthlyTarget ?? 0), 0);

  return {
    assets,
    debts,
    netWorth: assets - debts,
    creditLimit,
    creditUsed: debts,
    creditUtilization: creditLimit === 0 ? 0 : debts / creditLimit,
    availableCredit: Math.max(0, creditLimit - debts),
    monthlyTargets,
  };
}

export function accountTypeTotals(accounts: Account[]): Array<{
  type: Account["type"];
  balance: number;
  count: number;
}> {
  const buckets = new Map<Account["type"], { balance: number; count: number }>();
  for (const account of accounts) {
    const current = buckets.get(account.type) ?? { balance: 0, count: 0 };
    current.balance += account.balance;
    current.count += 1;
    buckets.set(account.type, current);
  }

  return [...buckets.entries()].map(([type, values]) => ({ type, ...values }));
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

export interface MonthlyAverages {
  income: number;
  spend: number;
  net: number;
  savingsRate: number;
  months: number;
}

export function monthlyAverages(txns: Transaction[]): MonthlyAverages {
  const totals = monthlyTotals(txns);
  const months = totals.length || 1;
  const income = totals.reduce((sum, month) => sum + month.income, 0) / months;
  const spend = totals.reduce((sum, month) => sum + month.spend, 0) / months;
  const net = income - spend;

  return {
    income,
    spend,
    net,
    savingsRate: income === 0 ? 0 : net / income,
    months: totals.length,
  };
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

/** Spend grouped by merchant, highest absolute spend first. */
export function merchantTotals(txns: Transaction[]): Array<{
  merchant: string;
  amount: number;
  count: number;
}> {
  const buckets = new Map<string, { amount: number; count: number }>();
  for (const t of txns) {
    if (t.amount >= 0) continue;
    const cur = buckets.get(t.merchant) ?? { amount: 0, count: 0 };
    cur.amount += -t.amount;
    cur.count += 1;
    buckets.set(t.merchant, cur);
  }
  return [...buckets.entries()]
    .map(([merchant, values]) => ({ merchant, ...values }))
    .sort((a, b) => b.amount - a.amount);
}

export interface TransactionStats {
  incomeCount: number;
  spendCount: number;
  pendingCount: number;
  largestSpend: number;
}

export function transactionStats(txns: Transaction[]): TransactionStats {
  const spend = txns.filter((t) => t.amount < 0);
  return {
    incomeCount: txns.filter((t) => t.amount > 0).length,
    spendCount: spend.length,
    pendingCount: txns.filter((t) => t.pending).length,
    largestSpend: spend.reduce((max, t) => Math.max(max, -t.amount), 0),
  };
}

export function accountActivity(txns: Transaction[]): Array<{
  accountId: string;
  count: number;
  net: number;
}> {
  const buckets = new Map<string, { count: number; net: number }>();
  for (const txn of txns) {
    const current = buckets.get(txn.accountId) ?? { count: 0, net: 0 };
    current.count += 1;
    current.net += txn.amount;
    buckets.set(txn.accountId, current);
  }

  return [...buckets.entries()].map(([accountId, values]) => ({ accountId, ...values }));
}

export interface SpendForecast {
  elapsedDays: number;
  daysInMonth: number;
  actualSpend: number;
  dailyAverage: number;
  projectedSpend: number;
}

export function spendForecast(txns: Transaction[], key: string): SpendForecast {
  const actualSpend = totalSpend(txns);
  const [year, month] = key.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const elapsedDays = Math.max(
    1,
    ...txns.map((t) => Number(t.date.slice(8, 10))).filter((day) => Number.isFinite(day))
  );
  const dailyAverage = actualSpend / elapsedDays;

  return {
    elapsedDays,
    daysInMonth,
    actualSpend,
    dailyAverage,
    projectedSpend: dailyAverage * daysInMonth,
  };
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
  status: BudgetStatus;
}

export type BudgetStatus = "on-track" | "tight" | "over";

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) return "over";
  if (ratio > 0.85) return "tight";
  return "on-track";
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
        status: budgetStatus(b.monthly === 0 ? 0 : spent / b.monthly),
      } satisfies BudgetProgress;
    })
    .filter((b): b is BudgetProgress => b !== null);
}

export interface BudgetSummary {
  totalCap: number;
  totalSpent: number;
  totalRemaining: number;
  utilization: number;
  overCount: number;
  tightCount: number;
}

export function budgetSummary(progress: BudgetProgress[]): BudgetSummary {
  const totalCap = progress.reduce((sum, p) => sum + p.budget.monthly, 0);
  const totalSpent = progress.reduce((sum, p) => sum + p.spent, 0);
  return {
    totalCap,
    totalSpent,
    totalRemaining: Math.max(0, totalCap - totalSpent),
    utilization: totalCap === 0 ? 0 : totalSpent / totalCap,
    overCount: progress.filter((p) => budgetStatus(p.ratio) === "over").length,
    tightCount: progress.filter((p) => budgetStatus(p.ratio) === "tight").length,
  };
}
