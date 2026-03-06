import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  suffix?: string;
}

export function StatCard({ label, value, change, suffix }: StatCardProps) {
  const positive = change >= 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
        {suffix && <span className="text-lg text-muted">{suffix}</span>}
      </p>
      <div
        className={`mt-2 flex items-center gap-1 text-xs font-medium ${
          positive ? "text-green-600" : "text-red-500"
        }`}
      >
        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {Math.abs(change)}% vs last month
      </div>
    </div>
  );
}
