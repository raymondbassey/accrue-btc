import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { useVaultInfo } from '@/hooks/useContractReads';
import { useAdminAction } from '@/hooks/useAdminAction';
import { truncateAddress } from '@/lib/format';
import { isValidStacksPrincipal } from '@/lib/validation';
import { Cl } from '@stacks/transactions';
import { toast } from 'sonner';
import { Copy, Loader2 } from 'lucide-react';

export function StrategistCard({ loading }: { loading?: boolean }) {
  const { data: vaultInfo, isLoading } = useVaultInfo();
  const { execute, submitting } = useAdminAction();
  const [newAddr, setNewAddr] = useState('');

  const strategistAddress = vaultInfo?.strategist ?? '';
  const isDataLoading = loading || isLoading;

  const hasInput = newAddr.trim().length > 0;
  const isValid = isValidStacksPrincipal(newAddr);
  const hasError = hasInput && !isValid;

  const handleCopy = () => {
    navigator.clipboard.writeText(strategistAddress);
    toast.success('Address copied');
  };

  const handleUpdate = () => {
    execute(
      'set-strategist',
      [Cl.principal(newAddr)],
      'Strategist updated',
    );
    setNewAddr('');
  };

  return (
    <Card className="border-border bg-card" aria-busy={isDataLoading}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Strategist
        </CardTitle>
      </CardHeader>