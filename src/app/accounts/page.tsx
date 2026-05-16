import { Card, CardHeader, Badge } from "@/components/Card";
import { accounts } from "@/lib/data";
import { netWorth } from "@/lib/aggregate";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
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
  const nw = netWorth(accounts);
  const assets = accounts.filter((a) => a.balance >= 0).reduce((s, a) => s + a.balance, 0);
  const debts = accounts.filter((a) => a.balance < 0).reduce((s, a) => s - a.balance, 0);

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
            {formatCurrencyCompact(nw)}
          </span>
          <span className="text-xs text-muted">
            {formatCurrency(assets)} assets · {formatCurrency(debts)} debt
          </span>
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
