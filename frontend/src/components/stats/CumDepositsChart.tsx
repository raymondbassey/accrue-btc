import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Layers } from 'lucide-react';
import type { HistoricalDataPoint } from '@/lib/mock-data';
import { tickXProps, tickYProps, gridProps, createXFormatter } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';

export function CumDepositsChart({ data }: { data: HistoricalDataPoint[] }) {
  const xFormatter = createXFormatter(data);
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-[#06B6D4]" />
        <h2 className="text-sm font-semibold text-foreground">Cumulative Deposits (sBTC)</h2>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumDepGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...tickXProps} tickFormatter={xFormatter} />
            <YAxis {...tickYProps} tickFormatter={(v) => `₿${v.toFixed(1)}`} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip color="#06B6D4" formatter={(v) => `₿${v.toFixed(8)}`} />} />
            <Area
              type="monotone" dataKey="cumDeposits" stroke="#06B6D4" strokeWidth={2}
              fill="url(#cumDepGradient)" dot={false}
              activeDot={{ r: 4, fill: '#06B6D4', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
