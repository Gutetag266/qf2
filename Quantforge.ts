// types/quantforge.ts

export type AssetClass = 
  | 'EQUITY' 
  | 'ETF' 
  | 'INDEX' 
  | 'FOREX' 
  | 'CRYPTO' 
  | 'COMMODITY' 
  | 'BOND' 
  | 'FUTURES';

export type ConnectionStatus = 'LIVE' | 'DELAYED' | 'OFFLINE';

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  status: ConnectionStatus;
  lastUpdated: number;
  history: number[];
}

export interface FactorBreakdown {
  momentum: number;    // 0-100
  trend: number;       // 0-100
  quality: number;     // 0-100
  volatility: number;  // 0-100
  valuation: number;   // 0-100
  liquidity: number;   // 0-100
  riskReward: number;  // 0-100
}

export interface QuantScoreResult {
  symbol: string;
  totalScore: number; // 0-100
  factors: FactorBreakdown;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0.0 - 1.0
  generatedAt: number;
}

export interface RiskMetrics {
  expectedReturn: number;
  volatilityAnnualized: number;
  maxDrawdown: number;
  valueAtRisk95: number;    // VaR 95%
  cVaR95: number;           // Conditional VaR
  sharpeRatio: number;
  sortinoRatio: number;
  beta: number;
  alpha: number;
}

export type ConditionOperator = '>' | '<' | '>=' | '<=' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';

export interface StrategyCondition {
  id: string;
  indicator: 'RSI' | 'PRICE' | 'EMA' | 'SMA' | 'VOLUME' | 'ATR';
  indicatorPeriod?: number;
  operator: ConditionOperator;
  targetValue: number | 'EMA_200' | 'AVG_VOLUME';
}

export interface QuantStrategy {
  id: string;
  name: string;
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  entryConditions: StrategyCondition[];
  exitConditions: StrategyCondition[];
  stopLossATRMultiplier: number;
  takeProfitATRMultiplier: number;
  riskPerTradePercent: number;
  maxPositions: number;
}

export interface BacktestTrade {
  id: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  entryTimestamp: number;
  exitTimestamp: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_EXIT';
}

export interface BacktestResult {
  strategyId: string;
  initialCapital: number;
  finalEquity: number;
  totalReturnPercent: number;
  cagr: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  winRatePercent: number;
  profitFactor: number;
  totalTrades: number;
  averageTradePercent: number;
  bestTradePercent: number;
  worstTradePercent: number;
  equityCurve: { timestamp: number; equity: number; drawdown: number }[];
  trades: BacktestTrade[];
}

export interface PortfolioPosition {
  symbol: string;
  assetClass: AssetClass;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weightPercent: number;
}

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  price?: number;
  stopPrice?: number;
  isPaperTrading: boolean;
}
