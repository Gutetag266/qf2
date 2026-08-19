// components/QuantForgeApp.tsx
import React, { useState, useEffect } from 'react';
import { 
  MarketTicker, 
  QuantScoreResult, 
  RiskMetrics, 
  BacktestResult, 
  QuantStrategy 
} from '../types/quantforge';
import { MockMarketDataProvider } from '../services/marketData';
import { QuantAnalyticsEngine } from '../services/quantEngine';
import { BacktestEngine } from '../services/backtestEngine';
import { PaperTradingBroker } from '../services/brokerEngine';

const marketProvider = new MockMarketDataProvider();
const paperBroker = new PaperTradingBroker();

export const QuantForgeApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'quant' | 'backtest' | 'portfolio' | 'settings'>('overview');
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [quantScore, setQuantScore] = useState<QuantScoreResult | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  useEffect(() => {
    // Initial fetch
    marketProvider.getTickers().then(data => {
      setTickers(data);
    });

    // Subscribe to symbol updates
    const unsubscribe = marketProvider.subscribeToLiveTicks(selectedSymbol, (updated) => {
      setTickers(prev => prev.map(t => t.symbol === updated.symbol ? updated : t));
    });

    // Run Quant analytics
    marketProvider.getCandles(selectedSymbol, '1h', 100).then(candles => {
      const score = QuantAnalyticsEngine.calculateQuantScore(candles);
      score.symbol = selectedSymbol;
      setQuantScore(score);

      const risk = QuantAnalyticsEngine.computeRiskMetrics(candles);
      setRiskMetrics(risk);
    });

    return () => unsubscribe();
  }, [selectedSymbol]);

  const runSampleBacktest = () => {
    const sampleStrategy: QuantStrategy = {
      id: 'STRAT_RSI_EMA',
      name: 'RSI Mean Reversion + Trend',
      symbol: selectedSymbol,
      timeframe: '1h',
      entryConditions: [],
      exitConditions: [],
      stopLossATRMultiplier: 2.0,
      takeProfitATRMultiplier: 4.0,
      riskPerTradePercent: 2.0,
      maxPositions: 3
    };

    marketProvider.getCandles(selectedSymbol, '1h', 200).then(candles => {
      const result = BacktestEngine.run(sampleStrategy, candles, 100000);
      setBacktestResult(result);
    });
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 p-4 justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
              QF
            </div>
            <span className="text-lg font-bold tracking-wider text-slate-100">QuantForge</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'markets', label: 'Markets' },
              { id: 'quant', label: 'Quant Center' },
              { id: 'backtest', label: 'Backtest Engine' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'settings', label: 'Settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Market Data</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              ● LIVE
            </span>
          </div>
          <div className="text-xs text-slate-500 px-2">
            Engine v2.4.0 • Paper Mode
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-400">Selected Asset:</span>
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-cyan-500"
            >
              {tickers.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol} - {t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Paper Portfolio</div>
              <div className="text-sm font-bold text-slate-100">$100,000.00</div>
            </div>
            <button 
              onClick={() => paperBroker.executeOrder({ symbol: selectedSymbol, side: 'BUY', type: 'MARKET', quantity: 10, isPaperTrading: true })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-md transition-colors"
            >
              Paper Buy
            </button>
          </div>
        </header>

        {/* TAB CONTENT PANELS */}
        <div className="p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* TOP METRICS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Portfolio Value</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">$100,000.00</div>
                  <div className="text-xs text-emerald-400 mt-1">+0.00% Today</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Quant Signal</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{quantScore?.signal || 'COMPUTING'}</div>
                  <div className="text-xs text-slate-400 mt-1">Score: {quantScore?.totalScore}/100</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Annualized Volatility</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">{riskMetrics?.volatilityAnnualized || 0}%</div>
                  <div className="text-xs text-amber-400 mt-1">VaR 95%: -{riskMetrics?.valueAtRisk95}%</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400">Sharpe Ratio</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">{riskMetrics?.sharpeRatio || 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Sortino: {riskMetrics?.sortinoRatio || 0}</div>
                </div>
              </div>

              {/* LIVE CHART SIMULATOR CONTAINER */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">{selectedSymbol} Live Candlestick</h2>
                    <p className="text-xs text-slate-400">1-Hour Timeframe • High Precision Analytics</p>
                  </div>
                  <div className="flex space-x-2">
                    {['1m', '5m', '15m', '1H', '1D'].map((tf, i) => (
                      <span key={tf} className={`px-2.5 py-1 text-xs rounded border ${i === 3 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-400'}`}>
                        {tf}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="h-64 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-center text-slate-600 text-sm">
                  [ Live Interactive Candlestick Canvas & Indicator Layer Integration ]
                </div>
              </div>

            </div>
          )}

          {activeTab === 'quant' && quantScore && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Factor Decomposition — {selectedSymbol}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(quantScore.factors).map(([factor, score]) => (
                  <div key={factor} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold capitalize text-slate-300">{factor}</span>
                      <span className="text-sm font-bold text-cyan-400">{score}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'backtest' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100">Backtest Engine</h2>
                <button 
                  onClick={runSampleBacktest}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-md transition-colors"
                >
                  Run Strategy Simulation
                </button>
              </div>

              {backtestResult ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-slate-400">Total Return</span>
                      <p className="text-lg font-bold text-emerald-400">+{backtestResult.totalReturnPercent}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Max Drawdown</span>
                      <p className="text-lg font-bold text-rose-400">-{backtestResult.maxDrawdownPercent}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Win Rate</span>
                      <p className="text-lg font-bold text-slate-100">{backtestResult.winRatePercent}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Profit Factor</span>
                      <p className="text-lg font-bold text-slate-100">{backtestResult.profitFactor}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">Executed Trades ({backtestResult.trades.length})</h3>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {backtestResult.trades.map(trade => (
                        <div key={trade.id} className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded border border-slate-800">
                          <span className="text-slate-400">{new Date(trade.entryTimestamp).toLocaleDateString()}</span>
                          <span className="text-slate-200">Entry: ${trade.entryPrice} → Exit: ${trade.exitPrice}</span>
                          <span className={trade.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                  Click "Run Strategy Simulation" to execute historical backtest rules against {selectedSymbol}.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-50">
        {[
          { id: 'overview', label: 'Home' },
          { id: 'markets', label: 'Markets' },
          { id: 'quant', label: 'Quant' },
          { id: 'backtest', label: 'Backtest' },
          { id: 'portfolio', label: 'Portfolio' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center py-1 text-[10px] font-medium ${
              activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};
