import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { MOCK_VAULT } from '@/lib/mock-data';
import { formatBTC, sanitizeBTCInput } from '@/lib/format';
import { isValidBTCAmount } from '@/lib/validation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function DepositCapCard({ loading }: { loading?: boolean }) {
  const [newCap, setNewCap] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const capPercent = (MOCK_VAULT.depositCapUsed / MOCK_VAULT.depositCap) * 100;

  const validation = newCap ? isValidBTCAmount(newCap) : { valid: false };
  const capTooLow = validation.valid && parseFloat(newCap) < MOCK_VAULT.depositCapUsed;
  const hasError = (newCap && !validation.valid && validation.error) || capTooLow;
  const errorMessage = capTooLow
    ? `Cap must be ≥ current usage (${formatBTC(MOCK_VAULT.depositCapUsed)})`
    : validation.error;
  const canSubmit = validation.valid && !capTooLow;

  const handleUpdate = () => {
    setSubmitting(true);
    const toastId = toast.loading('Waiting for wallet…');
    setTimeout(() => {
      setSubmitting(false);
      setNewCap('');
      toast.success('Deposit cap updated', { id: toastId });
    }, 1500);
  };

  return (
    <Card className="border-border bg-card" aria-busy={loading}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Deposit Cap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <div>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
              <Skeleton className="mt-1 h-3 w-40" />
            </div>
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <div>
              <p className="font-mono-financial text-xl font-semibold text-foreground">
                {formatBTC(MOCK_VAULT.depositCap)}
              </p>
              <Progress value={capPercent} className="mt-2 h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                {formatBTC(MOCK_VAULT.depositCapUsed)} used · {capPercent.toFixed(1)}% utilized
              </p>
            </div>
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="New cap (sBTC)"
                  value={newCap}
                  onChange={e => setNewCap(sanitizeBTCInput(e.target.value))}
                  className={`text-right font-mono-financial text-sm ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-label="New deposit cap"
                  aria-invalid={!!hasError}
                />
                <ConfirmDialog
                  trigger={
                    <Button size="sm" disabled={!canSubmit || submitting} aria-busy={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                    </Button>
                  }
                  title="Update Deposit Cap?"
                  description={`Set the new deposit cap to ${formatBTC(parseFloat(newCap) || 0)}?`}
                  confirmLabel="Update Cap"
                  loading={submitting}
                  onConfirm={handleUpdate}
                  disabled={!canSubmit}
                />
              </div>
              {hasError && (
                <p className="mt-1 text-xs text-destructive">{errorMessage}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
