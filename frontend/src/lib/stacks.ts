import { fetchCallReadOnlyFunction, cvToValue, Cl, type ClarityValue } from '@stacks/transactions';

// Network config
export const NETWORK = 'testnet' as const;
export const API_BASE = 'https://api.testnet.hiro.so';

export const DEPLOYER = 'ST16CJZJAT68A6Y2XG0AEFA7C311KDPBW2ZEFTYAP';
export const VAULT_NAME = 'accrue-vault';
export const TOKEN_NAME = 'vault-token';
export const SBTC_ADDRESS = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
export const SBTC_NAME = 'sbtc-token';

// A dummy sender for read-only calls (any valid address works)
const READ_SENDER = DEPLOYER;

/**
 * Generic read-only call helper using @stacks/transactions.
 */
async function callReadOnly(
  contractAddress: string,
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[] = [],
): Promise<unknown> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderAddress: READ_SENDER,
    network: NETWORK,
  });
  return cvToValue(result, true);
}

// --- Vault read-only calls ---

export interface VaultInfo {
  'total-assets': bigint;
  'total-shares': bigint;
  'deposit-cap': bigint;
  paused: boolean;
  strategist: string;
}

/**
 * cvToValue(cv, true) in @stacks/transactions v7 returns nested
 * { type, value } wrappers.  This helper unwraps a single field.
 */
function unwrap(field: unknown): unknown {
  if (field && typeof field === 'object' && 'value' in (field as Record<string, unknown>)) {
    return (field as { value: unknown }).value;
  }
  return field;
}

export async function getVaultInfo(): Promise<VaultInfo> {
  const result = await callReadOnly(DEPLOYER, VAULT_NAME, 'get-vault-info');
  // cvToValue returns { type: "(tuple ...)", value: { field: { type, value }, ... } }
  const tuple = (result as { value: Record<string, unknown> }).value;
  return {
    'total-assets': BigInt(unwrap(tuple['total-assets']) as string | bigint),
    'total-shares': BigInt(unwrap(tuple['total-shares']) as string | bigint),
    'deposit-cap': BigInt(unwrap(tuple['deposit-cap']) as string | bigint),
    paused: unwrap(tuple.paused) as boolean,
    strategist: String(unwrap(tuple.strategist) ?? ''),
  };
}

export async function getTotalAssets(): Promise<bigint> {
  const result = await callReadOnly(DEPLOYER, VAULT_NAME, 'get-total-assets');
  return (result as { value: bigint }).value;
}

export async function getSharesOf(who: string): Promise<bigint> {
  const result = await callReadOnly(DEPLOYER, VAULT_NAME, 'get-shares-of', [
    Cl.principal(who),
  ]);
  // get-shares-of returns (ok uint) 
  return (result as { value: bigint }).value;
}

export async function getAssetPerShare(shares: bigint): Promise<bigint> {
  const result = await callReadOnly(DEPLOYER, VAULT_NAME, 'get-asset-per-share', [
    Cl.uint(shares),
  ]);
  return (result as { value: bigint }).value;
}

export async function getDepositOf(who: string): Promise<bigint> {
  const result = await callReadOnly(DEPLOYER, VAULT_NAME, 'get-deposit-of', [
    Cl.principal(who),
  ]);
  return (result as { value: bigint }).value;
}

export async function getSbtcBalance(who: string): Promise<bigint> {
  const result = await callReadOnly(SBTC_ADDRESS, SBTC_NAME, 'get-balance', [
    Cl.principal(who),
  ]);
  return (result as { value: bigint }).value;
}

// --- Transaction status polling ---

export type TxStatusResult =
  | { status: 'pending' }
  | { status: 'success'; txId: string }
  | { status: 'abort_by_response'; error: string; txId: string }
  | { status: 'abort_by_post_condition'; txId: string };

export async function fetchTxStatus(txId: string): Promise<TxStatusResult> {
  const res = await fetch(`${API_BASE}/extended/v1/tx/${txId}`);
  if (!res.ok) {
    return { status: 'pending' };
  }
  const data = await res.json();
  const txStatus = data.tx_status;
  if (txStatus === 'success') {
    return { status: 'success', txId };
  }
  if (txStatus === 'abort_by_response') {
    return {
      status: 'abort_by_response',
      error: data.tx_result?.repr ?? 'Transaction aborted',
      txId,
    };
  }
  if (txStatus === 'abort_by_post_condition') {
    return { status: 'abort_by_post_condition', txId };
  }
  // pending / unknown
  return { status: 'pending' };
}
