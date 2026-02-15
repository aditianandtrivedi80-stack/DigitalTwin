
import React from 'react';
import { ChaosEvent } from '../types';

interface Props {
  active: ChaosEvent;
  onTrigger: (event: ChaosEvent) => void;
}

const ChaosControls: React.FC<Props> = ({ active, onTrigger }) => {
  const events: { id: ChaosEvent; label: string; icon: string; color: string }[] = [
    { id: 'None', label: 'Clear System', icon: '🛡️', color: 'bg-slate-800' },
    { id: 'PowerSurge', label: 'Power Surge', icon: '⚡', color: 'bg-amber-600' },
    { id: 'CoolantLeak', label: 'Coolant Leak', icon: '💧', color: 'bg-blue-600' },
    { id: 'BearingSeize', label: 'Bearing Seize', icon: '🛑', color: 'bg-red-600' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Demo Chaos Injector</h3>
      <div className="grid grid-cols-2 gap-3">
        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => onTrigger(e.id)}
            className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
              active === e.id 
                ? `${e.color} border-white/20 text-white shadow-lg` 
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <span className="text-sm">{e.icon}</span>
            <span className="text-[10px] font-bold uppercase truncate">{e.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChaosControls;
