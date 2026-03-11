import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MetricCardProps {
  label: string;
  value: string;
  numericValue?: number;
  subtitle?: string;
  progress?: { value: number; label: string };
  loading?: boolean;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  sparklineData?: { v: number }[];
  staggerIndex?: number;
}

const staggerClass = (i?: number) =>
  i ? `opacity-0 animate-fade-in-up anim-stagger-${i}` : '';

export function MetricCard({ label, value, numericValue, subtitle, progress, loading, icon, trend, sparklineData, staggerIndex }: MetricCardProps) {
  const animatedValue = useCountUp(numericValue ?? 0);
  const showAnimated = numericValue !== undefined && !loading;

  return (
    <Card className={`border-border bg-card transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.06)] ${staggerClass(staggerIndex)}`} aria-busy={loading}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        {loading ? (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <Skeleton className="h-9 w-3/5" />
              {trend && <Skeleton className="h-5 w-14 rounded-md" />}
            </div>
            {subtitle && <Skeleton className="mt-1.5 h-3 w-1/3" />}
            {sparklineData && <Skeleton className="mt-3 h-10 w-full rounded-md" />}
            {progress && (
              <>
                <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
                <Skeleton className="mt-1.5 h-3 w-2/3" />
              </>
            )}
          </>
        ) : (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="font-mono-financial text-3xl font-semibold tracking-tight text-foreground transition-all duration-300">
                {showAnimated ? value.replace(/[\d.]+/, animatedValue.toFixed(value.includes('.') ? (value.split('.')[1]?.replace(/[^\d]/g, '').length ?? 0) : 0)) : value}
              </p>
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-all duration-500 ${
                    trend.direction === 'up'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value.toFixed(2)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="mt-3 h-10 w-full opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`spark-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="hsl(var(--primary))"
                      strokeWidth={1.5}
                      fill={`url(#spark-${label.replace(/\s/g, '')})`}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {progress && (
              <div className="mt-4">
                <Progress value={progress.value} className="h-1.5" />
                <p className="mt-1.5 text-[11px] text-muted-foreground">{progress.label}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
