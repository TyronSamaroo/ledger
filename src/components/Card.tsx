import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-medium text-text">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const deltaColor =
    tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-muted";
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <span className="text-2xl font-semibold text-text">{value}</span>
      <div className="flex items-baseline justify-between">
        {delta && <span className={`text-xs ${deltaColor}`}>{delta}</span>}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning";
}) {
  const styles: Record<string, string> = {
    neutral: "bg-elevated text-muted border-border",
    positive: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    negative: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
