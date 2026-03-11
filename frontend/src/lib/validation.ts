/**
 * Validate a Stacks principal address.
 * Must start with ST (testnet) or SP (mainnet) and be 41+ characters.
 */
export function isValidStacksPrincipal(addr: string): boolean {
  if (!addr) return false;
  const trimmed = addr.trim();
  if (!/^(ST|SP)[A-Z0-9]{39,}/i.test(trimmed)) return false;
  // Allow contract principals (addr.contract-name)
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length !== 2 || parts[1].length === 0) return false;
  }
  return true;
}

/**
 * Validate a BTC amount string.
 * Must be > 0, numeric, max 8 decimal places.
 */
export function isValidBTCAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { valid: false };
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number' };
  }
  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  const parts = amount.split('.');
  if (parts.length === 2 && parts[1].length > 8) {
    return { valid: false, error: 'Maximum 8 decimal places allowed' };
  }

  return { valid: true };
}
