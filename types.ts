
export interface SensorData {
  timestamp: number;
  vibration: number; 
  temperature: number; 
  rpm: number;
  pressure: number; 
  energyConsumption: number; // kW
  efficiency: number; // 0-100%
}

export type ScenarioType = 'Normal' | 'Arctic' | 'DeepSea' | 'Desert' | 'HighLoadMining';
export type ChaosEvent = 'None' | 'PowerSurge' | 'CoolantLeak' | 'BearingSeize';

export interface SimSettings {
  speedBoost: number; 
  loadFactor: number; 
  selfHealingActive: boolean;
  throttleFactor: number; 
  scenario: ScenarioType;
  ambientTemp: number;
  chaosEvent: ChaosEvent;
}

export interface EdgeStatus {
  latency: number; // ms
  modelSize: string; 
  inferenceMode: 'LocalTinyML' | 'CloudPINN';
}

export interface RootCause {
  feature: string;
  impact: number; 
}

export interface RepairStep {
  step: string;
  tool: string;
  estimatedTime: string;
}

export interface LSTMState {
  windowSize: number;
  forgetGate: number;
  inputGate: number;
  outputGate: number;
  temporalTrend: 'stable' | 'degrading' | 'recovering';
}

export interface MachineHealth {
  score: number;
  status: 'optimal' | 'warning' | 'critical';
  rul: number; 
  anomalyDetected: boolean;
  lastAnalysis: string;
  stressLevel: number; 
  capacity: number; 
  failureMode?: string;
  confidence: number;
  healthHistory: number[];
  rootCauses?: RootCause[];
  prescriptiveAction?: string;
  pinnLoss?: number; 
  edgeStatus?: EdgeStatus;
  repairChecklist?: RepairStep[];
  energyWasteFactor?: number; 
  inventoryStatus?: 'In Stock' | 'Ordering' | 'Out of Stock';
  lstmState?: LSTMState;
}

export interface FleetAsset {
  id: string;
  name: string;
  type: string;
  status: 'optimal' | 'warning' | 'critical';
  healthScore: number;
  riskRanking: number; 
  collectiveSync: boolean; 
}

export interface MaintenanceTicket {
  id: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Prescriptive';
  priority: 'low' | 'medium' | 'high';
  scheduledDate: string;
  description: string;
  assignedTo: string;
  failureMode?: string;
  partRequired?: string;
  inventoryLeadTime?: string;
}

export interface SystemArchitecture {
  timeSeriesSchema: string;
  relationalSchema: string;
  apiEndpoints: { path: string; method: string; description: string }[];
}
