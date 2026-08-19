// services/marketData.ts
import { MarketTicker, Candle, ConnectionStatus } from '../types/quantforge';

export interface IMarketDataProvider {
  getTickers(): Promise<MarketTicker[]>;
  getTicker(symbol: string): Promise<MarketTicker | null>;
  getCandles(symbol: string, timeframe: string, limit: number): Promise<Candle[]>;
  subscribeToLiveTicks(symbol: string, callback: (ticker: MarketTicker) => void): () => void;
  getConnectionStatus(): ConnectionStatus;
}

export class MockMarketDataProvider implements IMarketDataProvider {
  private status: ConnectionStatus = 'LIVE';
  private subscribers: Map<string, Set<(ticker: MarketTicker) => void>> = new Map();
  private mockTickers: Map<string, MarketTicker> = new Map();

  constructor() {
    this.initMockData();
    this.startStreamingSimulation();
  }

  private initMockData() {
    const assets: Partial<MarketTicker>[] = [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'EQUITY', price: 128.50, change24hPercent: 3.42, volume24h: 45200000 },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetClass: 'ETF', price: 542.10, change24hPercent: 0.65, volume24h: 62000000 },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', assetClass: 'ETF', price: 478.30, change24hPercent: 1.12, volume24h: 38000000 },
      { symbol: 'BTC/USD', name: 'Bitcoin', assetClass: 'CRYPTO', price: 64200.00, change24hPercent: -1.25, volume24h: 21000000000 },
      { symbol: 'EUR/USD', name: 'Euro / US Dollar', assetClass: 'FOREX', price: 1.0885, change24hPercent: 0.15, volume24h: 120000000000 },
      { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'EQUITY', price: 224.30, change24hPercent: -0.45, volume24h: 31000000 },
      { symbol: 'GOLD', name: 'Gold Spot', assetClass: 'COMMODITY', price: 2412.80, change24hPercent: 0.88, volume24h: 850000000 }
    ];

    assets.forEach(asset => {
      const history = Array.from({ length: 20 }, (_, i) => (asset.price || 100) * (1 + (Math.sin(i) * 0.02)));
      const fullTicker: MarketTicker = {
        symbol: asset.symbol!,
        name: asset.name!,
        assetClass: asset.assetClass!,
        price: asset.price!,
        change24h: asset.price! * ((asset.change24hPercent || 0) / 100),
        change24hPercent: asset.change24hPercent || 0,
        high24h: asset.price! * 1.02,
        low24h: asset.price! * 0.98,
        volume24h: asset.volume24h || 1000000,
        status: 'LIVE',
        lastUpdated: Date.now(),
        history
      };
      this.mockTickers.set(fullTicker.symbol, fullTicker);
    });
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  public async getTickers(): Promise<MarketTicker[]> {
    return Array.from(this.mockTickers.values());
  }

  public async getTicker(symbol: string): Promise<MarketTicker | null> {
    return this.mockTickers.get(symbol) || null;
  }

  public async getCandles(symbol: string, timeframe: string, limit: number): Promise<Candle[]> {
    const basePrice = this.mockTickers.get(symbol)?.price || 100;
    const candles: Candle[] = [];
    let currentPrice = basePrice * 0.85;
    const now = Date.now();
    const intervalMs = 3600000; // 1 hour steps

    for (let i = limit; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const volatility = 0.015;
      const change = (Math.random() - 0.48) * volatility * currentPrice;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + (Math.random() * volatility * currentPrice * 0.5);
      const low = Math.min(open, close) - (Math.random() * volatility * currentPrice * 0.5);
      const volume = Math.floor(Math.random() * 500000) + 100000;

      candles.push({ timestamp, open, high, low, close, volume });
      currentPrice = close;
    }

    return candles;
  }

  public subscribeToLiveTicks(symbol: string, callback: (ticker: MarketTicker) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    return () => {
      const set = this.subscribers.get(symbol);
      if (set) {
        set.delete(callback);
      }
    };
  }

  private startStreamingSimulation() {
    setInterval(() => {
      this.mockTickers.forEach((ticker, symbol) => {
        const deltaPercent = (Math.random() - 0.49) * 0.004;
        const newPrice = Number((ticker.price * (1 + deltaPercent)).toFixed(2));
        const updatedTicker: MarketTicker = {
          ...ticker,
          price: newPrice,
          change24hPercent: Number((ticker.change24hPercent + deltaPercent * 10).toFixed(2)),
          lastUpdated: Date.now(),
          history: [...ticker.history.slice(1), newPrice]
        };
        this.mockTickers.set(symbol, updatedTicker);

        const subs = this.subscribers.get(symbol);
        if (subs) {
          subs.forEach(cb => cb(updatedTicker));
        }
      });
    }, 2000);
  }
}
