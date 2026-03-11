import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { buildExplorerUrl, getErrorMessage, CONTRACTS, toMicroUnits } from '@/lib/contracts';
import { NETWORK, fetchTxStatus } from '@/lib/stacks';

export type TxStatus =
  | 'idle'
  | 'wallet-pending'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export type TxType = 'deposit' | 'withdraw';

interface TxState {
  status: TxStatus;
  txId: string | null;
  type: TxType | null;
  amount: number;
}

interface TransactionManagerReturn extends TxState {
  submit: (type: TxType, amount: number) => void;
  reset: () => void;
  /** Callback for when a transaction completes. Set by consumer. */
  onConfirmed?: () => void;
}

const INITIAL: TxState = { status: 'idle', txId: null, type: null, amount: 0 };

const POLL_INTERVAL = 3_000; // 3 seconds
const MAX_POLLS = 60; // 3 minutes max

export function useTransactionManager(
  onConfirmed?: (type: TxType, amount: number, txId: string) => void,
  onFailed?: (type: TxType, amount: number) => void,
): TransactionManagerReturn {
  const [state, setState] = useState<TxState>(INITIAL);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const safeSet = useCallback((updater: (prev: TxState) => TxState) => {
    if (mountedRef.current) setState(updater);
  }, []);

  const reset = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setState(INITIAL);
  }, []);

  const pollTransaction = useCallback(
    (txId: string, type: TxType, amount: number) => {
      let polls = 0;
      safeSet(prev => ({ ...prev, status: 'confirming' }));
      const confirmToastId = toast.loading('Confirming transaction…', {
        id: `confirm-${txId}`,
      });

      pollRef.current = setInterval(async () => {
        polls++;
        if (!mountedRef.current) {
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }

        const result = await fetchTxStatus(txId);

        if (result.status === 'success') {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.dismiss(confirmToastId);
          safeSet(prev => ({ ...prev, status: 'confirmed' }));
          toast.success('Transaction confirmed!', { id: `result-${txId}` });
          onConfirmed?.(type, amount, txId);
          setTimeout(() => safeSet(() => INITIAL), 2000);
        } else if (result.status === 'abort_by_response') {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.dismiss(confirmToastId);
          // Parse error code from repr like "(err u205)"
          const codeMatch = result.error.match(/u(\d+)/);
          const errMsg = codeMatch
            ? getErrorMessage(parseInt(codeMatch[1], 10))
            : result.error;
          safeSet(prev => ({ ...prev, status: 'failed' }));
          toast.error('Transaction failed', {
            description: errMsg,
            id: `result-${txId}`,
          });
          onFailed?.(type, amount);
          setTimeout(() => safeSet(() => INITIAL), 2000);
        } else if (result.status === 'abort_by_post_condition') {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.dismiss(confirmToastId);
          safeSet(prev => ({ ...prev, status: 'failed' }));
          toast.error('Transaction failed', {
            description: 'Post-condition check failed',
            id: `result-${txId}`,
          });
          onFailed?.(type, amount);
          setTimeout(() => safeSet(() => INITIAL), 2000);
        } else if (polls >= MAX_POLLS) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.dismiss(confirmToastId);
          safeSet(prev => ({ ...prev, status: 'failed' }));
          toast.error('Transaction timeout', {
            description: 'Check explorer for final status',
            id: `result-${txId}`,
            action: {
              label: 'View',
              onClick: () => window.open(buildExplorerUrl(txId), '_blank'),
            },
          });
          onFailed?.(type, amount);
          setTimeout(() => safeSet(() => INITIAL), 2000);
        }
      }, POLL_INTERVAL);
    },
    [safeSet, onConfirmed, onFailed],
  );

  const submit = useCallback(
    (type: TxType, amount: number) => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      safeSet(() => ({ status: 'wallet-pending', txId: null, type, amount }));
      const loadingToastId = toast.loading('Waiting for wallet approval…');

      const microAmount = toMicroUnits(amount);
      const [contractAddr, contractName] = CONTRACTS.VAULT.split('.');

      const functionName = type === 'deposit' ? 'deposit' : 'withdraw';
      const functionArgs = [Cl.uint(microAmount)];

      (async () => {
        try {
          const result = await request('stx_callContract', {
            contract: `${contractAddr}.${contractName}`,
            functionName,
            functionArgs,
            network: NETWORK,
          });

          toast.dismiss(loadingToastId);
          const txId = result.txid;

          safeSet(() => ({ status: 'submitted', txId, type, amount }));
          toast.success('Transaction submitted', {
            description: `${txId.slice(0, 10)}…${txId.slice(-4)}`,
            action: {
              label: 'View',
              onClick: () => window.open(buildExplorerUrl(txId), '_blank'),
            },
          });

          // Start polling for confirmation
          pollTransaction(txId, type, amount);
        } catch (err: unknown) {
          toast.dismiss(loadingToastId);
          safeSet(prev => ({ ...prev, status: 'failed' }));

          const message =
            err instanceof Error ? err.message : 'Wallet rejected or failed';
          toast.error('Transaction failed', { description: message });
          onFailed?.(type, amount);
          setTimeout(() => safeSet(() => INITIAL), 2000);
        }
      })();
    },
    [safeSet, pollTransaction, onFailed],
  );

  return { ...state, submit, reset };
}
