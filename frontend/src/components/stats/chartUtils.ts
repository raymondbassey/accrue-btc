import type { HistoricalDataPoint } from '@/lib/types';

export const tickXProps = {
  tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  axisLine: false,
  tickLine: false,
};

export const tickYProps = {
  tick: { fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  axisLine: false,
  tickLine: false,
  width: 80,
};

export const gridProps = {
  stroke: 'hsl(var(--border))',
  strokeDasharray: '3 3',
  vertical: false,
};

export function createXFormatter(data: HistoricalDataPoint[]) {
  const step = Math.max(1, Math.floor(data.length / 6));
  return (_: any, idx: number) => (idx % step === 0 ? data[idx]?.date ?? '' : '');
}
