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

// --- Transaction history ---

export interface HiroTx {
  tx_id: string;
  tx_status: string;
  block_time_iso: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args?: { repr: string; name: string }[];
  };
}

export interface TxHistoryItem {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  shares: number;
  txHash: string;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
}

/**
 * Fetch on-chain transaction history for a user address,
 * filtered to vault contract deposit/withdraw calls.
 */
export async function fetchTxHistory(
  userAddress: string,
  limit = 20,
): Promise<TxHistoryItem[]> {
  const vaultContract = `${DEPLOYER}.${VAULT_NAME}`;
  const url = `${API_BASE}/extended/v1/address/${encodeURIComponent(userAddress)}/transactions_with_transfers?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results: { tx: HiroTx; ft_transfers?: { amount: string; asset_identifier: string }[] }[] =
    data.results ?? [];

  const items: TxHistoryItem[] = [];

  for (const entry of results) {
    const { tx, ft_transfers = [] } = entry;
    const cc = tx.contract_call;
    if (!cc || cc.contract_id !== vaultContract) continue;

    const fn = cc.function_name;
    if (fn !== 'deposit' && fn !== 'withdraw') continue;

    // Extract amount from the first function arg (u<amount>)
    const rawArg = cc.function_args?.[0]?.repr ?? '';
    const argMatch = rawArg.match(/^u(\d+)$/);
    const microAmount = argMatch ? Number(argMatch[1]) : 0;
    const amount = microAmount / 1e8;

    // Estimate shares from ft_transfers of vault-token
    const shareTransfer = ft_transfers.find((t) =>
      t.asset_identifier.includes(`${TOKEN_NAME}::accrueBTC`),
    );
    const shares = shareTransfer ? Number(shareTransfer.amount) / 1e8 : amount;

    const status: TxHistoryItem['status'] =
      tx.tx_status === 'success'
        ? 'confirmed'
        : tx.tx_status === 'pending'
          ? 'pending'
          : 'failed';

    items.push({
      id: tx.tx_id,
      type: fn as 'deposit' | 'withdraw',
      amount,
      shares,
      txHash: `${tx.tx_id.slice(0, 6)}…${tx.tx_id.slice(-4)}`,
      timestamp: new Date(tx.block_time_iso),
      status,
    });
  }

  return items;
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
