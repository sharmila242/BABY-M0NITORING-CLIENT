import { SensorData, SensorThresholds, HistoricalData, SensorReading, CloudConfig } from "@/types/sensor";

// Default thresholds
const defaultThresholds: SensorThresholds = {
  temperature: {
    min: 18,
    max: 30,
  },
  humidity: {
    min: 30,
    max: 60,
  },
  sound: {
    max: 50,
  },
};

// In-memory storage for thresholds
let thresholds: SensorThresholds = { ...defaultThresholds };

// In-memory storage for historical data (last 24 hours, readings every 10 minutes)
const MAX_HISTORY_POINTS = 144; // 24h * 6 readings per hour
let historicalData: HistoricalData = {
  temperature: [],
  humidity: [],
  sound: [],
};

// Default cloud configuration (to be updated with real values)
let cloudConfig: CloudConfig = {
  apiKey: "",
  deviceId: "baby-monitor-01",
  refreshInterval: 5000, // Reduced to 5 seconds for more frequent updates
  endpoint: "https://baby-monitoring-server.onrender.com/readings", // Updated to point to Render server
};

// Function to fetch data from cloud API
async function fetchFromCloud(): Promise<SensorData | null> {
  console.log("Attempting to fetch sensor data from:", cloudConfig.endpoint);
  
  // If no API endpoint is configured, return null
  if (!cloudConfig.endpoint) {
    console.error("No cloud endpoint configured. Please set up your IoT API endpoint in settings.");
    return null;
  }

  try {
    // Add a timestamp parameter to prevent caching
    const url = `${cloudConfig.endpoint}?deviceId=${cloudConfig.deviceId}&t=${Date.now()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": cloudConfig.apiKey ? `Bearer ${cloudConfig.apiKey}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Cloud API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log("Received sensor data:", data);
    return transformCloudData(data);
  } catch (error) {
    console.error("Error fetching from cloud:", error);
    return null;
  }
}

// Transform cloud data into our app's format
function transformCloudData(cloudData: any): SensorData {
  const timestamp = new Date().toISOString();
  
  console.log("Transforming cloud data:", cloudData);
  console.log("Current thresholds:", thresholds);
  
  // Check if temperature, humidity and sound values exist
  const tempValue = parseFloat((cloudData.temperature ?? 0).toFixed(1));
  const humidValue = parseFloat((cloudData.humidity ?? 0).toFixed(1));
  const soundValue = parseFloat((cloudData.sound ?? 0).toFixed(1));
  
  // Use the current threshold values
  // Note: We're no longer overriding thresholds here so user settings will be preserved
  
  // Determine if values are outside thresholds
  const tempIsAlert = tempValue < thresholds.temperature.min || tempValue > thresholds.temperature.max;
  const humidIsAlert = humidValue < thresholds.humidity.min || humidValue > thresholds.humidity.max;
  const soundIsAlert = soundValue > thresholds.sound.max;
  
  console.log("Alert checks:", {
    temperature: { value: tempValue, min: thresholds.temperature.min, max: thresholds.temperature.max, isAlert: tempIsAlert },
    humidity: { value: humidValue, min: thresholds.humidity.min, max: thresholds.humidity.max, isAlert: humidIsAlert },
    sound: { value: soundValue, max: thresholds.sound.max, isAlert: soundIsAlert }
  });
  
  // Additional debug logging for temperature alerts
  if (tempValue > thresholds.temperature.max) {
    console.log(`TEMPERATURE TOO HIGH: ${tempValue} > ${thresholds.temperature.max}`);
  }
  if (tempValue < thresholds.temperature.min) {
    console.log(`TEMPERATURE TOO LOW: ${tempValue} < ${thresholds.temperature.min}`);
  }
  
  const result = {
    temperature: {
      value: tempValue,
      timestamp: cloudData.lastSync || timestamp,
      isAlert: tempIsAlert,
    },
    humidity: {
      value: humidValue,
      timestamp: cloudData.lastSync || timestamp,
      isAlert: humidIsAlert,
    },
    sound: {
      value: soundValue,
      timestamp: cloudData.lastSync || timestamp,
      isAlert: soundIsAlert,
    },
    lastSyncTime: cloudData.lastSync || timestamp,
    connectionStatus: cloudData.connectionStatus || 'connected',
  };
  
  console.log("Transformed data:", result);
  return result;
}

