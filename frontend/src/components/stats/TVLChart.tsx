import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { HistoricalDataPoint } from '@/lib/types';
import { tickXProps, tickYProps, gridProps, createXFormatter } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

export function TVLChart({ data }: { data: HistoricalDataPoint[] }) {
  const xFormatter = createXFormatter(data);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Total Value Locked (sBTC)</h2>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...tickXProps} tickFormatter={xFormatter} />
            <YAxis {...tickYProps} tickFormatter={(v) => `₿${v.toFixed(1)}`} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip color="hsl(var(--primary))" formatter={(v) => `₿${v.toFixed(8)}`} />} />
            <Area
              type="monotone" dataKey="tvl" stroke="hsl(var(--primary))" strokeWidth={2}
              fill="url(#tvlGradient)" dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
