
import { SensorData, ScenarioType, ChaosEvent } from '../types';
import { GOLDEN_BATCH } from '../constants';

export class IoTManager {
  private listeners: ((data: SensorData) => void)[] = [];
  private interval: number | null = null;
  private currentData: SensorData = {
    timestamp: Date.now(),
    vibration: GOLDEN_BATCH.vibration,
    temperature: GOLDEN_BATCH.temperature,
    rpm: GOLDEN_BATCH.rpm,
    pressure: 45,
    energyConsumption: 12.5,
    efficiency: 98
  };

  private wearFactor: number = 0; 
  private settings = { 
    scenario: 'Normal' as ScenarioType, 
    loadFactor: 1.0, 
    speedBoost: 0, 
    throttle: 1.0,
    chaosEvent: 'None' as ChaosEvent
  };

  updateSettings(settings: { scenario: ScenarioType, loadFactor: number, speedBoost: number, throttle: number, chaosEvent: ChaosEvent }) {
    this.settings = settings;
  }

  subscribe(callback: (data: SensorData) => void) {
    this.listeners.push(callback);
    if (!this.interval) this.startSimulation();
  }

  unsubscribe(callback: (data: SensorData) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
    if (this.listeners.length === 0 && this.interval) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
  }

  private startSimulation() {
    this.interval = window.setInterval(() => {
      const ambientTemps: Record<ScenarioType, number> = {
        'Normal': 25, 'Arctic': -30, 'DeepSea': 4, 'Desert': 50, 'HighLoadMining': 35
      };

      let baseRpm = GOLDEN_BATCH.rpm * (1 + this.settings.speedBoost / 100) * this.settings.throttle;
      let load = this.settings.loadFactor;
      const tAmbient = ambientTemps[this.settings.scenario];

      // Chaos Modifiers
      let thermalSpike = 0;
      let pressureDrop = 0;
      let vibrationBurst = 0;

      if (this.settings.chaosEvent === 'PowerSurge') {
        baseRpm *= 1.4;
        vibrationBurst = 8.0;
      } else if (this.settings.chaosEvent === 'CoolantLeak') {
        thermalSpike = 40.0;
        pressureDrop = 15.0;
      } else if (this.settings.chaosEvent === 'BearingSeize') {
        baseRpm *= 0.2;
        vibrationBurst = 15.0;
        thermalSpike = 60.0;
      }

      const wearDelta = (baseRpm / 2000) * (load ** 2) * 0.0001;
      this.wearFactor += wearDelta;

      const thermalMass = 100;
      const coolingCoeff = this.settings.scenario === 'DeepSea' ? 0.8 : 0.2;
      const heatGen = (baseRpm * load * 0.01) + (this.wearFactor * 10) + (thermalSpike * 5);
      const dT = (heatGen / thermalMass) - (this.currentData.temperature - tAmbient) * coolingCoeff;
      
      const vibBase = (baseRpm / 1000) * 1.2;
      const vibWear = this.wearFactor * 15;
      const noise = (Math.random() - 0.5) * 0.5;

      // Energy Logic: Base + Load + Wear Friction
      const baseEnergy = (baseRpm / 2000) * 10;
      const loadEnergy = load * 5;
      const wearFrictionLoss = this.wearFactor * 25;
      const totalEnergy = baseEnergy + loadEnergy + wearFrictionLoss + (thermalSpike / 2);
      const efficiency = Math.max(70, 100 - (wearFrictionLoss / totalEnergy) * 100);

      this.currentData = {
        timestamp: Date.now(),
        rpm: baseRpm + (Math.random() - 0.5) * 10,
        temperature: Math.max(tAmbient, this.currentData.temperature + dT),
        vibration: Math.max(0.1, vibBase + vibWear + noise + vibrationBurst),
        pressure: Math.max(0, 45 + (load * 5) - pressureDrop + (Math.random() - 0.5) * 2),
        energyConsumption: totalEnergy,
        efficiency: efficiency
      };

      this.listeners.forEach(l => l(this.currentData));
    }, 500);
  }
}

export const iotManager = new IoTManager();
