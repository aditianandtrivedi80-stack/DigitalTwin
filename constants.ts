
import { SystemArchitecture } from './types';

export const GOLDEN_BATCH = {
  vibration: 2.5,
  temperature: 65,
  rpm: 1800,
  vibrationTolerance: 0.8,
  tempTolerance: 10,
};

export const ARCHITECTURE_SPECS: SystemArchitecture = {
  timeSeriesSchema: `
    -- Federated Edge Schema (Local SQLite/DuckDB)
    CREATE TABLE edge_events (
      ts TIMESTAMP DEFAULT now(),
      vector_id INT,
      pinn_loss FLOAT,
      inference_ms INT
    );
    -- Syncs to Global TwinScale Cluster (PostgreSQL/Timescale)
  `,
  relationalSchema: `
    -- XAI & SHAP Attribution Metadata
    CREATE TABLE model_weights (
      layer_id UUID,
      feature_name VARCHAR(50),
      current_attribution FLOAT,
      global_avg_attribution FLOAT
    );
  `,
  apiEndpoints: [
    { path: '/api/v1/edge/pinn-weights', method: 'GET', description: 'Fetch latest local physics-informed weights' },
    { path: '/api/v1/prescriptive/actuate', method: 'POST', description: 'Trigger hardware throttle command' },
    { path: '/api/v1/xai/root-cause', method: 'GET', description: 'Retrieve SHAP/LIME attribution data' },
    { path: '/api/v1/twin/xray-overlay', method: 'GET', description: 'Fetch thermal point clouds for 3D overlay' }
  ]
};
