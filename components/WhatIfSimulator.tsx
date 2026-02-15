
import React from 'react';
import { SimSettings, ScenarioType } from '../types';

interface Props {
  settings: SimSettings;
  onSettingsChange: (settings: SimSettings) => void;
  onRunSimulation: () => void;
  isSyncing: boolean;
}

const WhatIfSimulator: React.FC<Props> = ({ settings, onSettingsChange, onRunSimulation, isSyncing }) => {
  const scenarios: ScenarioType[] = ['Normal', 'Arctic', 'DeepSea', 'Desert', 'HighLoadMining'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4">
        <div className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest bg-cyan-500/10 text-cyan-500`}>
          VIRTUAL_SENSOR_LAB
        </div>
      </div>
      
      <h3 className="text-sm font-bold text-white mb-6 flex items-center">
        <span className="mr-2">🌍</span> Shadow Mode Simulation
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Environmental Scenario</label>
          <div className="grid grid-cols-2 gap-2">
            {scenarios.map((s) => (
              <button
                key={s}
                onClick={() => onSettingsChange({ ...settings, scenario: s })}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  settings.scenario === s 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                    : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
            <span>Operational Load Factor</span>
            <span className="text-cyan-400">{settings.loadFactor.toFixed(1)}x</span>
          </div>
          <input 
            type="range" min="0.5" max="3.0" step="0.1"
            value={settings.loadFactor}
            onChange={(e) => onSettingsChange({ ...settings, loadFactor: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
            <span>Production Speed (%)</span>
            <span className="text-cyan-400">+{settings.speedBoost}%</span>
          </div>
          <input 
            type="range" min="0" max="100" step="10"
            value={settings.speedBoost}
            onChange={(e) => onSettingsChange({ ...settings, speedBoost: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>

        <button 
          onClick={onRunSimulation}
          disabled={isSyncing}
          className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            isSyncing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95'
          }`}
        >
          {isSyncing ? 'Syncing Virtual Sensors...' : 'Run Simulation'}
        </button>

        <p className="text-[9px] text-slate-600 italic leading-relaxed text-center font-medium">
          Note: High speed/load in extreme scenarios (Desert/Arctic) accelerates bearing wear in the synthetic data engine.
        </p>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
