import { useMemo } from 'react';
import { TrendingUp, DollarSign, Coins, Info } from 'lucide-react';
import { formatBTC } from '@/lib/format';
import { fromMicroUnits } from '@/lib/contracts';
import { useVaultInfo } from '@/hooks/useContractReads';
import { SummaryCard } from '@/components/stats/SummaryCard';
import { SummaryCardSkeleton } from '@/components/stats/SummaryCardSkeleton';
import { ChartSkeleton } from '@/components/stats/ChartSkeleton';
import { TVLChart } from '@/components/stats/TVLChart';
import { DailyDepositsChart } from '@/components/stats/DailyDepositsChart';
import { CumDepositsChart } from '@/components/stats/CumDepositsChart';
import { SharePriceChart } from '@/components/stats/SharePriceChart';
import type { HistoricalDataPoint } from '@/lib/types';

export default function Stats() {
  const { data: vaultInfo, isLoading } = useVaultInfo();

  const totalAssets = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-assets'])) : 0;
  const totalShares = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-shares'])) : 0;
  const sharePrice = totalShares > 0 ? totalAssets / totalShares : 1;
  const depositCap = vaultInfo ? fromMicroUnits(Number(vaultInfo['deposit-cap'])) : 0;
  const capPercent = depositCap > 0 ? (totalAssets / depositCap) * 100 : 0;

  // Build a single-point dataset from live on-chain data.
  // Historical indexing is not yet available on testnet.
  const data = useMemo<HistoricalDataPoint[]>(() => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return [
      {
        date: today,
        tvl: totalAssets,
        apy: 0,
        deposits: totalAssets,
        cumDeposits: totalAssets,
        sharePrice,
      },
    ];
  }, [totalAssets, sharePrice]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vault Statistics</h1>
        <p className="text-sm text-muted-foreground">Live on-chain metrics for the AccrueBTC sBTC Yield Vault</p>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Testnet deployment — historical charts will populate as vault activity grows.
          Summary cards reflect live on-chain state.
        </p>
      </div>

      <div className="mb-6 flex items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Live on-chain data</span>
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
            <SummaryCard label="Total Value Locked" value={formatBTC(totalAssets)} delta={`${capPercent.toFixed(1)}% of cap`} positive icon={<DollarSign className="h-4 w-4" />} />
            <SummaryCard label="Share Price" value={sharePrice.toFixed(8)} icon={<Coins className="h-4 w-4" />} />
            <SummaryCard label="Total Shares" value={totalShares.toFixed(8)} icon={<Coins className="h-4 w-4" />} />
            <SummaryCard label="Deposit Cap" value={formatBTC(depositCap)} icon={<TrendingUp className="h-4 w-4" />} />
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
          </>
        ) : (
          <>
            <div className="md:col-span-2"><TVLChart data={data} /></div>
            <DailyDepositsChart data={data} />
            <SharePriceChart data={data} />
            <div className="md:col-span-2"><CumDepositsChart data={data} /></div>
          </>
        )}
      </div>
    </main>
  );
}
