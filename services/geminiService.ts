import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SensorData, MachineHealth, MaintenanceTicket, SimSettings } from "../types";

// Note: Use NEXT_PUBLIC_ if you are calling this from the frontend (for Hackathon demo purposes)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
let apiCooldownUntil = 0;

export interface AnalysisResult {
  health: MachineHealth;
  ticket?: MaintenanceTicket;
  error?: 'RATE_LIMIT' | 'GENERIC' | 'COOLDOWN';
  cooldownSeconds?: number;
}

export const analyzeHealth = async (
  history: SensorData[], 
  simSettings?: SimSettings
): Promise<AnalysisResult> => {
  const now = Date.now();
  
  if (now < apiCooldownUntil) {
    return {
      health: createFallbackHealth("API Cooldown Active"),
      error: 'COOLDOWN',
      cooldownSeconds: Math.ceil((apiCooldownUntil - now) / 1000)
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            status: { type: SchemaType.STRING },
            rul: { type: SchemaType.NUMBER },
            stressLevel: { type: SchemaType.NUMBER },
            capacity: { type: SchemaType.NUMBER },
            anomalyDetected: { type: SchemaType.BOOLEAN },
            failureMode: { type: SchemaType.STRING },
            confidence: { type: SchemaType.NUMBER },
            healthHistory: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } },
            pinnLoss: { type: SchemaType.NUMBER },
            prescriptiveAction: { type: SchemaType.STRING },
            energyWasteFactor: { type: SchemaType.NUMBER },
            inventoryStatus: { type: SchemaType.STRING },
            lstmState: {
              type: SchemaType.OBJECT,
              properties: {
                forgetGate: { type: SchemaType.NUMBER },
                inputGate: { type: SchemaType.NUMBER },
                outputGate: { type: SchemaType.NUMBER },
                temporalTrend: { type: SchemaType.STRING }
              }
            },
            rootCauses: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  feature: { type: SchemaType.STRING },
                  impact: { type: SchemaType.NUMBER }
                }
              }
            }
          },
          required: ["score", "status", "rul", "anomalyDetected", "stressLevel", "pinnLoss", "prescriptiveAction", "energyWasteFactor", "inventoryStatus", "lstmState", "rootCauses"]
        },
      },
    });

    const simulationContext = simSettings 
      ? `[Sim: ${simSettings.scenario}] Load: ${simSettings.loadFactor}x, Chaos: ${simSettings.chaosEvent}.`
      : "[LIVE MODE]";

    const prompt = `Act as the Synapse PINN Orchestrator. 
      Analyze these 15 intervals: ${JSON.stringify(history.slice(-15))}. 
      Context: ${simulationContext}.
      Focus on Physics-Informed metrics and LSTM gate states.`;

    const resultRaw = await model.generateContent(prompt);
    const responseText = resultRaw.response.text();
    
    // Safety check to strip markdown if AI forgets the JSON-only rule
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanJson);

    // Map AI result to our strict MachineHealth interface
    const health: MachineHealth = {
      ...result,
      status: (result.status?.toLowerCase() || 'optimal') as 'optimal' | 'warning' | 'critical',
      inventoryStatus: (result.inventoryStatus || 'In Stock') as 'In Stock' | 'Ordering' | 'Out of Stock',
      lastAnalysis: new Date().toLocaleTimeString(),
      edgeStatus: {
        latency: Number((0.4 + Math.random() * 0.3).toFixed(2)),
        modelSize: "52KB",
        inferenceMode: result.score < 70 ? 'CloudPINN' : 'LocalTinyML'
      }
    };

    let ticket: MaintenanceTicket | undefined;
    if (result.score < 85) {
      ticket = {
        id: `SYN-${Math.floor(Math.random() * 9000) + 1000}`,
        type: 'Predictive',
        priority: result.score < 50 ? 'high' : 'medium',
        description: result.prescriptiveAction,
        scheduledDate: "Immediate",
        assignedTo: 'Synapse-Bot-01',
        failureMode: result.failureMode,
        partRequired: result.inventoryStatus === 'Ordering' ? 'Component-X' : 'Lubricant-Z',
        inventoryLeadTime: result.inventoryStatus === 'In Stock' ? '0 hrs' : '24 hrs'
      };
    }

    return { health, ticket };

  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || JSON.stringify(error).includes('429');
    if (isRateLimit) apiCooldownUntil = Date.now() + 60000;
    
    return {
      health: createFallbackHealth(isRateLimit ? "API Throttled" : "System Error"),
      error: isRateLimit ? 'RATE_LIMIT' : 'GENERIC',
      cooldownSeconds: isRateLimit ? 60 : 0
    };
  }
};

function createFallbackHealth(reason: string): MachineHealth {
  return {
    score: 95, 
    status: 'optimal', 
    rul: 1200, 
    stressLevel: 15, 
    capacity: 100,
    anomalyDetected: false, 
    confidence: 0.95, 
    lastAnalysis: 'Fail-Safe',
    healthHistory: Array(20).fill(95), 
    pinnLoss: 0.04,
    prescriptiveAction: reason, 
    energyWasteFactor: 0.02, 
    inventoryStatus: "In Stock",
    lstmState: { 
      forgetGate: 0.9, 
      inputGate: 0.1, 
      outputGate: 0.8, 
      temporalTrend: "stable" 
    },
    rootCauses: [],
    edgeStatus: { 
      latency: 0.1, 
      modelSize: "N/A", 
      inferenceMode: 'LocalTinyML' 
    }
  };
}