# Ledger

A clone-and-run personal finance dashboard demo. No DB, no auth, no env vars — `npm install && npm run dev` and the dashboard renders with ~6 months and ~370 deterministic seed transactions.

Intended as a scaffolding template: opinionated tech, clean architecture, just enough product polish that you can fork it and start replacing seed data with real sources.

## Stack

- **Next.js 16** (App Router, server components by default)
- **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first config in `globals.css`)
- **Recharts** for the income/spend chart
- **Lucide** for icons

No state management library, no UI kit, no ORM. Easy to swap in any of the above.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's in the demo

| Page | What it shows |
|---|---|
| `/` Dashboard | Net worth, MTD income/spend/net, 6-month area chart, top categories, recent activity |
| `/transactions` | All ~370 seed transactions in a sortable-friendly table |
| `/budgets` | Per-category monthly progress with on-track / tight / over states |
| `/accounts` | Checking, savings, credit, brokerage with balances and net worth |

## Project layout

```
src/
├── app/                  # Next.js routes (one folder per page)
│   ├── layout.tsx        # Root layout + sidebar shell
│   ├── page.tsx          # Dashboard
│   ├── transactions/
│   ├── budgets/
│   └── accounts/
├── components/           # Reusable UI
│   ├── Card.tsx          # Card, CardHeader, StatCard, Badge
│   ├── Sidebar.tsx
│   ├── SpendingChart.tsx
│   └── TransactionsTable.tsx
└── lib/
    ├── types.ts          # Account, Category, Transaction, Budget
    ├── data.ts           # Seed data + deterministic transaction generator
    ├── aggregate.ts      # netWorth, monthlyTotals, budgetProgress, etc.
    └── format.ts         # formatCurrency, formatDateShort, monthKey, ...
```

## The seed data

`src/lib/data.ts` generates ~370 transactions across 6 months using a Mulberry32 PRNG seeded with a fixed value (`0xc0ffee`). That means:

- The demo always renders the same numbers — screenshots stay stable.
- Bumping `SEED` reshuffles everything without changing the schema.
- The "today" anchor is hard-coded so the demo doesn't roll forward unexpectedly. Change `today` in `generateTransactions()` if you want it to follow the real calendar.

No real merchant names, no real account numbers, no PII. All institutions and merchants are invented.

## Derived metrics

The dashboard deliberately keeps finance math in `src/lib/aggregate.ts` instead of embedding it in page components. Current helpers cover:

- Account health: assets, debts, net worth, credit utilization, and monthly targets
- Cash flow: income, spend, net, savings rate, monthly averages, and projected month-end spend
- Budgets: category progress, overall utilization, remaining budget, and attention counts
- Transactions: top merchants, pending counts, and largest monthly spend

That split keeps the UI easy to replace while preserving a tested, portable data layer.

## Replacing the data layer

The seed is just a TypeScript module exporting four arrays. To wire in a real backend:

1. Pick a database (SQLite, Postgres, Turso, Supabase, your call).
2. Replace `src/lib/data.ts` with async fetchers returning the same shapes.
3. Mark the pages that consume them as server components reading from your DB (they already are).
4. Add auth in `src/app/layout.tsx` once you have multiple users.

The aggregate functions in `src/lib/aggregate.ts` are pure and DB-agnostic, so they don't need to change.

## License

MIT — fork freely.
