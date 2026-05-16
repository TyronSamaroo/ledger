import type { Account, Budget, Category, Transaction } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Accounts
// ──────────────────────────────────────────────────────────────────────────────

export const accounts: Account[] = [
  { id: "acc_checking", name: "Everyday Checking", type: "checking", balance: 4_812.46, last4: "4421", institution: "Aspen Bank" },
  { id: "acc_savings", name: "Emergency Savings", type: "savings", balance: 18_204.0, last4: "9876", institution: "Aspen Bank" },
  { id: "acc_credit", name: "Travel Rewards Card", type: "credit", balance: -1_276.18, last4: "0312", institution: "Northpeak" },
  { id: "acc_invest", name: "Brokerage", type: "investment", balance: 42_915.7, last4: "7733", institution: "Tidepool Securities" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Categories
// ──────────────────────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { id: "cat_salary", name: "Salary", kind: "income", color: "#34d399", icon: "Banknote" },
  { id: "cat_freelance", name: "Freelance", kind: "income", color: "#22d3ee", icon: "Briefcase" },
  { id: "cat_groceries", name: "Groceries", kind: "expense", color: "#fbbf24", icon: "ShoppingCart" },
  { id: "cat_dining", name: "Dining", kind: "expense", color: "#f97316", icon: "UtensilsCrossed" },
  { id: "cat_transport", name: "Transport", kind: "expense", color: "#60a5fa", icon: "Car" },
  { id: "cat_rent", name: "Rent", kind: "expense", color: "#a78bfa", icon: "Home" },
  { id: "cat_utilities", name: "Utilities", kind: "expense", color: "#818cf8", icon: "Zap" },
  { id: "cat_entertain", name: "Entertainment", kind: "expense", color: "#f472b6", icon: "Music" },
  { id: "cat_health", name: "Health", kind: "expense", color: "#2dd4bf", icon: "HeartPulse" },
  { id: "cat_shopping", name: "Shopping", kind: "expense", color: "#fb7185", icon: "ShoppingBag" },
  { id: "cat_subs", name: "Subscriptions", kind: "expense", color: "#c084fc", icon: "Repeat" },
];

// ──────────────────────────────────────────────────────────────────────────────
// Budgets (monthly caps for the expense categories above)
// ──────────────────────────────────────────────────────────────────────────────

export const budgets: Budget[] = [
  { categoryId: "cat_groceries", monthly: 600 },
  { categoryId: "cat_dining", monthly: 300 },
  { categoryId: "cat_transport", monthly: 220 },
  { categoryId: "cat_rent", monthly: 1850 },
  { categoryId: "cat_utilities", monthly: 180 },
  { categoryId: "cat_entertain", monthly: 150 },
  { categoryId: "cat_health", monthly: 120 },
  { categoryId: "cat_shopping", monthly: 200 },
  { categoryId: "cat_subs", monthly: 80 },
];

// ──────────────────────────────────────────────────────────────────────────────
// Deterministic transaction generator
//
// We seed a Mulberry32 PRNG with a fixed value so the demo always renders the
// same data without shipping a 2000-line JSON blob. Bump SEED if the catalog
// starts feeling stale.
// ──────────────────────────────────────────────────────────────────────────────

const SEED = 0xc0ffee;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const MERCHANTS: Record<string, string[]> = {
  cat_groceries: ["Greenleaf Market", "Sunrise Foods", "Cornerstone Grocer", "Bay Produce"],
  cat_dining: ["Pico Taqueria", "Hopper Coffee", "Maple Diner", "Noodle Court", "Bramble Wine Bar"],
  cat_transport: ["Metro Transit", "Tidepool Gas", "Vista Rideshare", "ParkSmart"],
  cat_rent: ["Rivermark Apartments"],
  cat_utilities: ["Aspen Electric", "Clearwater Water", "Fiberline Internet"],
  cat_entertain: ["Lumen Cinemas", "Echo Records", "Statepark Pass", "Folio Books"],
  cat_health: ["Ridgeline Pharmacy", "Lakeshore Clinic", "Boulder Yoga"],
  cat_shopping: ["Atelier Goods", "Northpeak Outfitters", "Pixel Electronics", "Linen House"],
  cat_subs: ["Streamline Music", "Cloud Backup", "Daily News", "TrailFit App"],
  cat_salary: ["Acme Corp Payroll"],
  cat_freelance: ["Northwind Studios", "Brightline Consulting"],
};

const SPEND_BOUNDS: Record<string, [number, number]> = {
  cat_groceries: [22, 145],
  cat_dining: [8, 78],
  cat_transport: [4, 65],
  cat_rent: [1850, 1850],
  cat_utilities: [40, 180],
  cat_entertain: [12, 95],
  cat_health: [15, 140],
  cat_shopping: [18, 320],
  cat_subs: [5, 22],
};

const SPEND_FREQUENCY: Record<string, number> = {
  cat_groceries: 0.35,
  cat_dining: 0.45,
  cat_transport: 0.4,
  cat_rent: 0, // handled separately, monthly
  cat_utilities: 0,
  cat_entertain: 0.18,
  cat_health: 0.08,
  cat_shopping: 0.15,
  cat_subs: 0,
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateTransactions(): Transaction[] {
  const rand = mulberry32(SEED);
  const out: Transaction[] = [];
  let id = 1;

  // Anchor today to a deterministic value so demo screenshots stay stable.
  // Adjust this if you want the demo to roll forward.
  const today = new Date("2026-05-15T12:00:00Z");
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 6);

  for (let day = new Date(startDate); day <= today; day.setDate(day.getDate() + 1)) {
    const date = isoDate(day);
    const dayOfMonth = day.getDate();

    // Salary on the 1st and 15th, freelance once a month-ish on the 22nd
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      out.push({
        id: `txn_${id++}`,
        date,
        merchant: MERCHANTS.cat_salary[0],
        amount: 3_125,
        categoryId: "cat_salary",
        accountId: "acc_checking",
      });
    }
    if (dayOfMonth === 22 && rand() < 0.7) {
      const merchants = MERCHANTS.cat_freelance;
      out.push({
        id: `txn_${id++}`,
        date,
        merchant: merchants[Math.floor(rand() * merchants.length)],
        amount: 600 + Math.round(rand() * 1400),
        categoryId: "cat_freelance",
        accountId: "acc_checking",
      });
    }

    // Rent on the 1st
    if (dayOfMonth === 1) {
      out.push({
        id: `txn_${id++}`,
        date,
        merchant: MERCHANTS.cat_rent[0],
        amount: -1850,
        categoryId: "cat_rent",
        accountId: "acc_checking",
      });
    }

    // Utilities cluster around the 10th-12th
    if (dayOfMonth === 10 || dayOfMonth === 12) {
      const merchants = MERCHANTS.cat_utilities;
      out.push({
        id: `txn_${id++}`,
        date,
        merchant: merchants[Math.floor(rand() * merchants.length)],
        amount: -(40 + Math.round(rand() * 140)),
        categoryId: "cat_utilities",
        accountId: "acc_checking",
      });
    }

    // Subscriptions billed near the 5th
    if (dayOfMonth === 5) {
      for (const m of MERCHANTS.cat_subs) {
        if (rand() < 0.7) {
          out.push({
            id: `txn_${id++}`,
            date,
            merchant: m,
            amount: -(5 + Math.round(rand() * 17)),
            categoryId: "cat_subs",
            accountId: "acc_credit",
          });
        }
      }
    }

    // Daily probabilistic spend across the rest of the categories
    for (const catId of Object.keys(SPEND_FREQUENCY)) {
      const freq = SPEND_FREQUENCY[catId];
      if (freq <= 0) continue;
      if (rand() > freq) continue;
      const [lo, hi] = SPEND_BOUNDS[catId];
      const merchants = MERCHANTS[catId];
      const merchant = merchants[Math.floor(rand() * merchants.length)];
      const amount = -(lo + Math.round(rand() * (hi - lo)));
      const useCredit = rand() < 0.55;
      out.push({
        id: `txn_${id++}`,
        date,
        merchant,
        amount,
        categoryId: catId,
        accountId: useCredit ? "acc_credit" : "acc_checking",
      });
    }
  }

  // Sort newest first so callers can slice the top N without re-sorting.
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const transactions: Transaction[] = generateTransactions();
