
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MachineHealth } from '../types';

const DegradationChart: React.FC<{ health: MachineHealth }> = ({ health }) => {
  // Convert healthHistory to chart data
  const data = health.healthHistory.map((val, i) => ({
    time: i,
    health: val
  }));

  const isCritical = health.score < 60;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-bold text-emerald-400 flex items-center">
            <span className="mr-2">📉</span> Health Degradation Regression
          </h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-widest">LSTM Output Layer</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-black text-white">{health.rul}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Hours to Failure (RUL)</div>
        </div>
      </div>

      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isCritical ? "#ef4444" : "#10b981"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isCritical ? "#ef4444" : "#10b981"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 100]} />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="health" 
              stroke={isCritical ? "#ef4444" : "#10b981"} 
              fillOpacity={1} 
              fill="url(#colorHealth)" 
              strokeWidth={3}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
           <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">State Estimate</span>
           <span className="text-sm font-mono text-white">{health.score.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
           <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Failure Curve</span>
           <span className="text-xs font-bold text-slate-300">Exponential</span>
        </div>
      </div>

      {isCritical && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-red-500/20 animate-pulse rounded-2xl" />
      )}
    </div>
  );
};

export default DegradationChart;
