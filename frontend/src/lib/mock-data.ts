export const MOCK_VAULT = {
  totalAssets: 142.56781234,
  totalShares: 140.12345678,
  sharePrice: 1.01744892,
  depositCap: 500.0,
  depositCapUsed: 142.56781234,
  isPaused: false,
};

export const MOCK_POSITION = {
  abtcBalance: 24.50000000,
  currentValue: 24.92750268,
  originalDeposit: 24.50000000,
  yieldEarned: 0.42750268,
  yieldPercent: 1.74,
};

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  shares: number;
  txHash: string;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 10.00000000,
    shares: 9.82851234,
    txHash: '0x8f2a...e4b1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'deposit',
    amount: 14.50000000,
    shares: 14.67148766,
    txHash: '0x3c7d...a2f9',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'confirmed',
  },
  {
    id: '3',
    type: 'withdraw',
    amount: 5.00000000,
    shares: 4.91425617,
    txHash: '0x1e5b...c8d3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'confirmed',
  },
  {
    id: '4',
    type: 'deposit',
    amount: 5.00000000,
    shares: 4.91425617,
    txHash: '0x9a2c...f7e6',
    timestamp: new Date(Date.now() - 1000 * 30),
    status: 'pending',
  },
];

export const MOCK_ADMIN = {
  strategistAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
  owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
};

/** 7-day sparkline data for metric cards */
export const MOCK_SPARKLINE_ASSETS = [
  { v: 135.2 }, { v: 136.8 }, { v: 137.1 }, { v: 138.9 }, { v: 140.2 }, { v: 141.5 }, { v: 142.57 },
];

export const MOCK_SPARKLINE_PRICE = [
  { v: 1.0102 }, { v: 1.0118 }, { v: 1.0125 }, { v: 1.0141 }, { v: 1.0155 }, { v: 1.0168 }, { v: 1.0174 },
];

export interface HistoricalDataPoint {
  date: string;
  tvl: number;
  apy: number;
  deposits: number;
  cumDeposits: number;
  sharePrice: number;
}

/** 30-day historical data for the Stats dashboard */
export const MOCK_HISTORICAL_DATA: HistoricalDataPoint[] = (() => {
  const data: HistoricalDataPoint[] = [];
  let tvl = 88.0;
  let cumDeposits = 88.0;
  let sharePrice = 1.0;
  const baseApy = 1.62;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dailyDeposit = parseFloat((Math.random() * 4 + 0.5).toFixed(8));
    const dailyWithdraw = i > 5 ? parseFloat((Math.random() * 1.2).toFixed(8)) : 0;
    tvl = parseFloat((tvl + dailyDeposit - dailyWithdraw + Math.random() * 0.1).toFixed(8));
    cumDeposits = parseFloat((cumDeposits + dailyDeposit).toFixed(8));
    const apy = parseFloat((baseApy + (Math.random() - 0.3) * 0.4).toFixed(4));
    sharePrice = parseFloat((sharePrice + 0.0006 + (Math.random() - 0.3) * 0.0002).toFixed(8));
    data.push({ date: label, tvl, apy, deposits: dailyDeposit, cumDeposits, sharePrice });
  }
  return data;
})();
