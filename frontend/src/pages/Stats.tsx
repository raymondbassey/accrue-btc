import { useMemo, useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, Coins } from 'lucide-react';
import { MOCK_HISTORICAL_DATA } from '@/lib/mock-data';
import { formatBTC } from '@/lib/format';
import { RangeToggle, type Range } from '@/components/stats/RangeToggle';
import { SummaryCard } from '@/components/stats/SummaryCard';
import { SummaryCardSkeleton } from '@/components/stats/SummaryCardSkeleton';
import { ChartSkeleton } from '@/components/stats/ChartSkeleton';
import { TVLChart } from '@/components/stats/TVLChart';
import { APYChart } from '@/components/stats/APYChart';
import { DailyDepositsChart } from '@/components/stats/DailyDepositsChart';
import { CumDepositsChart } from '@/components/stats/CumDepositsChart';
import { SharePriceChart } from '@/components/stats/SharePriceChart';

const RANGE_DAYS: Record<Range, number> = { '7d': 7, '14d': 14, '30d': 30 };

export default function Stats() {
  const [range, setRange] = useState<Range>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [range]);

  const data = useMemo(() => MOCK_HISTORICAL_DATA.slice(-RANGE_DAYS[range]), [range]);

  const currentTVL = data[data.length - 1]?.tvl ?? 0;
  const avgTVL = data.reduce((s, d) => s + d.tvl, 0) / data.length;
  const tvlDelta = ((currentTVL - avgTVL) / avgTVL * 100).toFixed(2);

  const currentAPY = data[data.length - 1]?.apy ?? 0;
  const avgAPY = data.reduce((s, d) => s + d.apy, 0) / data.length;
  const apyDelta = (currentAPY - avgAPY).toFixed(4);

  const totalDeposits = data.reduce((s, d) => s + d.deposits, 0);

  const currentSharePrice = data[data.length - 1]?.sharePrice ?? 1;
  const avgSharePrice = data.reduce((s, d) => s + d.sharePrice, 0) / data.length;
  const sharePriceDelta = ((currentSharePrice - avgSharePrice) / avgSharePrice * 100).toFixed(4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vault Statistics</h1>
        <p className="text-sm text-muted-foreground">Historical performance metrics for the AccrueBTC sBTC Yield Vault</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Showing last {RANGE_DAYS[range]} days</span>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard label="Current TVL" value={formatBTC(currentTVL)} delta={`${Math.abs(Number(tvlDelta))}%`} positive={Number(tvlDelta) >= 0} icon={<DollarSign className="h-4 w-4" />} />
            <SummaryCard label="Current APY" value={`${currentAPY.toFixed(4)}%`} delta={`${Math.abs(Number(apyDelta))}%`} positive={Number(apyDelta) >= 0} icon={<Percent className="h-4 w-4" />} />
            <SummaryCard label="Share Price" value={`${currentSharePrice.toFixed(8)}`} delta={`${Math.abs(Number(sharePriceDelta))}%`} positive={Number(sharePriceDelta) >= 0} icon={<Coins className="h-4 w-4" />} />
            <SummaryCard label={`${RANGE_DAYS[range]}d Total Deposits`} value={formatBTC(totalDeposits)} icon={<TrendingUp className="h-4 w-4" />} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {isLoading ? (
          <>
            <div className="md:col-span-2"><ChartSkeleton height="lg" /></div>
            <ChartSkeleton />
            <ChartSkeleton />
            <div className="md:col-span-2"><ChartSkeleton height="lg" /></div>
            <div className="md:col-span-2"><ChartSkeleton height="lg" /></div>
          </>
        ) : (
          <>
            <div className="md:col-span-2"><TVLChart data={data} /></div>
            <APYChart data={data} avgAPY={avgAPY} rangeDays={RANGE_DAYS[range]} />
            <DailyDepositsChart data={data} />
            <div className="md:col-span-2"><CumDepositsChart data={data} /></div>
            <div className="md:col-span-2"><SharePriceChart data={data} /></div>
          </>
        )}
      </div>
    </main>
  );
}
