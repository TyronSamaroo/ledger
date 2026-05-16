/**
 * Currency in USD with sign. Positive values get a leading "+", negative get
 * a "-". Use `signed: false` for balances where the sign is implicit.
 */
export function formatCurrency(amount: number, signed = false): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
  if (!signed) return amount < 0 ? `-${formatted}` : formatted;
  if (amount === 0) return formatted;
  return amount > 0 ? `+${formatted}` : `-${formatted}`;
}

/** Compact currency: 1,250 → "$1.3k", 18,200 → "$18.2k". */
export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs < 1000) return formatCurrency(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs < 1_000_000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return `${sign}$${(abs / 1_000_000).toFixed(2)}m`;
}

/** YYYY-MM-DD → "May 15". */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** YYYY-MM-DD → "May 15, 2026". */
export function formatDateLong(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** YYYY-MM-DD → "2026-05". */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** "2026-05" → "May 2026". */
export function formatMonth(key: string): string {
  const d = new Date(key + "-01T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
