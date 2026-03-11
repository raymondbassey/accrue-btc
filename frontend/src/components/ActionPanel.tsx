import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { fromMicroUnits } from '@/lib/contracts';
import { useVaultInfo, useSharesOf, useSbtcBalance } from '@/hooks/useContractReads';
import { formatBTC, formatABTC, sanitizeBTCInput } from '@/lib/format';
import { ArrowDown, ArrowUp, Loader2, Wallet, ExternalLink, Check, X, ArrowDownUp } from 'lucide-react';
import { useTransactionManager, type TxStatus } from '@/hooks/useTransactionManager';
import type { Transaction } from '@/lib/types';

/** Token icon — colored circle with label */
function TokenIcon({ token }: { token: 'sBTC' | 'aBTC' }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-5 w-5 rounded-full border ${
          token === 'sBTC'
            ? 'border-primary/40 bg-primary/20'
            : 'border-muted-foreground/30 bg-muted'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center text-[9px] font-bold text-foreground">
          {token === 'sBTC' ? '₿' : 'a'}
        </span>
      </span>
      <span className="text-xs font-medium text-foreground">{token}</span>
    </span>
  );
}

interface ActionPanelProps {
  onTransaction?: (tx: Transaction) => void;
  loading?: boolean;
}

export const ActionPanel = React.forwardRef<HTMLDivElement, ActionPanelProps>(
  ({ onTransaction, loading }, ref) => {
    const { connected, connect, address } = useWallet();
    const { data: vaultInfo } = useVaultInfo();
    const { data: sharesRaw } = useSharesOf(address);
    const { data: sbtcRaw } = useSbtcBalance(address);
    const [tab, setTab] = useState('deposit');
    const [amount, setAmount] = useState('');
    const pendingTxIdRef = useRef<string | null>(null);

    const totalAssets = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-assets'])) : 0;
    const totalShares = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-shares'])) : 0;
    const depositCap = vaultInfo ? fromMicroUnits(Number(vaultInfo['deposit-cap'])) : 0;
    const isPaused = vaultInfo?.paused ?? false;
    const sharePrice = totalShares > 0 ? totalAssets / totalShares : 1;

    const userSBTCBalance = sbtcRaw ? fromMicroUnits(Number(sbtcRaw)) : 0;
    const userABTCBalance = sharesRaw ? fromMicroUnits(Number(sharesRaw)) : 0;

    const handleConfirmed = useCallback(
      (type: 'deposit' | 'withdraw', txAmount: number, txId: string) => {
        setAmount('');
        const localId = pendingTxIdRef.current ?? crypto.randomUUID();
        pendingTxIdRef.current = null;
        onTransaction?.({
          id: localId,
          type,
          amount: txAmount,
          shares: txAmount / sharePrice,
          txHash: `${txId.slice(0, 6)}…${txId.slice(-4)}`,
          timestamp: new Date(),
          status: 'confirmed',
        });
      },
      [onTransaction, sharePrice],
    );

    const handleFailed = useCallback(
      (type: 'deposit' | 'withdraw', txAmount: number) => {
        const localId = pendingTxIdRef.current ?? crypto.randomUUID();
        pendingTxIdRef.current = null;
        onTransaction?.({
          id: localId,
          type,
          amount: txAmount,
          shares: txAmount / sharePrice,
          txHash: '—',
          timestamp: new Date(),
          status: 'failed',
        });
      },
      [onTransaction, sharePrice],
    );

    const txManager = useTransactionManager(handleConfirmed, handleFailed);
    const isInFlight = txManager.status !== 'idle';

    useEffect(() => {
      if (!isInFlight) setAmount('');
    }, [tab, isInFlight]);

    const numAmount = parseFloat(amount) || 0;
    const preview =
      tab === 'deposit' ? numAmount / sharePrice : numAmount * sharePrice;

    const capReached = totalAssets >= depositCap;

    const balance = tab === 'deposit' ? userSBTCBalance : userABTCBalance;
    const capRemaining = depositCap - totalAssets;

    const validationError = (() => {
      if (!amount || amount === '0') return undefined;
      const num = parseFloat(amount);
      if (isNaN(num)) return 'Invalid amount';
      if (num <= 0) return undefined;
      if (num > balance) return 'Exceeds available balance';
      if (tab === 'deposit' && num > capRemaining)
        return `Exceeds deposit cap (₿${capRemaining.toFixed(8)} remaining)`;
      return undefined;
    })();

    const handleAmountChange = (value: string) => {
      if (!isInFlight) setAmount(sanitizeBTCInput(value));
    };

    const setPercentage = (pct: number) => {
      if (isInFlight) return;
      const bal = tab === 'deposit' ? userSBTCBalance : userABTCBalance;
      setAmount((bal * pct).toFixed(8));
    };

    const handleSubmit = () => {
      const txType = tab === 'deposit' ? 'deposit' : 'withdraw';
      const txLocalId = crypto.randomUUID();
      pendingTxIdRef.current = txLocalId;
      txManager.submit(txType as 'deposit' | 'withdraw', numAmount);

      onTransaction?.({
        id: txLocalId,
        type: txType as 'deposit' | 'withdraw',
        amount: numAmount,
        shares: numAmount / sharePrice,
        txHash: '…pending',
        timestamp: new Date(),
        status: 'pending',
      });
    };

    if (loading) {
      return (
        <Card ref={ref} className="border-border bg-card">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tab bar */}
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
            </div>
            {/* Input section */}
            <div className="rounded-lg border border-border bg-background p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-7 w-full" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-7 flex-1 rounded-md" />
                ))}
              </div>
            </div>
            {/* Swap divider */}
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            {/* Preview section */}
            <div className="rounded-lg border border-border bg-background p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-7 w-full" />
            </div>
            {/* Submit button */}
            <Skeleton className="h-12 w-full rounded-lg" />
          </CardContent>
        </Card>
      );
    }

    if (!connected) {
      return (
        <Card ref={ref} className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm font-medium text-foreground">
              Connect to Trade
            </p>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Connect your wallet to deposit or withdraw
            </p>
            <Button size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      );
    }

    const depositDisabled = isPaused || capReached || userSBTCBalance <= 0 || isInFlight;
    const withdrawDisabled = isPaused || isInFlight;

    return (
      <Card ref={ref} className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => !isInFlight && setTab(v)}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="deposit" className="flex-1 text-xs" disabled={isInFlight}>
                Deposit sBTC
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1 text-xs" disabled={isInFlight}>
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4" key={`deposit-${tab}`}>
              <div className="opacity-0 animate-fade-in">
                {capReached && (
                  <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                    <p className="text-xs font-medium text-warning">
                      Deposit cap reached. No further deposits accepted.
                    </p>
                  </div>
                )}
                {userSBTCBalance <= 0 && !capReached && (
                  <div className="mb-4 rounded-md border border-border bg-secondary px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      You have no sBTC.{' '}
                      <a
                        href="https://sbtc.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Bridge sBTC at sbtc.tech
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                )}
                <ActionForm
                  inputToken="sBTC"
                  outputToken="aBTC"
                  label="sBTC Amount"
                  balance={`₿${userSBTCBalance.toFixed(8)}`}
                  amount={amount}
                  onChange={handleAmountChange}
                  onPercentage={setPercentage}
                  preview={preview}
                  previewLabel="You will receive"
                  previewUnit="aBTC"
                  previewFormatter={formatABTC}
                  previewIcon={<ArrowDown className="h-3.5 w-3.5 text-success" />}
                  rate={`1 sBTC = ${(1 / sharePrice).toFixed(8)} aBTC`}
                  disabled={depositDisabled}
                  txStatus={txManager.status}
                  onSubmit={handleSubmit}
                  buttonLabel="Deposit"
                  error={validationError}
                />
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4" key={`withdraw-${tab}`}>
              <div className="opacity-0 animate-fade-in">
                <ActionForm
                  inputToken="aBTC"
                  outputToken="sBTC"
                  label="aBTC Amount"
                  balance={`${userABTCBalance.toFixed(8)} aBTC`}
                  amount={amount}
                  onChange={handleAmountChange}
                  onPercentage={setPercentage}
                  preview={preview}
                  previewLabel="You will receive"
                  previewUnit="sBTC"
                  previewFormatter={formatBTC}
                  previewIcon={<ArrowUp className="h-3.5 w-3.5 text-primary" />}
                  rate={`1 aBTC = ${sharePrice.toFixed(8)} sBTC`}
                  disabled={withdrawDisabled}
                  txStatus={txManager.status}
                  onSubmit={handleSubmit}
                  buttonLabel="Withdraw"
                  error={validationError}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  },
);
ActionPanel.displayName = 'ActionPanel';

