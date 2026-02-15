
import React from 'react';
import { MachineHealth } from '../types';

const MaintenanceBot: React.FC<{ health: MachineHealth }> = ({ health }) => {
  if (!health.repairChecklist) return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] h-full flex flex-col items-center justify-center text-center">
       <div className="text-5xl mb-6 opacity-30 grayscale brightness-200">🤖</div>
       <p className="text-xs text-slate-500 font-black uppercase tracking-[0.3em]">Action Bot Standby</p>
       <p className="text-[10px] text-slate-600 mt-2 italic max-w-[150px]">Monitoring physics for autonomic repair triggers...</p>
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-blue-500/30 p-8 rounded-[2rem] h-full flex flex-col relative overflow-hidden group backdrop-blur-md">
      <div className="absolute top-0 right-0 p-6">
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Prescriptive Protocol v2</span>
         </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-black text-white mb-2 flex items-center">
          <span className="mr-3 text-blue-400">🔧</span> {health.failureMode || 'Diagnostic Plan'}
        </h3>
        <div className="flex items-center space-x-3">
           <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
             health.inventoryStatus === 'In Stock' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
           }`}>
             Inventory: {health.inventoryStatus}
           </span>
           <span className="text-[10px] font-bold text-slate-500 uppercase">Part: {health.failureMode?.split(' ')[0] || 'Hub'} Assembly</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {health.repairChecklist.map((item, idx) => (
          <div key={idx} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/50 relative pl-12 hover:border-blue-500/20 transition-all group">
            <div className="absolute left-4 top-5 w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              {idx + 1}
            </div>
            <h4 className="text-[12px] font-bold text-slate-200 uppercase mb-1 tracking-tight">{item.step}</h4>
            <div className="flex justify-between items-center mt-3 border-t border-slate-800/50 pt-2">
               <span className="text-[10px] font-mono text-emerald-400">Tool: {item.tool}</span>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ETA: {item.estimatedTime}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
          Order Parts
        </button>
        <button className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">
          Exec Repair
        </button>
      </div>
    </div>
  );
};

export default MaintenanceBot;
