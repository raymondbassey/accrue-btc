import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { MOCK_POSITION } from '@/lib/mock-data';
import { formatBTC, formatABTC, formatPercentage } from '@/lib/format';
import { Wallet, PackageOpen, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PositionPanelProps {
  loading?: boolean;
}

export const PositionPanel = React.forwardRef<HTMLDivElement, PositionPanelProps>(({ loading }, ref) => {
  const { connected, connect } = useWallet();

  const scrollToAction = () => {
    document.getElementById('action-panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!connected) {
    return (
      <Card ref={ref} className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full border-2 border-dashed border-border p-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">No Wallet Connected</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Connect your wallet to view your position
          </p>
          <Button size="sm" onClick={connect}>
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card ref={ref} className="border-border bg-card">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Summary header */}
          <div className="flex items-baseline justify-between">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Composition bar */}
          <Skeleton className="h-3 w-full rounded-full" />
          {/* Holdings rows */}
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="border-t border-border" />
          {/* Performance rows */}
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pos = MOCK_POSITION;
  const hasPosition = pos.abtcBalance > 0;

  if (!hasPosition) {
    return (
      <Card ref={ref} className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="mb-3 rounded-full border-2 border-dashed border-border p-3">
            <PackageOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No Active Position</p>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            Deposit sBTC to start earning yield
          </p>
          <Button size="sm" variant="outline" onClick={scrollToAction} className="gap-2">
            <ArrowDown className="h-3.5 w-3.5" />
            Deposit Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const yieldFraction = pos.yieldEarned / pos.currentValue;
  const depositFraction = 1 - yieldFraction;

  const holdingsRows = [
    { label: 'aBTC Balance', value: formatABTC(pos.abtcBalance), highlight: false },
    { label: 'Current Value', value: formatBTC(pos.currentValue), highlight: false },
    { label: 'Original Deposit', value: formatBTC(pos.originalDeposit), highlight: false },
  ];

  const performanceRows = [
    { label: 'Yield Earned', value: formatBTC(pos.yieldEarned), highlight: true, pulse: true },
    { label: 'Yield %', value: formatPercentage(pos.yieldPercent), highlight: true, pulse: false },
  ];

  return (
    <Card ref={ref} className="border-border bg-card opacity-0 animate-fade-in-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Your Position
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5" role="region" aria-label="Your vault position">
        {/* Summary header */}
        <div className="flex items-baseline justify-between">
          <p className="font-mono-financial text-3xl font-semibold tracking-tight text-foreground">
            {formatBTC(pos.currentValue)}
          </p>
          <Badge
            variant="outline"
            className="border-success/30 bg-success/10 text-success font-mono-financial text-xs"
          >
            {formatPercentage(pos.yieldPercent)}
          </Badge>
        </div>

        {/* Composition bar — thicker with animated width */}
        <div className="space-y-1.5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-l-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${depositFraction * 100}%` }}
            />
            <div
              className="h-full rounded-r-full bg-success transition-all duration-700 ease-out"
              style={{ width: `${yieldFraction * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              Deposit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              Yield
            </span>
          </div>
        </div>

        {/* Holdings */}
        <div className="space-y-2.5">
          {holdingsRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/50 opacity-0 animate-fade-in anim-stagger-${i + 1}`}
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="font-mono-financial text-sm font-medium text-foreground">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-border" />

        {/* Performance */}
        <div className="space-y-2.5">
          {performanceRows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/50 opacity-0 animate-fade-in anim-stagger-${i + 4}`}
            >
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {row.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                )}
                {row.label}
              </span>
              <span className="font-mono-financial text-sm font-semibold text-success">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
PositionPanel.displayName = 'PositionPanel';
