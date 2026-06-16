export type EmotionType = 
  | 'Disciplined'
  | 'Calm'
  | 'Confident'
  | 'Fearful'
  | 'Greedy'
  | 'Revenge'
  | 'FOMO'
  | 'Impatient';

export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  risk: number;
  pl: number;
  emotion: EmotionType | string;
  date: string; // ISO date string or YYYY-MM-DD
  notes?: string;
}

export interface TradingStats {
  totalPL: number;
  totalTrades: number;
  winRate: number; // percentage (0 to 100)
  winningCount: number;
  losingCount: number;
  breakEvenCount: number;
  totalWinsPL: number; // sum of positive PL
  totalLossesPL: number; // sum of negative PL
  averageRisk: number;
  averagePL: number;
}
