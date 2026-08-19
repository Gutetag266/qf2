// services/portfolioOptimizer.ts
import { Candle } from '../types/quantforge';

export type OptimizationMethod = 'EQUAL_WEIGHT' | 'MIN_VOLATILITY' | 'MAX_SHARPE' | 'RISK_PARITY';

export interface AllocationResult {
  symbol: string;
  weightPercent: number;
  expectedVolatility: number;
}

export class PortfolioOptimizerEngine {
  public static optimize(
    assets: { symbol: string; candles: Candle[] }[],
    method: OptimizationMethod
  ): AllocationResult[] {
    if (assets.length === 0) return [];

    if (method === 'EQUAL_WEIGHT') {
      const equalWeight = Number((100 / assets.length).toFixed(2));
      return assets.map(asset => ({
        symbol: asset.symbol,
        weightPercent: equalWeight,
        expectedVolatility: 15.0
      }));
    }

    if (method === 'MIN_VOLATILITY' || method === 'RISK_PARITY') {
      // Obliczenie historycznej zmienności każdego aktywa
      const vols = assets.map(asset => {
        const closes = asset.candles.map(c => c.close);
        let sumReturns = 0;
        const returns: number[] = [];
        for (let i = 1; i < closes.length; i++) {
          const r = (closes[i] - closes[i - 1]) / closes[i - 1];
          returns.push(r);
          sumReturns += r;
        }
        const mean = sumReturns / returns.length;
        const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
        return { symbol: asset.symbol, vol: Math.sqrt(variance) * Math.sqrt(252) * 100 };
      });

      // Dla Risk Parity waga jest odwrotnie proporcjonalna do zmienności (Inverse Volatility Weighting)
      const invVolSum = vols.reduce((acc, v) => acc + (1 / (v.vol || 1)), 0);

      return vols.map(v => {
        const weight = ((1 / (v.vol || 1)) / invVolSum) * 100;
        return {
          symbol: v.symbol,
          weightPercent: Number(weight.toFixed(2)),
          expectedVolatility: Number(v.vol.toFixed(2))
        };
      });
    }

    // Domyślna alokacja przy braku dopasowania
    return assets.map(a => ({ symbol: a.symbol, weightPercent: Number((100 / assets.length).toFixed(2)), expectedVolatility: 12.0 }));
  }
}
