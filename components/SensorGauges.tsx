
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types';

interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  history: SensorData[];
  dataKey: keyof SensorData;
  color: string;
  min: number;
  max: number;
}

const SensorGauge: React.FC<GaugeProps> = ({ label, value, unit, history, dataKey, color, min, max }) => {
  // Simple color mapping for health
  const getStatusColor = () => {
    const percent = (value - min) / (max - min);
    if (percent > 0.85) return 'text-red-500';
    if (percent > 0.6) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-bold mono ${getStatusColor()}`}>{value.toFixed(1)}</span>
            <span className="text-slate-500 text-xs">{unit}</span>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor()} bg-current/10`}>
          LIVE
        </div>
      </div>
      
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.slice(-20)}>
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            <XAxis hide />
            <YAxis hide domain={[min, max]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', fontSize: '10px' }}
              itemStyle={{ color: color }}
              labelStyle={{ display: 'none' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorGauge;
