interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  color: string;
  formatter: (value: number) => string;
}

export function ChartTooltip({ active, payload, label, color, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-muted-foreground">{label}</p>
      <p className="font-mono-financial font-semibold" style={{ color }}>
        {formatter(Number(payload[0].value))}
      </p>
    </div>
  );
}
