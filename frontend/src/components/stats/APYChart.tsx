import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Percent } from 'lucide-react';
import type { HistoricalDataPoint } from '@/lib/mock-data';
import { tickXProps, tickYProps, gridProps, createXFormatter } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

interface Props {
  data: HistoricalDataPoint[];
  avgAPY: number;
  rangeDays: number;
}

export function APYChart({ data, avgAPY, rangeDays }: Props) {
  const xFormatter = createXFormatter(data);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Percent className="h-4 w-4 text-success" />
        <h2 className="text-sm font-semibold text-foreground">APY Trend (%)</h2>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...tickXProps} tickFormatter={xFormatter} />
            <YAxis {...tickYProps} tickFormatter={(v) => `${v.toFixed(2)}%`} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip color="hsl(var(--success))" formatter={(v) => `${v.toFixed(4)}%`} />} />
            <ReferenceLine y={avgAPY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} />
            <Line
              type="monotone" dataKey="apy" stroke="hsl(var(--success))" strokeWidth={2}
              dot={false} activeDot={{ r: 4, fill: 'hsl(var(--success))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Dashed line = {rangeDays}d avg ({avgAPY.toFixed(4)}%)
      </p>
    </div>
  );
}
