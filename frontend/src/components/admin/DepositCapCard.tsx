import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { useVaultInfo } from '@/hooks/useContractReads';
import { useAdminAction } from '@/hooks/useAdminAction';
import { fromMicroUnits, toMicroUnits } from '@/lib/contracts';
import { formatBTC, sanitizeBTCInput } from '@/lib/format';
import { isValidBTCAmount } from '@/lib/validation';
import { Cl } from '@stacks/transactions';
import { Loader2 } from 'lucide-react';

export function DepositCapCard({ loading }: { loading?: boolean }) {
  const { data: vaultInfo, isLoading } = useVaultInfo();
  const { execute, submitting } = useAdminAction();
  const [newCap, setNewCap] = useState('');

  const currentCap = vaultInfo ? fromMicroUnits(Number(vaultInfo['deposit-cap'])) : 0;
  const currentUsed = vaultInfo ? fromMicroUnits(Number(vaultInfo['total-assets'])) : 0;
  const capPercent = currentCap > 0 ? (currentUsed / currentCap) * 100 : 0;
  const isDataLoading = loading || isLoading;