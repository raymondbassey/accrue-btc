import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { HistoricalDataPoint } from '@/lib/mock-data';
import { tickXProps, tickYProps, gridProps, createXFormatter } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

export function DailyDepositsChart({ data }: { data: HistoricalDataPoint[] }) {
  const xFormatter = createXFormatter(data);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Daily Deposit Volume (sBTC)</h2>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...tickXProps} tickFormatter={xFormatter} />
            <YAxis {...tickYProps} tickFormatter={(v) => `₿${v.toFixed(1)}`} />
            <Tooltip content={<ChartTooltip color="hsl(var(--primary))" formatter={(v) => `₿${v.toFixed(8)}`} />} cursor={{ fill: 'hsl(var(--border))', opacity: 0.4 }} />
            <Bar dataKey="deposits" fill="hsl(var(--primary))" opacity={0.8} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
