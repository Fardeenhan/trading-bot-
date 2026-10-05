export type TimeFrame = "1s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type ChartType = "candlestick" | "area" | "heikin_ashi" | "bars";

export interface CandleData {
  time: number; // UTC timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type SignalType = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";

export interface TradingSignal {
  id: string;
  symbol: string;
  type: SignalType;
  timeframe: TimeFrame;
  price: number;
  tp1: number;
  tp2: number;
  sl: number;
  riskReward: string;
  winRate: number;
  confidence: number;
  timestamp: number;
  reasons: string[];
  status: "ACTIVE" | "HIT_TP1" | "HIT_TP2" | "HIT_SL";
  pnlPercent?: number;
  // Zero-Loss & Capital Preservation Protocol
  confluenceGrade?: string;
  marketStructure?: string;
  breakEvenRule?: string;
  lossPreventionRules?: string[];
  hindiGuidance?: string;
  isSureShot?: boolean;
  confluenceScore?: number; // e.g. 5 for 5/5 confluence
  zeroLossBreakEvenPrice?: number;
  sureShotChecks?: { name: string; passed: boolean; note: string }[];
  multiTfConfirmation?: {
    tf15m: "BULLISH" | "BEARISH" | "NEUTRAL";
    tf1h: "BULLISH" | "BEARISH" | "NEUTRAL";
    tf4h: "BULLISH" | "BEARISH" | "NEUTRAL";
  };
  // Anti-Trap & Smart Money Defense System
  trapStatus?: "SAFE" | "BULL_TRAP_DETECTED" | "BEAR_TRAP_DETECTED" | "CHOP_TRAP";
  trapWarning?: string;
  trapDetails?: {
    trapName: string;
    trapSeverity: "HIGH" | "MEDIUM" | "EXTREME";
    retailMistake: string;
    institutionalAction: string;
    protectionRule: string;
  };
}

export interface IndicatorSettings {
  showEma20: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showBollingerBands: boolean;
  showRsi: boolean;
  showMacd: boolean;
  showSuperTrend: boolean;
  showVolume: boolean;
}

export interface TickerInfo {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  baseAsset: string;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: string;
}

export interface LossPreventionProtocol {
  breakEvenRule: string;
  capitalRule: string;
  invalidationZone: string;
  confluenceGrade: string;
}

export interface AiSignalAnalysis {
  signal: SignalType;
  confidenceScore: number;
  trendOutlook: string;
  entryTarget: number;
  takeProfit1: number;
  takeProfit2: number;
  stopLoss: number;
  riskRewardRatio: string;
  indicatorConfluence: string[];
  institutionalThesis: string;
  lossPreventionProtocol?: LossPreventionProtocol;
  hindiGuidance?: string;
}
