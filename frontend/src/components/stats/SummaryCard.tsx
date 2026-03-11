import type { ReactNode } from 'react';

interface SummaryCardProps {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: ReactNode;
}

export function SummaryCard({ label, value, delta, positive, icon }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="font-mono-financial text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {positive ? '▲' : '▼'} {delta} vs 30d avg
        </p>
      )}
    </div>
  );
}
