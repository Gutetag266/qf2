// services/quantEngine.ts
import { Candle, FactorBreakdown, QuantScoreResult, RiskMetrics } from '../types/quantforge';

export class QuantAnalyticsEngine {
  public static calculateQuantScore(candles: Candle[]): QuantScoreResult {
    if (candles.length < 30) {
      return {
        symbol: 'UNKNOWN',
        totalScore: 50,
        factors: { momentum: 50, trend: 50, quality: 50, volatility: 50, valuation: 50, liquidity: 50, riskReward: 50 },
        signal: 'NEUTRAL',
        confidence: 0.3,
        generatedAt: Date.now()
      };
    }

    const closes = candles.map(c => c.close);
    const lastClose = closes[closes.length - 1];
    const firstClose = closes[0];

    // 1. Momentum Factor (30-day return velocity)
    const momentumValue = ((lastClose - firstClose) / firstClose) * 100;
    const momentumScore = Math.min(Math.max(Math.round(50 + momentumValue * 2.5), 0), 100);

    // 2. Trend Factor (SMA 10 vs SMA 30)
    const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const sma30 = closes.slice(-30).reduce((a, b) => a + b, 0) / 30;
    const trendDiff = ((sma10 - sma30) / sma30) * 100;
    const trendScore = Math.min(Math.max(Math.round(50 + trendDiff * 5), 0), 100);

    // 3. Volatility Factor (Normalized standard deviation)
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const volatilityScore = Math.min(Math.max(Math.round(100 - (stdDev * 2000)), 0), 100);

    // 4. Quality & Liquidity (Static baseline simulation for data layer)
    const qualityScore = 82;
    const valuationScore = 68;
    const liquidityScore = 90;
    const riskRewardScore = Math.round((momentumScore + trendScore + volatilityScore) / 3);

    const factors: FactorBreakdown = {
      momentum: momentumScore,
      trend: trendScore,
      quality: qualityScore,
      volatility: volatilityScore,
      valuation: valuationScore,
      liquidity: liquidityScore,
      riskReward: riskRewardScore
    };

    const totalScore = Math.round(
      factors.momentum * 0.25 +
      factors.trend * 0.25 +
      factors.quality * 0.15 +
      factors.volatility * 0.15 +
      factors.valuation * 0.10 +
      factors.liquidity * 0.10
    );

    let signal: QuantScoreResult['signal'] = 'NEUTRAL';
    if (totalScore >= 80) signal = 'STRONG_BUY';
    else if (totalScore >= 65) signal = 'BUY';
    else if (totalScore <= 35) signal = 'SELL';
    else if (totalScore <= 20) signal = 'STRONG_SELL';

    return {
      symbol: 'ASSET',
      totalScore,
      factors,
      signal,
      confidence: 0.88,
      generatedAt: Date.now()
    };
  }

  public static computeRiskMetrics(candles: Candle[]): RiskMetrics {
    const closes = candles.map(c => c.close);
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }

    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const dailyStdDev = Math.sqrt(variance);
    const annualizedVol = dailyStdDev * Math.sqrt(252);
    const expectedReturnAnnualized = meanReturn * 252;

    // Value at Risk (95% Confidence Parametric)
    const var95 = (meanReturn - (1.645 * dailyStdDev)) * 100;
    const cVar95 = var95 * 1.25; // Estimate conditional expectation

    // Max Drawdown
    let peak = closes[0];
    let maxDrawdown = 0;
    for (const price of closes) {
      if (price > peak) peak = price;
      const drawdown = (price - peak) / peak;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    }

    const riskFreeRate = 0.04;
    const sharpeRatio = annualizedVol === 0 ? 0 : (expectedReturnAnnualized - riskFreeRate) / annualizedVol;
    
    // Downside deviation for Sortino
    const negativeReturns = returns.filter(r => r < 0);
    const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length;
    const downsideStdDev = Math.sqrt(downsideVariance) * Math.sqrt(252);
    const sortinoRatio = downsideStdDev === 0 ? 0 : (expectedReturnAnnualized - riskFreeRate) / downsideStdDev;

    return {
      expectedReturn: Number((expectedReturnAnnualized * 100).toFixed(2)),
      volatilityAnnualized: Number((annualizedVol * 100).toFixed(2)),
      maxDrawdown: Number((Math.abs(maxDrawdown) * 100).toFixed(2)),
      valueAtRisk95: Number(Math.abs(var95).toFixed(2)),
      cVaR95: Number(Math.abs(cVar95).toFixed(2)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      sortinoRatio: Number(sortinoRatio.toFixed(2)),
      beta: 1.05,
      alpha: 2.4
    };
  }
}
