import { cn } from '@/lib/utils';

const sizes = {
  xs: { icon: 20, text: 'text-xs', gap: 'gap-1.5' },
  sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 36, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 48, text: 'text-4xl', gap: 'gap-3' },
} as const;

type LogoSize = keyof typeof sizes;

interface LogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
}

/** AccrueBTC Logomark — Shield with ₿ and upward yield accent */
function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shield / vault shape */}
      <path
        d="M24 2L6 10v14c0 11.2 7.68 21.66 18 24 10.32-2.34 18-12.8 18-24V10L24 2Z"
        fill="hsl(var(--primary) / 0.08)"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner shield highlight */}
      <path
        d="M24 6L10 12.5v10.5c0 9.1 5.98 17.6 14 19.5 8.02-1.9 14-10.4 14-19.5V12.5L24 6Z"
        fill="hsl(var(--primary) / 0.04)"
        stroke="hsl(var(--primary) / 0.2)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Stylized ₿ */}
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fontSize="20"
        fill="hsl(var(--primary))"
      >
        ₿
      </text>
      {/* Upward yield accent — small arrow */}
      <path
        d="M35 16l3-4 3 4"
        stroke="hsl(var(--success))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="38"
        y1="12"
        x2="38"
        y2="20"
        stroke="hsl(var(--success))"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 'sm', showWordmark = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <Logomark size={s.icon} />
      {showWordmark && (
        <span className={cn('font-bold tracking-tight', s.text)}>
          <span className="text-foreground">Accrue</span>
          <span className="text-primary">BTC</span>
        </span>
      )}
    </span>
  );
}

/** Standalone logomark for favicon / compact use */
export { Logomark };
