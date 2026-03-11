export function formatBTC(value: number, decimals = 8): string {
  return `₿${value.toFixed(decimals)}`;
}

export function formatShares(value: number, decimals = 8): string {
  return value.toFixed(decimals);
}

/** Format aBTC values (no ₿ prefix) */
export function formatABTC(value: number, decimals = 8): string {
  return value.toFixed(decimals);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Validate and filter numeric input for BTC/aBTC amounts.
 * Allows only digits and a single decimal point, max 8 decimal places.
 */
export function sanitizeBTCInput(value: string): string {
  // Remove anything that's not a digit or decimal point
  let sanitized = value.replace(/[^0-9.]/g, '');
  
  // Only allow one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Enforce max 8 decimal places
  if (parts.length === 2 && parts[1].length > 8) {
    sanitized = parts[0] + '.' + parts[1].slice(0, 8);
  }
  
  return sanitized;
}
