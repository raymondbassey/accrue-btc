import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { useVaultInfo } from '@/hooks/useContractReads';
import { useAdminAction } from '@/hooks/useAdminAction';
import { Cl } from '@stacks/transactions';
import { Pause, Play, Loader2 } from 'lucide-react';

export function VaultStatusCard({ loading }: { loading?: boolean }) {
  const { data: vaultInfo, isLoading } = useVaultInfo();
  const { execute, submitting } = useAdminAction();

  const paused = vaultInfo?.paused ?? false;
  const isDataLoading = loading || isLoading;

  const toggle = () => {
    execute(
      'set-paused',
      [Cl.bool(!paused)],
      `Vault ${paused ? 'activated' : 'paused'}`,
    );
  };