// components/StrategyBuilderView.tsx
import React, { useState } from 'react';
import { QuantStrategy, StrategyCondition } from '../types/quantforge';

export const StrategyBuilderView: React.FC = () => {
  const [strategyName, setStrategyName] = useState<string>('Momentum Reversal Strategy');
  const [conditions, setConditions] = useState<StrategyCondition[]>([
    { id: '1', indicator: 'RSI', operator: '<', targetValue: 30 },
    { id: '2', indicator: 'VOLUME', operator: '>', targetValue: 'AVG_VOLUME' }
  ]);
  const [stopLossMultiplier, setStopLossMultiplier] = useState<number>(2.0);
  const [takeProfitMultiplier, setTakeProfitMultiplier] = useState<number>(4.0);

  const addCondition = () => {
    const newCond: StrategyCondition = {
      id: Date.now().toString(),
      indicator: 'EMA',
      operator: 'CROSSES_ABOVE',
      targetValue: 'EMA_200'
    };
    setConditions([...conditions, newCond]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Visual Strategy Builder</h2>
          <p className="text-xs text-slate-400">Algorithmic Trade Rule Engine (Code-Free)</p>
        </div>
        <button 
          onClick={() => alert(`Strategia ${strategyName} została zapisana w lokalnym silniku.`)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-md transition-colors"
        >
          Save Strategy
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Strategy Name</label>
          <input 
            type="text" 
            value={strategyName} 
            onChange={(e) => setStrategyName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* ENTRY RULES SECTION */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Entry Conditions (IF)</span>
            <button onClick={addCondition} className="text-xs text-cyan-400 hover:underline">+ Add Condition</button>
          </div>

          <div className="space-y-2">
            {conditions.map((cond, idx) => (
              <div key={cond.id} className="flex items-center space-x-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">{idx === 0 ? 'IF' : 'AND'}</span>
                
                <select 
                  value={cond.indicator} 
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setConditions(conditions.map(c => c.id === cond.id ? { ...c, indicator: val } : c));
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  <option value="RSI">RSI</option>
                  <option value="EMA">EMA</option>
                  <option value="SMA">SMA</option>
                  <option value="VOLUME">Volume</option>
                  <option value="ATR">ATR</option>
                </select>

                <select 
                  value={cond.operator} 
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setConditions(conditions.map(c => c.id === cond.id ? { ...c, operator: val } : c));
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  <option value="<">&lt;</option>
                  <option value=">">&gt;</option>
                  <option value="<="">&lt;=</option>
                  <option value=">="">&gt;=</option>
                  <option value="CROSSES_ABOVE">Crosses Above</option>
                  <option value="CROSSES_BELOW">Crosses Below</option>
                </select>

                <input 
                  type="text" 
                  value={cond.targetValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConditions(conditions.map(c => c.id === cond.id ? { ...c, targetValue: val as any } : c));
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-28"
                />

                <button onClick={() => removeCondition(cond.id)} className="text-rose-500 hover:text-rose-400 ml-auto font-bold px-2">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RISK MANAGEMENT PARAMETERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Stop Loss (ATR Multiplier)</label>
            <input 
              type="number" 
              step="0.5"
              value={stopLossMultiplier} 
              onChange={(e) => setStopLossMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Take Profit (ATR Multiplier)</label>
            <input 
              type="number" 
              step="0.5"
              value={takeProfitMultiplier} 
              onChange={(e) => setTakeProfitMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
