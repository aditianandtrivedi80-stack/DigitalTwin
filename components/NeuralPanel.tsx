
import React from 'react';
import { MachineHealth } from '../types';

const NeuralPanel: React.FC<{ health: MachineHealth }> = ({ health }) => {
  const { lstmState } = health;
  
  if (!lstmState) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <h3 className="text-sm font-bold text-purple-400 mb-6 flex items-center">
        <span className="mr-2">🧠</span> LSTM Gated Architecture
      </h3>

      <div className="space-y-6 flex-1">
        {/* Sliding Window Visualizer */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sliding Window Buffer</span>
            <span className="text-[9px] font-mono text-purple-400">N={lstmState.windowSize || 50}</span>
          </div>
          <div className="flex space-x-0.5 h-6 items-end">
             {Array.from({ length: 24 }).map((_, i) => (
               <div 
                 key={i} 
                 className={`flex-1 rounded-sm transition-all duration-700 ${
                   i > 18 ? 'bg-purple-500 h-full opacity-100 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-slate-800 h-3 opacity-40'
                 }`}
               />
             ))}
          </div>
          <p className="text-[8px] text-slate-600 mt-2 uppercase text-center font-bold tracking-tighter">Temporal Context Bridge</p>
        </div>

        {/* Gated Coefficients */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Forget Gate', val: lstmState.forgetGate, color: 'text-red-500', desc: 'Retaining' },
            { label: 'Input Gate', val: lstmState.inputGate, color: 'text-emerald-500', desc: 'Significance' },
            { label: 'Output Gate', val: lstmState.outputGate, color: 'text-blue-500', desc: 'Filter' }
          ].map((gate) => (
            <div key={gate.label} className="flex flex-col items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
               <div className={`text-xs font-mono font-black ${gate.color}`}>
                  {(gate.val * 1).toFixed(2)}
               </div>
               <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">{gate.desc}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Memory State Analysis</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                lstmState.temporalTrend === 'degrading' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
              }`}>
                {lstmState.temporalTrend}
              </span>
           </div>
           <p className="text-[10px] text-slate-400 leading-relaxed italic">
             "Bridging long time lags: Linking previous power surges to current high-frequency bearing harmonics."
           </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
         <div className="text-[10px] font-mono text-purple-400">Ct = ft·Ct-1 + it·Ĉt</div>
         <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            <span className="text-[9px] text-slate-500 font-bold uppercase">RNN_CELL: ACTIVE</span>
         </div>
      </div>
    </div>
  );
};

export default NeuralPanel;
