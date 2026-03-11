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

  return (
    <Card className="border-border bg-card" aria-busy={isDataLoading}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Vault Status
        </CardTitle>
        {isDataLoading ? (
          <Skeleton className="h-5 w-16" />
        ) : (
          <Badge
            variant="outline"
            className={
              paused
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-success/30 bg-success/10 text-success'
            }
          >
            {paused ? 'Paused' : 'Active'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isDataLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {paused
                ? 'Vault is paused. All deposits and withdrawals are disabled.'
                : 'Vault is active and accepting deposits and withdrawals.'}
            </p>
            <ConfirmDialog
              trigger={
                <Button
                  variant={paused ? 'default' : 'destructive'}
                  size="sm"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : paused ? (
                    <Play className="mr-2 h-4 w-4" />
                  ) : (
                    <Pause className="mr-2 h-4 w-4" />
                  )}
                  {paused ? 'Activate Vault' : 'Pause Vault'}
                </Button>
              }
              title={paused ? 'Activate Vault?' : 'Pause Vault?'}
              description={
                paused
                  ? 'This will re-enable deposits and withdrawals for all users.'
                  : 'Are you sure? All deposits and withdrawals will be disabled while the vault is paused.'
              }
              confirmLabel={paused ? 'Activate' : 'Pause Vault'}
              variant={paused ? 'default' : 'destructive'}
              loading={submitting}
              onConfirm={toggle}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