// Update historical data
function updateHistoricalData(currentData: SensorData) {
  // Add new readings to history
  historicalData.temperature.push(currentData.temperature);
  historicalData.humidity.push(currentData.humidity);
  historicalData.sound.push(currentData.sound);
  
  // Keep only the latest MAX_HISTORY_POINTS readings
  if (historicalData.temperature.length > MAX_HISTORY_POINTS) {
    historicalData.temperature = historicalData.temperature.slice(-MAX_HISTORY_POINTS);
    historicalData.humidity = historicalData.humidity.slice(-MAX_HISTORY_POINTS);
    historicalData.sound = historicalData.sound.slice(-MAX_HISTORY_POINTS);
  }
}

// Public API
export async function getSensorData(): Promise<SensorData> {
  try {
    console.log("Fetching sensor data from:", cloudConfig.endpoint);
    
    // Always try to fetch real data
    const cloudData = await fetchFromCloud();
    
    // If real data is available, use it
    if (cloudData) {
      console.log("Successfully received sensor data");
      updateHistoricalData(cloudData);
      return cloudData;
    }
    
    // Only if fetching real data fails, notify the user
    console.error("Failed to fetch real sensor data. Check your API endpoint and connection settings.");
    
    // Return the last known data if available, otherwise create a placeholder
    const lastTempReading = historicalData.temperature.length > 0 ? 
      historicalData.temperature[historicalData.temperature.length - 1].value : 0;
    const lastHumidReading = historicalData.humidity.length > 0 ? 
      historicalData.humidity[historicalData.humidity.length - 1].value : 0;
    const lastSoundReading = historicalData.sound.length > 0 ? 
      historicalData.sound[historicalData.sound.length - 1].value : 0;
    
    const timestamp = new Date().toISOString();
    const placeholderData: SensorData = {
      temperature: {
        value: lastTempReading,
        timestamp,
        isAlert: false,
      },
      humidity: {
        value: lastHumidReading,
        timestamp,
        isAlert: false,
      },
      sound: {
        value: lastSoundReading,
        timestamp,
        isAlert: false,
      },
      lastSyncTime: timestamp,
      connectionStatus: 'disconnected',
    };
    
    console.log("Using placeholder data:", placeholderData);
    // Don't update historical data with placeholder values
    return placeholderData;
  } catch (error) {
    console.error("Critical error in getSensorData:", error);
    throw new Error("Failed to get sensor data. Please check your connection and settings.");
  }
}

export function getHistoricalData(): Promise<HistoricalData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...historicalData });
    }, 500);
  });
}

export function getThresholds(): Promise<SensorThresholds> {
  return new Promise((resolve) => {
    resolve({ ...thresholds });
  });
}

export function updateThresholds(newThresholds: SensorThresholds): Promise<SensorThresholds> {
  return new Promise((resolve) => {
    console.log("Updating thresholds from:", thresholds);
    console.log("Updating thresholds to:", newThresholds);
    
    // Make a deep copy of the new thresholds
    thresholds = JSON.parse(JSON.stringify(newThresholds));
    
    console.log("Thresholds after update:", thresholds);
    resolve({ ...thresholds });
  });
}

export function resetThresholds(): Promise<SensorThresholds> {
  return new Promise((resolve) => {
    thresholds = { ...defaultThresholds };
    resolve({ ...thresholds });
  });
}

export function updateCloudConfig(newConfig: Partial<CloudConfig>): Promise<CloudConfig> {
  return new Promise((resolve) => {
    cloudConfig = { ...cloudConfig, ...newConfig };
    
    // Log the new configuration for debugging
    console.log("Cloud configuration updated:", cloudConfig);
    
    // Clear historical data when endpoint changes to avoid mixing data
    if (newConfig.endpoint && newConfig.endpoint !== cloudConfig.endpoint) {
      historicalData = {
        temperature: [],
        humidity: [],
        sound: [],
      };
    }
    
    resolve({ ...cloudConfig });
  });
}

export function getCloudConfig(): Promise<CloudConfig> {
  return new Promise((resolve) => {
    resolve({ ...cloudConfig });
  });
}
