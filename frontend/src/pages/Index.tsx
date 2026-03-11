import { useState, useCallback } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { PositionPanel } from '@/components/PositionPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { TransactionHistory } from '@/components/TransactionHistory';
import { DataFreshness } from '@/components/DataFreshness';
import { type Transaction } from '@/lib/mock-data';
import { formatBTC, formatABTC, formatPercentage } from '@/lib/format';
import { fromMicroUnits } from '@/lib/contracts';
import { useWallet } from '@/contexts/WalletContext';
import { useVaultInfo } from '@/hooks/useContractReads';
import { AlertTriangle, Shield, Coins, TrendingUp, Target } from 'lucide-react';

const PRECISION = 100_000_000;

const Index = () => {
  const { connected } = useWallet();
  const { data: vaultInfo, isLoading } = useVaultInfo();
  const [liveTxs, setLiveTxs] = useState<Transaction[]>([]);

  const totalAssets = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-assets'])) : 0;
  const totalShares = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-shares'])) : 0;
  const depositCap = vaultInfo ? fromMicroUnits(Number(vaultInfo['deposit-cap'])) : 0;
  const isPaused = vaultInfo?.paused ?? false;
  const sharePrice = totalShares > 0 ? totalAssets / totalShares : 1;

  const handleTransaction = useCallback((tx: Transaction) => {
    setLiveTxs((prev) => {
      const idx = prev.findIndex((t) => t.id === tx.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = tx;
        return updated;
      }
      return [tx, ...prev];
    });
  }, []);
  const capPercent = depositCap > 0 ? (totalAssets / depositCap) * 100 : 0;

  return (
    <main className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Ambient background texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Ambient radial glow behind metrics */}
      <div
        className="pointer-events-none absolute left-1/2 top-24 z-0 h-[400px] w-[800px] -translate-x-1/2 opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary)), transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {/* Page title */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              sBTC Yield Vault
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Deposit sBTC · Earn yield · Withdraw anytime
            </p>
          </div>
          <DataFreshness />
        </div>

        {/* Paused alert */}
        {isPaused && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Vault is currently paused. Deposits and withdrawals are disabled.
            </p>
          </div>
        )}

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Vault Assets"
            value={formatBTC(totalAssets)}
            numericValue={totalAssets}
            icon={<Shield className="h-4 w-4" />}
            loading={isLoading}
            staggerIndex={1}
          />
          <MetricCard
            label="Total Shares Issued"
            value={formatABTC(totalShares)}
            numericValue={totalShares}
            subtitle="aBTC"
            icon={<Coins className="h-4 w-4" />}
            loading={isLoading}
            staggerIndex={2}
          />
          <MetricCard
            label="Share Price"
            value={formatBTC(sharePrice)}
            numericValue={sharePrice}
            subtitle="per aBTC"
            icon={<TrendingUp className="h-4 w-4" />}
            loading={isLoading}
            staggerIndex={3}
          />
          <MetricCard
            label="Deposit Cap"
            value={formatBTC(depositCap)}
            numericValue={depositCap}
            icon={<Target className="h-4 w-4" />}
            progress={{
              value: capPercent,
              label: `${capPercent.toFixed(1)}% utilized · ${formatBTC(totalAssets)} deposited`,
            }}
            loading={isLoading}
            staggerIndex={4}
          />
        </div>

        {/* Position + Action */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 opacity-0 animate-fade-in-up anim-stagger-5">
            <PositionPanel loading={isLoading} />
          </div>
          <div id="action-panel" className="lg:col-span-2 opacity-0 animate-fade-in-up anim-stagger-6">
            <ActionPanel onTransaction={handleTransaction} loading={isLoading} />
          </div>
        </div>

        {/* Transaction History */}
        {connected && (
          <div className="opacity-0 animate-fade-in-up anim-stagger-7">
            <TransactionHistory liveTxs={liveTxs} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Index;
