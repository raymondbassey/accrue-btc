import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VaultStatusCard } from '@/components/admin/VaultStatusCard';
import { DepositCapCard } from '@/components/admin/DepositCapCard';
import { StrategistCard } from '@/components/admin/StrategistCard';
import { YieldReportCard } from '@/components/admin/YieldReportCard';

const Admin = () => {
  const { connected, isOwner, isStrategist } = useWallet();
  const [loading] = useState(false);

  if (!connected || (!isOwner && !isStrategist)) {
    return (
      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24">
        <div className="rounded-full border-2 border-dashed border-border p-4 mb-4">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {!connected
            ? 'Connect your wallet to access the admin panel.'
            : 'Only the vault owner or strategist can access this panel.'}
        </p>
        <Button variant="outline" size="sm" asChild className="mt-6 gap-2">
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Go to Vault
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 opacity-0 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage vault configuration and operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isOwner && <div className="opacity-0 animate-fade-in-up anim-stagger-1"><VaultStatusCard loading={loading} /></div>}
        {isOwner && <div className="opacity-0 animate-fade-in-up anim-stagger-2"><DepositCapCard loading={loading} /></div>}
        {isOwner && <div className="opacity-0 animate-fade-in-up anim-stagger-3"><StrategistCard loading={loading} /></div>}
        {isStrategist && <div className="opacity-0 animate-fade-in-up anim-stagger-4"><YieldReportCard loading={loading} /></div>}
      </div>
    </main>
  );
};

export default Admin;
