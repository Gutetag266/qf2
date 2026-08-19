// services/aiResearchEngine.ts
import { MarketTicker, QuantScoreResult, RiskMetrics } from '../types/quantforge';

export type MarketRegimeType = 'BULL_TREND' | 'BEAR_TREND' | 'SIDEWAYS_HIGH_VOL' | 'SIDEWAYS_LOW_VOL';

export interface MarketRegimeStatus {
  regime: MarketRegimeType;
  confidence: number;
  volatilityIndex: number;
  trendStrength: number;
}

export class QuantAIAssistant {
  public static detectMarketRegime(candles: any[]): MarketRegimeStatus {
    if (!candles || candles.length < 20) {
      return {
        regime: 'SIDEWAYS_LOW_VOL',
        confidence: 0.5,
        volatilityIndex: 12.5,
        trendStrength: 40
      };
    }

    const closes = candles.map(c => c.close);
    const first = closes[0];
    const last = closes[closes.length - 1];
    const changePct = ((last - first) / first) * 100;

    if (changePct > 5) {
      return { regime: 'BULL_TREND', confidence: 0.91, volatilityIndex: 14.2, trendStrength: 85 };
    } else if (changePct < -5) {
      return { regime: 'BEAR_TREND', confidence: 0.88, volatilityIndex: 28.4, trendStrength: 78 };
    } else {
      return { regime: 'SIDEWAYS_HIGH_VOL', confidence: 0.75, volatilityIndex: 22.1, trendStrength: 32 };
    }
  }

  public static answerUserQuery(
    query: string, 
    ticker?: MarketTicker, 
    score?: QuantScoreResult, 
    risk?: RiskMetrics
  ): string {
    const q = query.toLowerCase();

    if (!ticker || !score || !risk) {
      return "Insufficient data available to answer this query. Please select a valid market instrument.";
    }

    if (q.includes('score') || q.includes('dlaczego')) {
      return `Quant Score dla ${ticker.symbol} wynosi ${score.totalScore}/100. Wynika to z silnego wskaźnika Momentum (${score.factors.momentum}/100) oraz wskaźnika Trendu (${score.factors.trend}/100). Poziom zmienności oceniono na ${score.factors.volatility}/100.`;
    }

    if (q.includes('risk') || q.includes('ryzyko')) {
      return `Roczna zmienność aktywa wynosi ${risk.volatilityAnnualized}%. Szacowany 95% Value at Risk (VaR) wynosi -${risk.valueAtRisk95}%, przy wskaźniku Sharpe'a równym ${risk.sharpeRatio}.`;
    }

    return `Przeprowadziłem analizę quant dla ${ticker.symbol}. Główny sygnał modelu to: ${score.signal} przy pewności ${Math.round(score.confidence * 100)}%. Wskaźnik Sharpe'a wynosi ${risk.sharpeRatio}.`;
  }
}