function getButtonContent(
  txStatus: TxStatus,
  defaultLabel: string,
): React.ReactNode {
  switch (txStatus) {
    case 'wallet-pending':
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for Wallet…
        </>
      );
    case 'submitted':
    case 'confirming':
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming…
        </>
      );
    case 'confirmed':
      return (
        <>
          <Check className="mr-2 h-4 w-4" /> Success
        </>
      );
    case 'failed':
      return (
        <>
          <X className="mr-2 h-4 w-4" /> Failed
        </>
      );
    default:
      return defaultLabel;
  }
}

const PERCENTAGE_BUTTONS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: 'MAX', value: 1 },
];

function ActionForm({
  inputToken,
  outputToken,
  label,
  balance,
  amount,
  onChange,
  onPercentage,
  preview,
  previewLabel,
  previewUnit,
  previewFormatter,
  previewIcon,
  rate,
  disabled,
  txStatus,
  onSubmit,
  buttonLabel,
  error,
}: {
  inputToken: 'sBTC' | 'aBTC';
  outputToken: 'sBTC' | 'aBTC';
  label: string;
  balance: string;
  amount: string;
  onChange: (v: string) => void;
  onPercentage: (pct: number) => void;
  preview: number;
  previewLabel: string;
  previewUnit: string;
  previewFormatter: (v: number) => string;
  previewIcon: React.ReactNode;
  rate: string;
  disabled: boolean;
  txStatus: TxStatus;
  onSubmit: () => void;
  buttonLabel: string;
  error?: string;
}) {
  const isInFlight = txStatus !== 'idle';
  const hasPreview = parseFloat(amount) > 0;

  return (
    <div className="space-y-4">
      {/* Input section */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between">
          <TokenIcon token={inputToken} />
          <button
            onClick={() => onPercentage(1)}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            disabled={disabled || isInFlight}
          >
            Balance: <span className="font-mono-financial text-foreground">{balance}</span>
          </button>
        </div>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.00000000"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 bg-transparent text-right font-mono-financial text-lg shadow-none focus-visible:ring-0"
          disabled={disabled || isInFlight}
          aria-label={label}
          aria-invalid={!!error}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
        )}
        {/* Percentage buttons */}
        <div className="mt-2 flex gap-2">
          {PERCENTAGE_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => onPercentage(btn.value)}
              disabled={disabled || isInFlight}
              className="flex-1 rounded-md border border-border bg-secondary/50 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 disabled:opacity-40"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swap divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <ArrowDownUp className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between">
          <TokenIcon token={outputToken} />
          <span className="text-[11px] text-muted-foreground">{previewLabel}</span>
        </div>
        <div className="text-right">
          <span className={`font-mono-financial text-lg font-semibold text-foreground transition-all duration-200 ${hasPreview ? 'opacity-100' : 'opacity-30'}`}>
            {previewFormatter(preview)}
          </span>
        </div>
        <div className="mt-2 text-right text-[11px] text-muted-foreground">
          {rate}
        </div>
      </div>

      <Button
        className="w-full"
        disabled={disabled || !parseFloat(amount) || isInFlight || !!error}
        onClick={onSubmit}
        aria-busy={isInFlight}
        aria-disabled={disabled || !parseFloat(amount) || isInFlight}
        variant={
          txStatus === 'confirmed'
            ? 'default'
            : txStatus === 'failed'
              ? 'destructive'
              : 'default'
        }
      >
        {getButtonContent(txStatus, buttonLabel)}
      </Button>
    </div>
  );
}
