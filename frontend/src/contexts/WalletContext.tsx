import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  connect as stacksConnect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
} from '@stacks/connect';
import { DEPLOYER } from '@/lib/stacks';
import { useVaultInfo } from '@/hooks/useContractReads';

interface WalletState {
  connected: boolean;
  address: string | null;
  network: 'testnet' | 'mainnet';
  isOwner: boolean;
  isStrategist: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'testnet',
    isOwner: false,
    isStrategist: false,
  });

  const { data: vaultInfo } = useVaultInfo();

  // Derive isOwner / isStrategist from on-chain vault info
  useEffect(() => {
    if (!state.address || !vaultInfo) return;
    setState(prev => ({
      ...prev,
      isOwner: prev.address === DEPLOYER,
      isStrategist:
        prev.address === DEPLOYER ||
        prev.address === vaultInfo.strategist,
    }));
  }, [state.address, vaultInfo]);

  // Restore session on mount — only if both wallet reports connected AND we have a stored address
  useEffect(() => {
    const stored = sessionStorage.getItem('stx_address');
    if (stacksIsConnected() && stored) {
      setState(prev => ({ ...prev, connected: true, address: stored }));
    } else {
      sessionStorage.removeItem('stx_address');
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      const response = await stacksConnect({ network: 'testnet' });
      // response.addresses contains STX and BTC addresses
      const stxAddr = response.addresses.find(
        (a: { symbol: string }) => a.symbol === 'STX',
      );
      const address = stxAddr?.address ?? null;
      if (address) {
        sessionStorage.setItem('stx_address', address);
      }
      setState(prev => ({
        ...prev,
        connected: true,
        address,
      }));
    } catch {
      // User cancelled popup or wallet extension not available
    }
  }, []);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    sessionStorage.removeItem('stx_address');
    setState({
      connected: false,
      address: null,
      network: 'testnet',
      isOwner: false,
      isStrategist: false,
    });
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
