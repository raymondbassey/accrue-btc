import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { buildExplorerUrl, getErrorMessage } from '@/lib/contracts';

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

function generateMockTxId(): string {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0');
  return `0x${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`;
}

export function useTransactionManager(
  onConfirmed?: (type: TxType, amount: number, txId: string) => void,
  onFailed?: (type: TxType, amount: number) => void,
): TransactionManagerReturn {
  const [state, setState] = useState<TxState>(INITIAL);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const safeSet = useCallback((updater: (prev: TxState) => TxState) => {
    if (mountedRef.current) setState(updater);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setState(INITIAL);
  }, []);

  const submit = useCallback(
    (type: TxType, amount: number) => {
      // Clear previous
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      // 1. Wallet pending
      safeSet(() => ({ status: 'wallet-pending', txId: null, type, amount }));
      const loadingToastId = toast.loading('Waiting for wallet approval…');

      // 2. Submitted (after ~1.5s mock wallet delay)
      schedule(() => {
        const txId = generateMockTxId();
        toast.dismiss(loadingToastId);

        safeSet(() => ({ status: 'submitted', txId, type, amount }));
        toast.success('Transaction submitted', {
          description: `${txId.slice(0, 10)}…${txId.slice(-4)}`,
          action: {
            label: 'View',
            onClick: () => window.open(buildExplorerUrl(txId), '_blank'),
          },
        });

        // 3. Confirming (after ~1s)
        schedule(() => {
          safeSet((prev) => ({ ...prev, status: 'confirming' }));
          const confirmToastId = toast.loading('Confirming transaction…', {
            id: `confirm-${txId}`,
          });

          // 4. Confirmed or failed (after ~8s of "polling")
          // Simulate: 90% success, 10% failure
          const willFail = Math.random() < 0.1;

          schedule(() => {
            toast.dismiss(confirmToastId);

            if (willFail) {
              const errorCode = [200, 201, 202, 203, 204, 205, 206][
                Math.floor(Math.random() * 7)
              ];
              safeSet((prev) => ({ ...prev, status: 'failed' }));
              toast.error('Transaction failed', {
                description: getErrorMessage(errorCode),
                id: `result-${txId}`,
              });
              onFailed?.(type, amount);

              // Auto-reset after 2s
              schedule(() => {
                safeSet(() => INITIAL);
              }, 2000);
            } else {
              safeSet((prev) => ({ ...prev, status: 'confirmed' }));
              toast.success('Transaction confirmed!', {
                id: `result-${txId}`,
              });
              onConfirmed?.(type, amount, txId);

              // Auto-reset after 2s
              schedule(() => {
                safeSet(() => INITIAL);
              }, 2000);
            }
          }, 8000);
        }, 1000);
      }, 1500);
    },
    [safeSet, schedule, onConfirmed, onFailed],
  );

  return { ...state, submit, reset };
}
