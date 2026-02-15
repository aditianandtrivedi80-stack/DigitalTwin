
import React from 'react';
import { MachineHealth } from '../types';

const RootCausePanel: React.FC<{ health: MachineHealth }> = ({ health }) => {
  if (!health.rootCauses) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[8px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded uppercase">SHAP Attribution</span>
      </div>
      
      <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center">
        <span className="mr-2 text-cyan-400">🔍</span> Root Cause Breakdown
      </h3>

      <div className="space-y-4 flex-1">
        {health.rootCauses.map((rc, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">{rc.feature}</span>
              <span className={rc.impact > 0.5 ? 'text-red-400' : 'text-slate-500'}>
                {rc.impact > 0 ? '+' : ''}{(rc.impact * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-1000 ${rc.impact > 0.4 ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${Math.abs(rc.impact) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-slate-950 rounded-xl border border-slate-800/50">
         <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Physics Validation Loss</span>
         </div>
         <div className="flex justify-between items-end">
            <span className="text-xs font-mono text-emerald-400">PINN_ERROR: {health.pinnLoss?.toFixed(4)}</span>
            <span className="text-[9px] text-slate-600 font-bold uppercase">Target: &lt; 0.0500</span>
         </div>
      </div>
    </div>
  );
};

export default RootCausePanel;
