
export interface SensorReading {
  value: number;
  timestamp: string;
  isAlert: boolean;
  deviceId?: string;
  location?: string;
  batteryLevel?: number;
  signalStrength?: number;
}

export interface SensorData {
  temperature: SensorReading;
  humidity: SensorReading;
  sound: SensorReading;
  lastSyncTime?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'weak';
}

export interface SensorThresholds {
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    min: number;
    max: number;
  };
  sound: {
    max: number;
  };
}

export interface HistoricalData {
  temperature: SensorReading[];
  humidity: SensorReading[];
  sound: SensorReading[];
  timeRange?: string; // e.g., "24h", "7d", "30d"
  dataPoints?: number;
}

export interface CloudConfig {
  apiKey?: string;
  deviceId?: string;
  refreshInterval?: number; // in milliseconds
  endpoint?: string;
}
