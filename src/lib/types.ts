export type AccountType = "checking" | "savings" | "credit" | "investment";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Current balance in USD. Negative for credit-card debt. */
  balance: number;
  /** Last 4 digits, purely cosmetic. */
  last4: string;
  institution: string;
  /** Optional demo-only credit limit for utilization math. */
  creditLimit?: number;
  /** Optional annual percentage yield for cash accounts. */
  apy?: number;
  /** Monthly automatic contribution or payoff target. */
  monthlyTarget?: number;
  /** Friendly display label for dense account lists. */
  nickname?: string;
  /** ISO date string for demo account age calculations. */
  openedAt?: string;
}

export type CategoryKind = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  /** Tailwind-compatible hex used by charts and badges. */
  color: string;
  icon: string; // lucide icon name
}

export interface Transaction {
  id: string;
  /** ISO date string, YYYY-MM-DD. */
  date: string;
  merchant: string;
  /** Positive for income, negative for spend. */
  amount: number;
  categoryId: string;
  accountId: string;
  note?: string;
  pending?: boolean;
}

export interface Budget {
  categoryId: string;
  /** Monthly limit in USD. */
  monthly: number;
  priority?: "fixed" | "flex" | "watch";
  note?: string;
}
