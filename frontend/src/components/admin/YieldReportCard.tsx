import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { sanitizeBTCInput } from '@/lib/format';
import { isValidBTCAmount } from '@/lib/validation';
import { toMicroUnits } from '@/lib/contracts';
import { useAdminAction } from '@/hooks/useAdminAction';
import { Cl } from '@stacks/transactions';
import { Loader2 } from 'lucide-react';

export function YieldReportCard({ loading }: { loading?: boolean }) {
  const [amount, setAmount] = useState('');
  const { execute, submitting } = useAdminAction();

  const validation = amount ? isValidBTCAmount(amount) : { valid: false };
  const hasError = amount && !validation.valid && validation.error;