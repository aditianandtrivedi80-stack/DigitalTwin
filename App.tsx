
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { iotManager } from './services/iotSimulator';
import { analyzeHealth } from './services/geminiService';
import { SensorData, MachineHealth, MaintenanceTicket, SimSettings, ScenarioType, FleetAsset, ChaosEvent } from './types';
import { ARCHITECTURE_SPECS } from './constants';
import DigitalTwinCanvas from './components/DigitalTwinCanvas';
import SensorGauge from './components/SensorGauges';
import PhysicsPanel from './components/PhysicsPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import DegradationChart from './components/DegradationChart';
import RootCausePanel from './components/RootCausePanel';
import FleetDashboard from './components/FleetDashboard';
import MaintenanceBot from './components/MaintenanceBot';
import ChaosControls from './components/ChaosControls';
import NeuralPanel from './components/NeuralPanel';

const MOCK_FLEET: FleetAsset[] = [
  { id: 'x1', name: 'X-1 Turbine', type: 'Bearing Hub', status: 'optimal', healthScore: 98, riskRanking: 5, collectiveSync: true },
  { id: 'x2', name: 'X-2 Compressor', type: 'HP Pump', status: 'warning', healthScore: 78, riskRanking: 2, collectiveSync: true },
  { id: 'x3', name: 'X-3 Fan', type: 'Exhaust Unit', status: 'optimal', healthScore: 92, riskRanking: 8, collectiveSync: true },
  { id: 'y1', name: 'Y-1 Driller', type: 'Mining Head', status: 'critical', healthScore: 42, riskRanking: 1, collectiveSync: true },
  { id: 'y2', name: 'Y-2 Conveyor', type: 'Belt System', status: 'optimal', healthScore: 95, riskRanking: 9, collectiveSync: true },
  { id: 'z1', name: 'Z-1 Reactor', type: 'Cooling Loop', status: 'warning', healthScore: 65, riskRanking: 3, collectiveSync: true },
  { id: 'z2', name: 'Z-2 Purifier', type: 'Filtration', status: 'optimal', healthScore: 88, riskRanking: 7, collectiveSync: true },
  { id: 'a1', name: 'A-1 Loader', type: 'Hydraulic Arm', status: 'optimal', healthScore: 91, riskRanking: 10, collectiveSync: true },
  { id: 'b1', name: 'B-1 Press', type: 'Stamping Unit', status: 'warning', healthScore: 72, riskRanking: 4, collectiveSync: true },
  { id: 'c1', name: 'C-1 Packager', type: 'End-of-Line', status: 'optimal', healthScore: 84, riskRanking: 6, collectiveSync: true },
];

