
import React from 'react';
import { FleetAsset } from '../types';

interface Props {
  assets: FleetAsset[];
  onSelect: (id: string) => void;
}

const FleetDashboard: React.FC<Props> = ({ assets, onSelect }) => {
  const sortedAssets = [...assets].sort((a, b) => a.riskRanking - b.riskRanking);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {sortedAssets.map((asset) => (
        <div 
          key={asset.id} 
          onClick={() => onSelect(asset.id)}
          className={`p-6 rounded-[2rem] bg-slate-900 border transition-all cursor-pointer group relative overflow-hidden flex flex-col ${
            asset.status === 'critical' ? 'border-red-500/40 hover:bg-red-500/5 shadow-2xl shadow-red-500/10' : 
            asset.status === 'warning' ? 'border-amber-500/40 hover:bg-amber-500/5 shadow-2xl shadow-amber-500/10' : 
            'border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          {/* Priority & Sync Badge */}
          <div className="absolute top-0 right-0 p-4 flex flex-col items-end space-y-2">
            <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
              asset.riskRanking <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
            }`}>
              {asset.riskRanking <= 3 ? `CRITICAL #${asset.riskRanking}` : `RANK #${asset.riskRanking}`}
            </span>
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
               <span className="text-[7px] font-black text-blue-400 uppercase">Synced</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
              asset.status === 'critical' ? 'bg-red-500/10 text-red-500' : 
              asset.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
              'bg-emerald-500/10 text-emerald-500'
            }`}>
              {asset.type.includes('Mining') ? '⛏️' : asset.type.includes('HP Pump') ? '💧' : '⚙️'}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-white text-md group-hover:text-cyan-400 transition-colors truncate">{asset.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{asset.type}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6 flex-1">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50 group-hover:border-slate-700 transition-all">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Health State</span>
                 <span className={`text-[10px] font-black ${
                   asset.healthScore < 50 ? 'text-red-500' : asset.healthScore < 80 ? 'text-amber-500' : 'text-emerald-500'
                 }`}>
                   {asset.status.toUpperCase()}
                 </span>
               </div>
               <div className="flex items-baseline space-x-1">
                 <span className={`text-2xl font-mono font-black ${
                   asset.healthScore < 60 ? 'text-red-500' : asset.healthScore < 85 ? 'text-amber-500' : 'text-emerald-500'
                 }`}>{asset.healthScore}%</span>
               </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter border-t border-slate-800/50 pt-4">
             <span className="text-slate-500">Global Knowledge Sync</span>
             <span className="text-blue-400">99.9%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FleetDashboard;
