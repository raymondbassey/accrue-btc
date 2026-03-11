import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletState {
  connected: boolean;
  address: string | null;
  network: 'testnet' | 'mainnet';
  isOwner: boolean;
  isStrategist: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

const MOCK_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'testnet',
    isOwner: true,
    isStrategist: true,
  });

  const connect = useCallback(() => {
    setState(prev => ({ ...prev, connected: true, address: MOCK_ADDRESS }));
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({ ...prev, connected: false, address: null }));
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
