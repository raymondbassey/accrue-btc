import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Coins } from 'lucide-react';
import type { HistoricalDataPoint } from '@/lib/types';
import { tickXProps, tickYProps, gridProps, createXFormatter } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

export function SharePriceChart({ data }: { data: HistoricalDataPoint[] }) {
  const xFormatter = createXFormatter(data);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-4 w-4 text-[#8B5CF6]" />
        <h2 className="text-sm font-semibold text-foreground">Share Price (aBTC/sBTC)</h2>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...tickXProps} tickFormatter={xFormatter} />
            <YAxis {...tickYProps} tickFormatter={(v) => v.toFixed(4)} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip color="#8B5CF6" formatter={(v) => `${v.toFixed(8)} aBTC/sBTC`} />} />
            <ReferenceLine
              y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1}
              label={{ value: '1:1 baseline', position: 'insideTopRight', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Line
              type="monotone" dataKey="sharePrice" stroke="#8B5CF6" strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: '#8B5CF6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Share price reflects cumulative yield accrual — values above 1.0 indicate positive returns.
      </p>
    </div>
  );
}
