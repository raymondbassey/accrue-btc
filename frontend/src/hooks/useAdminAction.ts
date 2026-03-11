import { useCallback, useState } from 'react';
import { request } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import { toast } from 'sonner';
import { CONTRACTS, buildExplorerUrl, toMicroUnits } from '@/lib/contracts';
import { NETWORK } from '@/lib/stacks';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for admin contract write calls (set-paused, set-deposit-cap, set-strategist, report-yield).
 * Returns { execute, submitting }.
 */
export function useAdminAction() {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

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

        toast.success(successMessage, {
          id: toastId,
          action: {
            label: 'View',
            onClick: () =>
              window.open(buildExplorerUrl(result.txid), '_blank'),
          },
        });

        // Invalidate vault info to refresh data
        queryClient.invalidateQueries({ queryKey: ['vault-info'] });
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
