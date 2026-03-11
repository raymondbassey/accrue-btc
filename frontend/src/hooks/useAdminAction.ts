import { useCallback, useState, useRef, useEffect } from 'react';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { toast } from 'sonner';
import { CONTRACTS, buildExplorerUrl, toMicroUnits } from '@/lib/contracts';
import { NETWORK, fetchTxStatus } from '@/lib/stacks';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 40; // ~2 minutes

/**
 * Hook for admin contract write calls (set-paused, set-deposit-cap, set-strategist, report-yield).
 * Polls for on-chain confirmation before refreshing data.
 */
export function useAdminAction() {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(
    async (
      functionName: string,
      functionArgs: ReturnType<typeof Cl.uint>[],
      successMessage: string,
    ) => {
      setSubmitting(true);
      const toastId = toast.loading('Waiting for wallet…');

      const [contractAddr, contractName] = CONTRACTS.VAULT.split('.');

      try {
        const result = await request('stx_callContract', {
          contract: `${contractAddr}.${contractName}`,
          functionName,
          functionArgs,
          network: NETWORK,
        });

        const txId = result.txid;
        toast.loading('Transaction submitted — waiting for confirmation…', {
          id: toastId,
          action: {
            label: 'View',
            onClick: () => window.open(buildExplorerUrl(txId), '_blank', 'noopener,noreferrer'),
          },
        });

        // Poll for on-chain confirmation
        let polls = 0;
        const poll = async (): Promise<void> => {
          if (!mountedRef.current) return;
          if (polls >= MAX_POLLS) {
            toast.info('Transaction still pending — data will refresh when confirmed.', { id: toastId });
            queryClient.invalidateQueries({ queryKey: ['vault-info'] });
            return;
          }
          polls++;
          const status = await fetchTxStatus(txId);
          if (status.status === 'success') {
            toast.success(successMessage, {
              id: toastId,
              action: {
                label: 'View',
                onClick: () => window.open(buildExplorerUrl(txId), '_blank', 'noopener,noreferrer'),
              },
            });
            queryClient.invalidateQueries({ queryKey: ['vault-info'] });
            return;
          }
          if (status.status === 'abort_by_response' || status.status === 'abort_by_post_condition') {
            const desc = status.status === 'abort_by_response' ? status.error : 'Post-condition failure';
            toast.error('Transaction failed on-chain', { id: toastId, description: desc });
            return;
          }
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          return poll();
        };

        await poll();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Wallet rejected or failed';
        toast.error('Transaction failed', {
          id: toastId,
          description: message,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [queryClient],
  );

  return { execute, submitting };
}
