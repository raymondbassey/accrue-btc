import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from './ConfirmDialog';
import { MOCK_ADMIN } from '@/lib/mock-data';
import { truncateAddress } from '@/lib/format';
import { isValidStacksPrincipal } from '@/lib/validation';
import { toast } from 'sonner';
import { Copy, Loader2 } from 'lucide-react';

export function StrategistCard({ loading }: { loading?: boolean }) {
  const [newAddr, setNewAddr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasInput = newAddr.trim().length > 0;
  const isValid = isValidStacksPrincipal(newAddr);
  const hasError = hasInput && !isValid;

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_ADMIN.strategistAddress);
    toast.success('Address copied');
  };

  const handleUpdate = () => {
    setSubmitting(true);
    const toastId = toast.loading('Waiting for wallet…');
    setTimeout(() => {
      setSubmitting(false);
      setNewAddr('');
      toast.success('Strategist updated', { id: toastId });
    }, 1500);
  };

  return (
    <Card className="border-border bg-card" aria-busy={loading}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Strategist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded border border-border bg-background px-3 py-2 font-mono-financial text-xs text-foreground">
                {truncateAddress(MOCK_ADMIN.strategistAddress, 8)}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0" aria-label="Copy strategist address">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="New strategist address"
                  value={newAddr}
                  onChange={e => setNewAddr(e.target.value)}
                  className={`font-mono-financial text-xs ${hasError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-label="New strategist address"
                  aria-invalid={hasError}
                />
                <ConfirmDialog
                  trigger={
                    <Button size="sm" disabled={!isValid || submitting} aria-busy={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                    </Button>
                  }
                  title="Update Strategist?"
                  description={`Change the vault strategist to ${truncateAddress(newAddr || '', 6)}?`}
                  confirmLabel="Update Strategist"
                  loading={submitting}
                  onConfirm={handleUpdate}
                  disabled={!isValid}
                />
              </div>
              {hasError && (
                <p className="mt-1 text-xs text-destructive">Invalid Stacks address</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
