// components/MultiChartWorkspace.tsx
import React, { useState } from 'react';

export const MultiChartWorkspace: React.FC<{ activeSymbols: string[] }> = ({ activeSymbols }) => {
  const [layout, setLayout] = useState<'SINGLE' | 'GRID_2X2' | 'SPLIT_VERTICAL'>('GRID_2X2');

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
        <span className="text-xs text-slate-400 font-semibold">Workspace Layout</span>
        <div className="flex space-x-2">
          {(['SINGLE', 'SPLIT_VERTICAL', 'GRID_2X2'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                layout === l ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {l.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid flex-1 gap-4 ${
        layout === 'SINGLE' ? 'grid-cols-1' : layout === 'SPLIT_VERTICAL' ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'
      }`}>
        {activeSymbols.slice(0, layout === 'SINGLE' ? 1 : layout === 'SPLIT_VERTICAL' ? 2 : 4).map((sym, i) => (
          <div key={sym + i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-slate-200">{sym}</span>
              <span className="text-xs text-emerald-400 font-mono">+1.24%</span>
            </div>
            <div className="flex-1 my-4 bg-slate-950 rounded border border-slate-850 flex items-center justify-center text-xs text-slate-600">
              [ High Performance Candle Canvas: {sym} ]
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Vol: 12.4M</span>
              <span>RSI: 48.2</span>
              <span>VWAP: $128.10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
