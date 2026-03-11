// Contract addresses (Stacks Testnet)
export const CONTRACTS = {
  VAULT: 'ST16CJZJAT68A6Y2XG0AEFA7C311KDPBW2ZEFTYAP.accrue-vault',
  TOKEN: 'ST16CJZJAT68A6Y2XG0AEFA7C311KDPBW2ZEFTYAP.vault-token',
  SBTC: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token',
} as const;

const MICRO_UNITS = 100_000_000;

/** Convert a display-unit number (e.g. 1.5) to micro-units (150000000). */
export function toMicroUnits(display: number): number {
  return Math.round(display * MICRO_UNITS);
}

/** Convert micro-units back to display units. */
export function fromMicroUnits(micro: number): number {
  return micro / MICRO_UNITS;
}

/** Build a Hiro Explorer URL for a testnet transaction. */
export function buildExplorerUrl(txId: string): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=testnet`;
}

/** Human-readable error messages for vault contract error codes. */
export const ERROR_CODES: Record<number, string> = {
  200: 'Not authorized',
  201: 'Amount must be greater than zero',
  202: 'Insufficient shares',
  203: 'Insufficient assets in vault',
  204: 'Vault is currently paused',
  205: 'Deposit cap exceeded',
  206: 'Token transfer failed',
};

/** Map a contract error code to a readable message. */
export function getErrorMessage(code: number): string {
  return ERROR_CODES[code] ?? `Unknown error (u${code})`;
}
