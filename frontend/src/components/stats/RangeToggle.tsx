export type Range = '7d' | '14d' | '30d';

const RANGES: Range[] = ['7d', '14d', '30d'];

export function RangeToggle({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            value === r
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
