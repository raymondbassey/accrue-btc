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