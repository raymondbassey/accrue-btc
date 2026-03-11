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

  const handleSubmit = () => {
    const microAmount = toMicroUnits(parseFloat(amount));
    execute('report-yield', [Cl.uint(microAmount)], `${amount} sBTC yield reported`);
    setAmount('');
  };

  return (
    <Card className="border-border bg-card" aria-busy={loading}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Report Yield
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Report earned yield to update the vault share price. Only the strategist can perform this action.
            </p>
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="Yield amount (sBTC)"
                  value={amount}
                  onChange={e => setAmount(sanitizeBTCInput(e.target.value))}
                  className={`text-right font-mono-financial text-sm ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-label="Yield amount"
                  aria-invalid={!!hasError}
                />
                <ConfirmDialog
                  trigger={
                    <Button size="sm" disabled={!validation.valid || submitting} aria-busy={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Report'}
                    </Button>
                  }
                  title="Report Yield?"
                  description={`Report ${amount} sBTC yield to the vault? This will update the share price.`}
                  confirmLabel="Report Yield"
                  loading={submitting}
                  onConfirm={handleSubmit}
                  disabled={!validation.valid}
                />
              </div>
              {hasError && (
                <p className="mt-1 text-xs text-destructive">{validation.error}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
