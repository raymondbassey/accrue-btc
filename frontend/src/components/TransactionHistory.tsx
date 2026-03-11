import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Transaction } from '@/lib/types';
import { formatBTC, formatRelativeTime } from '@/lib/format';
import { ExternalLink, History, Check, X as XIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWallet } from '@/contexts/WalletContext';
import { useTxHistory } from '@/hooks/useContractReads';

const PAGE_SIZE = 5;

const StatusBadge = React.forwardRef<HTMLDivElement, { status: Transaction['status'] } & React.HTMLAttributes<HTMLDivElement>>(
  ({ status, ...props }, ref) => {
    const config = {
      confirmed: {
        className: 'border-success/30 text-success bg-success/10',
        icon: <Check className="mr-1 h-3 w-3" />,
      },
      pending: {
        className: 'border-warning/30 text-warning bg-warning/10',
        icon: <span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning animate-pulse-slow" />,
      },
      failed: {
        className: 'border-destructive/30 text-destructive bg-destructive/10',
        icon: <XIcon className="mr-1 h-3 w-3" />,
      },
    };

    const { className, icon } = config[status];

    return (
      <Badge ref={ref} variant="outline" className={`text-[10px] transition-all duration-300 ${className}`} {...props}>
        {icon}
        {status}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

const TypeBadge = React.forwardRef<HTMLDivElement, { type: Transaction['type'] } & React.HTMLAttributes<HTMLDivElement>>(
  ({ type, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="outline"
        className={`text-[10px] ${
          type === 'deposit'
            ? 'border-primary/30 text-primary bg-primary/10'
            : 'border-muted-foreground/30 text-muted-foreground'
        }`}
        {...props}
      >
        {type}
      </Badge>
    );
  }
);
TypeBadge.displayName = 'TypeBadge';

function buildExplorerUrl(txHash: string): string {
  return `https://explorer.hiro.so/txid/${txHash}?chain=testnet`;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <History className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">No transactions yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Your deposit and withdrawal history will appear here
      </p>
    </div>
  );
}

function ExpandedRow({ tx }: { tx: Transaction }) {
  return (
    <TableRow className="border-border bg-secondary/20">
      <TableCell colSpan={6} className="py-3">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-muted-foreground">
          <div>
            <span className="text-[10px] uppercase tracking-wider">Full Hash</span>
            <p className="mt-0.5 font-mono-financial text-foreground">{tx.txHash}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider">Timestamp</span>
            <p className="mt-0.5 text-foreground">{tx.timestamp.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider">Shares</span>
            <p className="mt-0.5 font-mono-financial text-foreground">{tx.shares.toFixed(8)}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function MobileCard({ tx, index }: { tx: Transaction; index: number }) {
  return (
    <div
      className={`border-b border-border p-4 last:border-b-0 transition-colors hover:bg-secondary/30 opacity-0 animate-fade-in-up anim-stagger-${Math.min(index + 1, 6)} ${
        tx.type === 'deposit' ? 'border-l-2 border-l-primary/40' : 'border-l-2 border-l-muted-foreground/20'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <TypeBadge type={tx.type} />
        <StatusBadge status={tx.status} />
      </div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Amount</span>
        <span className="font-mono-financial text-sm text-foreground">{formatBTC(tx.amount)}</span>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Shares</span>
        <span className="font-mono-financial text-sm text-foreground">{tx.shares.toFixed(8)}</span>
      </div>
      <div className="flex items-center justify-between">
        <a
          href={buildExplorerUrl(tx.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono-financial text-xs text-primary hover:underline"
        >
          {tx.txHash}
          <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(tx.timestamp)}</span>
      </div>
    </div>
  );
}

interface TransactionHistoryProps {
  loading?: boolean;
  liveTxs?: Transaction[];
}

export function TransactionHistory({ loading, liveTxs = [] }: TransactionHistoryProps) {
  const { address } = useWallet();
  const { data: onChainTxs = [], isLoading: historyLoading } = useTxHistory(address);

  // Merge session-live txs with on-chain history, dedup by id
  const onChainIds = new Set(onChainTxs.map((t) => t.id));
  const merged = [
    ...liveTxs.filter((t) => !onChainIds.has(t.id)),
    ...onChainTxs,
  ];

  const isLoadingAll = loading || historyLoading;
  const isEmpty = !isLoadingAll && merged.length === 0;
  const transactions = merged;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleTxs = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Transaction History
          </CardTitle>
          {transactions.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-8 text-xs" />
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Shares</TableHead>
                    <TableHead className="text-xs">Tx Hash</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-right text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody aria-live="polite">
                  {isLoadingAll
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                        </TableRow>
                      ))
                    : visibleTxs.map((tx, i) => (
                        <React.Fragment key={tx.id}>
                          <TableRow
                            className={`border-border cursor-pointer transition-colors duration-150 hover:bg-secondary/40 opacity-0 animate-fade-in-up anim-stagger-${Math.min(i + 1, 6)} ${
                              tx.type === 'deposit'
                                ? 'border-l-2 border-l-primary/40'
                                : 'border-l-2 border-l-muted-foreground/20'
                            }`}
                            onClick={() => toggleExpand(tx.id)}
                          >
                            <TableCell className="w-8 pr-0">
                              <ChevronRight
                                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                                  expandedId === tx.id ? 'rotate-90' : ''
                                }`}
                              />
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={tx.type} />
                            </TableCell>
                            <TableCell className="font-mono-financial text-xs">
                              {formatBTC(tx.amount)}
                            </TableCell>
                            <TableCell className="font-mono-financial text-xs">
                              {tx.shares.toFixed(8)}
                            </TableCell>
                            <TableCell>
                              <a
                                href={buildExplorerUrl(tx.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono-financial text-xs text-primary hover:underline"
                                aria-label={`View transaction ${tx.txHash}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tx.txHash}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default text-xs text-muted-foreground">
                                    {formatRelativeTime(tx.timestamp)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {tx.timestamp.toLocaleString()}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-right">
                              <StatusBadge status={tx.status} />
                            </TableCell>
                          </TableRow>
                          {expandedId === tx.id && <ExpandedRow tx={tx} />}
                        </React.Fragment>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden" aria-live="polite">
              {isLoadingAll
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2 border-b border-border p-4 last:border-b-0">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : visibleTxs.map((tx, i) => (
                    <MobileCard key={tx.id} tx={tx} index={i} />
                  ))}
            </div>

            {/* View More */}
            {hasMore && !isLoadingAll && (
              <div className="border-t border-border p-3 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  View More ({transactions.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
