"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyCompact, formatMonth } from "@/lib/format";

interface Point {
  month: string;
  income: number;
  spend: number;
}

export function SpendingChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="g-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-spend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#8b8b9a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(m: string) => formatMonth(m).split(" ")[0].slice(0, 3)}
          />
          <YAxis
            stroke="#8b8b9a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.12)" }}
            contentStyle={{
              background: "#12121a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
              color: "#eaeaf0",
            }}
            formatter={(value: number, name: string) => [
              formatCurrencyCompact(value),
              name === "income" ? "Income" : "Spend",
            ]}
            labelFormatter={(m: string) => formatMonth(m)}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#g-income)"
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#fb7185"
            strokeWidth={2}
            fill="url(#g-spend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
