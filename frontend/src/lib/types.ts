export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  shares: number;
  txHash: string;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface HistoricalDataPoint {
  date: string;
  tvl: number;
  apy: number;
  deposits: number;
  cumDeposits: number;
  sharePrice: number;
}
