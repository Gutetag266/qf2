// services/scannerEngine.ts
import { MarketTicker, QuantScoreResult, AssetClass } from '../types/quantforge';
import { QuantAnalyticsEngine } from './quantEngine';
import { MockMarketDataProvider } from './marketData';

export interface ScanFilterParams {
  assetClasses?: AssetClass[];
  minExpectedReturn?: number;
  minSharpeRatio?: number;
  maxVolatility?: number;
  minScore?: number;
}

export interface ScannedOpportunity {
  rank: number;
  ticker: MarketTicker;
  scoreResult: QuantScoreResult;
  expectedReturnPercent: number;
  sharpeRatio: number;
  volatilityPercent: number;
}

export class MarketScannerEngine {
  private dataProvider: MockMarketDataProvider;

  constructor(dataProvider: MockMarketDataProvider) {
    this.dataProvider = dataProvider;
  }

  public async scan(filters: ScanFilterParams): Promise<ScannedOpportunity[]> {
    const tickers = await this.dataProvider.getTickers();
    const opportunities: ScannedOpportunity[] = [];

    for (const ticker of tickers) {
      if (filters.assetClasses && filters.assetClasses.length > 0) {
        if (!filters.assetClasses.includes(ticker.assetClass)) continue;
      }

      const candles = await this.dataProvider.getCandles(ticker.symbol, '1h', 100);
      const scoreResult = QuantAnalyticsEngine.calculateQuantScore(candles);
      scoreResult.symbol = ticker.symbol;

      const riskMetrics = QuantAnalyticsEngine.computeRiskMetrics(candles);

      if (filters.minScore !== undefined && scoreResult.totalScore < filters.minScore) continue;
      if (filters.minSharpeRatio !== undefined && riskMetrics.sharpeRatio < filters.minSharpeRatio) continue;
      if (filters.maxVolatility !== undefined && riskMetrics.volatilityAnnualized > filters.maxVolatility) continue;
      if (filters.minExpectedReturn !== undefined && riskMetrics.expectedReturn < filters.minExpectedReturn) continue;

      opportunities.push({
        rank: 0,
        ticker,
        scoreResult,
        expectedReturnPercent: riskMetrics.expectedReturn,
        sharpeRatio: riskMetrics.sharpeRatio,
        volatilityPercent: riskMetrics.volatilityAnnualized
      });
    }

    // Sortowanie po najwyższym Quant Score
    opportunities.sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

    // Nadanie rangi
    return opportunities.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }
}
