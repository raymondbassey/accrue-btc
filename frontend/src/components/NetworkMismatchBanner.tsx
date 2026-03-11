import { AlertTriangle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

export function NetworkMismatchBanner() {
  const { connected, network } = useWallet();

  // Show banner if connected to mainnet (app expects testnet)
  if (!connected || network === 'testnet') return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2"
    >
      <AlertTriangle className="h-4 w-4 text-warning" />
      <p className="text-xs font-medium text-warning">
        Wrong network detected. Please switch to <strong>Testnet</strong> in your wallet.
      </p>
    </div>
  );
}
