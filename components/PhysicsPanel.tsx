
import React from 'react';
import { MachineHealth } from '../types';

const PhysicsPanel: React.FC<{ health: MachineHealth }> = ({ health }) => {
  const isHealthy = (health.pinnLoss ?? 0) < 0.05;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center">
          <span className="mr-2">🔬</span> Physics-Informed Engine
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative group">
             <div className="absolute top-2 right-2 flex space-x-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]'}`} />
             </div>
             <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-tighter">Physics Loss (PINN)</p>
             <div className="text-xl font-mono text-center py-2 text-blue-300">
               {health.pinnLoss?.toFixed(4)} <span className="text-[8px] text-slate-600 font-bold ml-1 uppercase">Validating...</span>
             </div>
          </div>

          {health.prescriptiveAction && health.score < 90 && (
            <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-500 ${health.score < 70 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
               <span className={`text-[9px] font-black uppercase block mb-1 ${health.score < 70 ? 'text-amber-500' : 'text-blue-500'}`}>Prescriptive Strategy</span>
               <p className="text-[11px] text-slate-200 font-bold leading-tight uppercase italic tracking-tighter">
                 "{health.prescriptiveAction}"
               </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Edge-Cloud Hybrid Status</h4>
          <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${health.edgeStatus?.inferenceMode === 'LocalTinyML' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
            {health.edgeStatus?.inferenceMode || 'Cloud'}
          </span>
        </div>
        {[
          { name: 'Inference Latency', status: `${health.edgeStatus?.latency.toFixed(2)} ms`, color: 'text-emerald-400' },
          { name: 'Memory Footprint', status: health.edgeStatus?.modelSize || '48KB', color: 'text-emerald-400' },
          { name: 'Federated Sync', status: 'Sync-Active', color: 'text-purple-400' },
          { name: 'TinyML Optimizer', status: 'Pruning: 40%', color: 'text-slate-500' },
        ].map((layer) => (
          <div key={layer.name} className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-tighter">{layer.name}</span>
            <span className={`mono font-bold ${layer.color}`}>{layer.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhysicsPanel;
