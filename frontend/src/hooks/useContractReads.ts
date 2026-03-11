import { useQuery } from '@tanstack/react-query';
import {
  getVaultInfo,
  getSharesOf,
  getAssetPerShare,
  getDepositOf,
  getSbtcBalance,
  type VaultInfo,
} from '@/lib/stacks';

const POLL_INTERVAL = 15_000; // 15 seconds

/**
 * Fetch vault info (total assets, shares, cap, paused, strategist).
 */
export function useVaultInfo() {
  return useQuery<VaultInfo>({
    queryKey: ['vault-info'],
    queryFn: getVaultInfo,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}

/**
 * Fetch aBTC shares balance for a connected address.
 */
export function useSharesOf(address: string | null) {
  return useQuery<bigint>({
    queryKey: ['shares-of', address],
    queryFn: () => getSharesOf(address!),
    enabled: !!address,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}

/**
 * Fetch the sBTC value of a given number of shares.
 */
export function useAssetPerShare(shares: bigint | undefined) {
  return useQuery<bigint>({
    queryKey: ['asset-per-share', shares?.toString()],
    queryFn: () => getAssetPerShare(shares!),
    enabled: shares !== undefined && shares > 0n,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}

/**
 * Fetch original deposit amount for an address.
 */
export function useDepositOf(address: string | null) {
  return useQuery<bigint>({
    queryKey: ['deposit-of', address],
    queryFn: () => getDepositOf(address!),
    enabled: !!address,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}

/**
 * Fetch sBTC balance for the connected address.
 */
export function useSbtcBalance(address: string | null) {
  return useQuery<bigint>({
    queryKey: ['sbtc-balance', address],
    queryFn: () => getSbtcBalance(address!),
    enabled: !!address,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}