const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SensorData[]>([]);
  const [currentHealth, setCurrentHealth] = useState<MachineHealth>({
    score: 100, status: 'optimal', rul: 2500, anomalyDetected: false, lastAnalysis: 'Init...',
    stressLevel: 12, capacity: 100, confidence: 0.99, healthHistory: Array(20).fill(100),
    pinnLoss: 0.012, prescriptiveAction: "System Stable", energyWasteFactor: 2, inventoryStatus: 'In Stock'
  });
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'fleet' | 'dashboard' | 'maintenance' | 'architecture'>('fleet');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [showARModal, setShowARModal] = useState(false);
  const [simSettings, setSimSettings] = useState<SimSettings>({ 
    speedBoost: 0, loadFactor: 1.0, selfHealingActive: true, throttleFactor: 1.0, 
    scenario: 'Normal' as ScenarioType, ambientTemp: 25, chaosEvent: 'None'
  });
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeMachineIndex, setTimeMachineIndex] = useState<number>(-1);

  const latestDataRef = useRef<SensorData[]>([]);

  useEffect(() => {
    iotManager.updateSettings({
      scenario: simSettings.scenario,
      loadFactor: simSettings.loadFactor,
      speedBoost: simSettings.speedBoost,
      throttle: simSettings.throttleFactor,
      chaosEvent: simSettings.chaosEvent
    });
  }, [simSettings]);

  useEffect(() => {
    const handleNewData = (data: SensorData) => {
      setTelemetry(prev => {
        const next = [...prev, data].slice(-200);
        latestDataRef.current = next;
        return next;
      });
    };
    iotManager.subscribe(handleNewData);
    return () => iotManager.unsubscribe(handleNewData);
  }, []);

  const runAnalysis = useCallback(async (forcedSettings?: SimSettings) => {
    if (latestDataRef.current.length < 5 || isAnalyzing || cooldownSeconds > 0) return;
    
    setIsAnalyzing(true);
    const settings = forcedSettings || (isSimulationActive ? simSettings : undefined);
    const result = await analyzeHealth(latestDataRef.current, settings);
    
    if (result.error === 'RATE_LIMIT' || result.error === 'COOLDOWN') {
      setRateLimited(true);
      setCooldownSeconds(result.cooldownSeconds || 60);
    } else {
      setRateLimited(false);
      setCooldownSeconds(0);
    }

    setCurrentHealth(result.health);
    if (result.ticket) {
      setTickets(prev => [result.ticket!, ...prev].slice(0, 10));
    }
    
    if (simSettings.selfHealingActive && result.health.score < 80) {
      setSimSettings(s => ({ ...s, throttleFactor: result.health.score < 50 ? 0.35 : 0.65 }));
    } else if (result.health.score > 92) {
      setSimSettings(s => ({ ...s, throttleFactor: 1.0 }));
    }
    
    setIsAnalyzing(false);
  }, [isAnalyzing, isSimulationActive, simSettings, cooldownSeconds]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => setCooldownSeconds(s => Math.max(0, s - 1)), 1000);
      return () => clearInterval(timer);
    } else if (rateLimited) setRateLimited(false);
  }, [cooldownSeconds, rateLimited]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSimulationActive && !rateLimited && activeTab !== 'fleet' && timeMachineIndex === -1) {
        runAnalysis();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [isSimulationActive, runAnalysis, rateLimited, activeTab, timeMachineIndex]);

  const displayedTelemetry = timeMachineIndex === -1 
    ? (telemetry[telemetry.length - 1] || { vibration: 0, temperature: 0, rpm: 0, pressure: 0, energyConsumption: 0, efficiency: 100 })
    : (telemetry[timeMachineIndex] || telemetry[telemetry.length - 1]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <aside className="w-72 border-r border-slate-800 bg-slate-900/40 flex flex-col backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-500 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-cyan-500/20">TS</div>
            <h1 className="text-2xl font-black tracking-tight text-white">TwinScale</h1>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'fleet', label: 'Fleet Hub', icon: '🏭' },
              { id: 'dashboard', label: 'Twin Control', icon: '💎' },
              { id: 'maintenance', label: 'Prescriptions', icon: '🔧' },
              { id: 'architecture', label: 'Edge Core', icon: '📡' }
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as any)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeTab === nav.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{nav.icon}</span>
                <span>{nav.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-8 mb-6">
           <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-[1.5rem] shadow-inner">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sustainability</h4>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Efficiency Index</span>
                    <span className={`text-[10px] font-black ${displayedTelemetry.efficiency < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {displayedTelemetry.efficiency.toFixed(1)}%
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Carbon Waste</span>
                    <span className="text-[10px] font-black text-rose-500">
                      {currentHealth.energyWasteFactor?.toFixed(1)}%
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800 space-y-6">
           {activeTab !== 'fleet' && (
             <ChaosControls 
               active={simSettings.chaosEvent} 
               onTrigger={(event) => {
                setSimSettings(s => ({ ...s, chaosEvent: event }));
                if (event !== 'None') {
                  setIsSimulationActive(true);
                  setTimeout(() => runAnalysis({ ...simSettings, chaosEvent: event }), 100);
                }
               }} 
             />
           )}
           <button 
             onClick={() => setShowARModal(true)}
             className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center group"
           >
             <span className="mr-2 group-hover:scale-125 transition-transform">📱</span> Mobile AR Overlays
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 relative bg-[#0a0f1c]">
        {showARModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
             <div className="bg-slate-900 border border-slate-700/50 p-12 rounded-[3.5rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] text-center max-w-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
                <button onClick={() => setShowARModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">✕</button>
                <div className="w-56 h-56 bg-white p-6 rounded-[2.5rem] mx-auto mb-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors" />
                   <div className="relative z-10 w-full h-full border-4 border-slate-900 rounded-xl grid grid-cols-5 grid-rows-5 gap-1 p-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`bg-slate-900 rounded-sm ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-5'}`} />
                      ))}
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">AR Sync Portal</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed italic mb-10 px-4">
                  "Scan to place the Turbine X-1 Digital Twin in your physical workshop. Direct real-time thermal projection synced via WebXR."
                </p>
                <button onClick={() => setShowARModal(false)} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30">Deactivate Portal</button>
             </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-2">
               <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">PINN Validation Active</span>
               <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-indigo-500/20">Global Collective Sync</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">
              {activeTab === 'fleet' ? 'Factory Intelligence Hub' : `Replica: ${MOCK_FLEET[0].name}`}
            </h2>
          </div>
          <div className="flex items-center space-x-6">
            {activeTab !== 'fleet' && (
              <div className="flex items-center space-x-4 bg-slate-900/60 px-5 py-3 rounded-2xl border border-slate-800 backdrop-blur-md">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">History Buffer</span>
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${timeMachineIndex === -1 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]'}`} />
                  <span className="text-xs font-mono font-black text-white">{timeMachineIndex === -1 ? 'REAL-TIME' : 'TEMPORAL_PLAYBACK'}</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => {
                setIsSimulationActive(true);
                runAnalysis();
              }}
              className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${
                activeTab === 'fleet' || isAnalyzing || cooldownSeconds > 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
              }`}
              disabled={activeTab === 'fleet' || isAnalyzing || cooldownSeconds > 0}
            >
              {isAnalyzing ? 'Propagating Weights...' : 'Run Physics Sync'}
            </button>
          </div>
        </header>

        {activeTab === 'fleet' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Global Health', val: '86%', color: 'text-emerald-400', sub: 'Fleet Integrity' },
                { label: 'Alert Triage', val: '01', color: 'text-red-500', sub: 'Urgent Dispatch' },
                { label: 'Carbon Saved', val: '14.2t', color: 'text-cyan-400', sub: 'Predictive ROI' },
                { label: 'Uptime (YTD)', val: '99.98%', color: 'text-white', sub: 'Autonomic Goal' }
              ].map(stat => (
                <div key={stat.label} className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] shadow-xl backdrop-blur-md hover:border-slate-700 transition-all group">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">{stat.label}</p>
                   <p className={`text-4xl font-black ${stat.color} tracking-tighter mb-1`}>{stat.val}</p>
                   <p className="text-[9px] text-slate-600 font-bold uppercase">{stat.sub}</p>
                </div>
              ))}
            </div>
            
            <div className="p-12 bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/20 rounded-[3rem] relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-10 flex flex-col items-end">
                  <div className="flex -space-x-4 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden shadow-lg">
                        <img src={`https://picsum.photos/40/40?random=${i + 20}`} alt="Fleet Twin" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                     <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Global Sync Active</span>
                  </div>
               </div>
               <h3 className="text-2xl font-black text-white mb-4 tracking-tight flex items-center">
                 <span className="mr-3">🧠</span> Federated Learning Mesh
               </h3>
               <p className="text-sm text-slate-400 max-w-2xl leading-relaxed font-medium italic">
                 "Our framework manages collective intelligence. When Machine Y-1 suffers a bearing seizure, the TwinScale mesh propagates the new physics-weights across all 10 assets globally."
               </p>
            </div>
            
            <FleetDashboard assets={MOCK_FLEET} onSelect={() => setActiveTab('dashboard')} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-10 animate-in fade-in duration-500">
            <div className="col-span-12 lg:col-span-8 space-y-10">
              <div className="h-[600px] relative">
                <DigitalTwinCanvas 
                  rpm={displayedTelemetry.rpm} 
                  vibration={displayedTelemetry.vibration} 
                  stress={currentHealth.stressLevel} 
                />
                
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-20 px-12 py-7 bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-5">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Temporal Controller</span>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black ${timeMachineIndex === -1 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>
                          {timeMachineIndex === -1 ? 'LIVE' : 'PLAYBACK'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <span className="text-sm font-mono font-black text-cyan-400">
                          {timeMachineIndex === -1 ? 'NOW' : `T - ${telemetry.length - timeMachineIndex}`}
                        </span>
                        {timeMachineIndex !== -1 && (
                          <button onClick={() => setTimeMachineIndex(-1)} className="text-[11px] font-black text-cyan-500 uppercase hover:text-white transition-all">Return to Live</button>
                        )}
                      </div>
                   </div>
                   <input 
                     type="range" min="0" max={telemetry.length - 1} step="1"
                     value={timeMachineIndex === -1 ? telemetry.length - 1 : timeMachineIndex}
                     onChange={(e) => {
                       const val = parseInt(e.target.value);
                       setTimeMachineIndex(val >= telemetry.length - 1 ? -1 : val);
                     }}
                     className="w-full h-2.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-600"
                   />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <SensorGauge label="Vibration Harmonics" unit="mm/s" value={displayedTelemetry.vibration} history={telemetry} dataKey="vibration" color="#06b6d4" min={0} max={25} />
                <SensorGauge label="Thermal State" unit="°C" value={displayedTelemetry.temperature} history={telemetry} dataKey="temperature" color="#ef4444" min={-40} max={150} />
                <SensorGauge label="Energy Consumpt." unit="kW" value={displayedTelemetry.energyConsumption} history={telemetry} dataKey="energyConsumption" color="#10b981" min={0} max={100} />
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <WhatIfSimulator 
                settings={simSettings} 
                onSettingsChange={setSimSettings} 
                onRunSimulation={() => {
                  setIsSimulationActive(true);
                  runAnalysis(simSettings);
                }} 
                isSyncing={isAnalyzing} 
              />
              <NeuralPanel health={currentHealth} />
              <RootCausePanel health={currentHealth} />
              <PhysicsPanel health={currentHealth} />
              <DegradationChart health={currentHealth} />
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-12 gap-10 animate-in slide-in-from-bottom-12 duration-600">
            <div className="col-span-12 lg:col-span-5">
              <MaintenanceBot health={currentHealth} />
            </div>
            <div className="col-span-12 lg:col-span-7 space-y-10">
               <div className="bg-slate-900/70 border border-slate-800 p-12 rounded-[3rem] shadow-2xl backdrop-blur-xl">
                 <h3 className="text-2xl font-black text-white mb-10 flex items-center">
                    <span className="mr-5 text-blue-500">📜</span> Supply Chain & Repair Ledger
                 </h3>
                 <div className="space-y-8">
                    {tickets.map(t => (
                        <div key={t.id} className={`bg-slate-950/90 border p-10 rounded-[2rem] flex items-center justify-between hover:border-cyan-500/40 transition-all duration-500 group relative overflow-hidden ${t.type === 'Predictive' ? 'border-amber-500/20 shadow-xl shadow-amber-500/5' : 'border-slate-800'}`}>
                          <div className="flex items-center space-x-10">
                              <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl transition-transform group-hover:scale-110 bg-slate-900 shadow-inner">
                                {t.type === 'Predictive' ? '🌡️' : '🔧'}
                              </div>
                              <div>
                                <div className="flex space-x-4 items-center mb-3">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.id}</span>
                                    <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-blue-500/30">{t.type}</span>
                                </div>
                                <h4 className="font-bold text-white text-xl mb-2">{t.description}</h4>
                                <div className="flex items-center space-x-6">
                                   <p className="text-[12px] text-slate-400 font-medium">Part: <span className="text-cyan-400 font-bold">{t.partRequired}</span></p>
                                   <p className="text-[12px] text-slate-400 font-medium">Logistics: <span className="text-rose-400 font-black">{t.inventoryLeadTime}</span></p>
                                </div>
                              </div>
                          </div>
                          <button className="px-10 py-4 bg-slate-800 hover:bg-cyan-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl">Audit Log</button>
                        </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'architecture' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-[4rem] p-20 animate-in zoom-in-95 duration-1000 backdrop-blur-3xl shadow-2xl">
             <div className="mb-20">
               <h3 className="text-5xl font-black mb-6 text-white tracking-tighter">TwinScale Full-Stack Engine</h3>
               <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-sm">Industrial Physics-as-a-Service Platform</p>
             </div>
             
             <div className="grid grid-cols-2 gap-24">
               <div className="space-y-16">
                  <div className="space-y-6">
                    <h4 className="text-[12px] font-black text-cyan-500 uppercase tracking-[0.4em] border-l-4 border-cyan-500 pl-4">Simulation Infrastructure</h4>
                    <div className="p-12 bg-slate-950 rounded-[3rem] border border-slate-800/80 text-xs font-mono space-y-6 text-emerald-400">
                      <p className="flex justify-between items-center"><span>-- Physics-Based Energy Model</span> <span className="text-emerald-900 font-black">STABLE</span></p>
                      <p className="flex justify-between items-center"><span>-- Collective GAN Stressor</span> <span className="text-emerald-900 font-black">ACTIVE</span></p>
                    </div>
                  </div>
               </div>
               <div className="space-y-10">
                  <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em] border-l-4 border-slate-700 pl-4">Digital Thread API</h4>
                  <div className="space-y-5">
                    {ARCHITECTURE_SPECS.apiEndpoints.map(ep => (
                      <div key={ep.path} className="flex items-center justify-between p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800 hover:border-cyan-500/50 transition-all group">
                        <div className="flex items-center space-x-8">
                          <span className="px-5 py-2.5 bg-cyan-600/10 text-cyan-400 text-[11px] font-black rounded-2xl uppercase">{ep.method}</span>
                          <span className="text-base font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">{ep.path}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
