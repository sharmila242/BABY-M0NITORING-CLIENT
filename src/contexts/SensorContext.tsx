import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { SensorData, SensorThresholds, HistoricalData, CloudConfig } from "@/types/sensor";
import { 
  getSensorData, 
  getThresholds, 
  getHistoricalData, 
  updateThresholds,
  getCloudConfig,
  updateCloudConfig
} from "@/services/iotService";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SensorContextType {
  currentData: SensorData | null;
  thresholds: SensorThresholds | null;
  historicalData: HistoricalData | null;
  cloudConfig: CloudConfig | null;
  isLoading: boolean;
  error: string | null;
  updateSensorThresholds: (newThresholds: SensorThresholds) => Promise<void>;
  updateCloudConfiguration: (newConfig: Partial<CloudConfig>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [thresholds, setThresholds] = useState<SensorThresholds | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const dataIntervalRef = useRef<number | null>(null);
  const { isAuthenticated } = useAuth();
  
  // Track last notification times to implement cooldown
  const lastNotificationRef = useRef<{
    temperature: number;
    humidity: number;
    sound: number;
  }>({ temperature: 0, humidity: 0, sound: 0 });

  const fetchSensorData = async () => {
    try {
      const data = await getSensorData();
      setCurrentData(data);
      
      if (consecutiveErrors > 0) {
        setConsecutiveErrors(0);
        setError(null);
      }
      
      // Log the current data and thresholds for debugging
      console.log("Current data:", data);
      console.log("Current thresholds:", thresholds);
      
      // Check for alerts and show notifications
      // Make sure we have thresholds before checking
      if (!thresholds) {
        console.error("No thresholds available for alert checks");
        return;
      }
      
      // Force temperature alert check - use current thresholds
      const tempMax = thresholds.temperature.max;
      const tempMin = thresholds.temperature.min;
      const tempTooHigh = data.temperature.value > tempMax;
      const tempTooLow = data.temperature.value < tempMin;
      const tempAlert = tempTooHigh || tempTooLow || data.temperature.isAlert;
      
      console.log("Manual temperature check:", {
        value: data.temperature.value,
        min: tempMin,
        max: tempMax,
        tooHigh: tempTooHigh,
        tooLow: tempTooLow,
        isAlert: tempAlert
      });
      
      if (tempAlert) {
        console.log("Temperature alert detected!", {
          value: data.temperature.value,
          min: tempMin,
          max: tempMax
        });
        
        // Show toast notification
        toast({
          title: "⚠️ Temperature Alert!",
          description: `Current temperature: ${data.temperature.value}°C is ${tempTooHigh ? 'above maximum' : 'below minimum'} threshold (${tempTooHigh ? thresholds?.temperature.max : thresholds?.temperature.min}°C). Please check nursery conditions immediately.`,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
        
        // Send browser notification with cooldown (30 seconds)
        if (Notification.permission === "granted") {
          const now = Date.now();
          const cooldownPeriod = 30 * 1000; // 30 seconds cooldown
          
          // Only send notification if cooldown period has passed
          if (now - lastNotificationRef.current.temperature > cooldownPeriod) {
            const notificationTitle = `Temperature Alert!`;
            const notificationBody = `Current temperature: ${data.temperature.value}°C is ${tempTooHigh ? 'above maximum' : 'below minimum'} threshold (${tempTooHigh ? thresholds?.temperature.max : thresholds?.temperature.min}°C).`;
            
            try {
              // Send notification without tag to allow duplicates
              new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico'
              });
              
              // Update last notification time
              lastNotificationRef.current.temperature = now;
              console.log("Sent temperature browser notification");
            } catch (error) {
              console.error("Failed to send browser notification:", error);
            }
          } else {
            console.log("Temperature notification on cooldown", {
              timeSinceLastNotification: now - lastNotificationRef.current.temperature,
              cooldownPeriod
            });
          }
        }
      }
      
      // Force humidity alert check - use current thresholds
      const humidMax = thresholds.humidity.max;
      const humidMin = thresholds.humidity.min;
      const humidTooHigh = data.humidity.value > humidMax;
      const humidTooLow = data.humidity.value < humidMin;
      const humidAlert = humidTooHigh || humidTooLow || data.humidity.isAlert;
      
      console.log("Manual humidity check:", {
        value: data.humidity.value,
        min: humidMin,
        max: humidMax,
        tooHigh: humidTooHigh,
        tooLow: humidTooLow,
        isAlert: humidAlert
      });
      
      if (humidAlert) {
        console.log("Humidity alert detected!", {
          value: data.humidity.value,
          min: humidMin,
          max: humidMax
        });
        
        // Show toast notification
        toast({
          title: "⚠️ Humidity Alert!",
          description: `Current humidity: ${data.humidity.value}% is ${humidTooHigh ? 'above maximum' : 'below minimum'} threshold (${humidTooHigh ? thresholds?.humidity.max : thresholds?.humidity.min}%). Please check nursery conditions immediately.`,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
        
        // Send browser notification with cooldown (30 seconds)
        if (Notification.permission === "granted") {
          const now = Date.now();
          const cooldownPeriod = 30 * 1000; // 30 seconds cooldown
          
          // Only send notification if cooldown period has passed
          if (now - lastNotificationRef.current.humidity > cooldownPeriod) {
            const notificationTitle = `Humidity Alert!`;
            const notificationBody = `Current humidity: ${data.humidity.value}% is ${humidTooHigh ? 'above maximum' : 'below minimum'} threshold (${humidTooHigh ? thresholds?.humidity.max : thresholds?.humidity.min}%).`;
            
            try {
              // Send notification without tag to allow duplicates
              new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico'
              });
              
              // Update last notification time
              lastNotificationRef.current.humidity = now;
              console.log("Sent humidity browser notification");
            } catch (error) {
              console.error("Failed to send browser notification:", error);
            }
          } else {
            console.log("Humidity notification on cooldown", {
              timeSinceLastNotification: now - lastNotificationRef.current.humidity,
              cooldownPeriod
            });
          }
        }
      }
      
      // Force sound alert check - use current thresholds
      const soundMax = thresholds.sound.max;
      const soundTooLoud = data.sound.value > soundMax;
      const soundAlert = soundTooLoud || data.sound.isAlert;
      
      console.log("Manual sound check:", {
        value: data.sound.value,
        max: soundMax,
        tooLoud: soundTooLoud,
        isAlert: soundAlert
      });
      
      if (soundAlert) {
        console.log("Sound alert detected!", {
          value: data.sound.value,
          max: soundMax
        });
        
        // Show toast notification
        toast({
          title: "⚠️ Sound Alert!",
          description: `Loud noise detected: ${data.sound.value}dB exceeds maximum threshold (${thresholds?.sound.max || 70}dB). Please check on your baby immediately.`,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
        
        // Send browser notification with cooldown (30 seconds)
        if (Notification.permission === "granted") {
          const now = Date.now();
          const cooldownPeriod = 20 * 1000; // 0 seconds cooldown
          
          // Only send notification if cooldown period has passed
          if (now - lastNotificationRef.current.sound > cooldownPeriod) {
            const notificationTitle = `Sound Alert!`;
            const notificationBody = `Loud noise detected: ${data.sound.value}dB exceeds maximum threshold (${thresholds?.sound.max || 70}dB). Please check on your baby immediately.`;
            
            try {
              // Send notification without tag to allow duplicates
              new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico'
              });
              
              // Update last notification time
              lastNotificationRef.current.sound = now;
              console.log("Sent sound browser notification");
            } catch (error) {
              console.error("Failed to send browser notification:", error);
            }
          } else {
            console.log("Sound notification on cooldown", {
              timeSinceLastNotification: now - lastNotificationRef.current.sound,
              cooldownPeriod
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch sensor data:", err);
      
      setConsecutiveErrors(prev => prev + 1);
      
      if (consecutiveErrors >= 2) {
        setError("Cannot connect to sensors. Please check your connection and API settings.");
      }
    }
  };

  const fetchThresholds = async () => {
    try {
      const thresholdData = await getThresholds();
      setThresholds(thresholdData);
    } catch (err) {
      console.error("Failed to fetch thresholds:", err);
      setError("Failed to fetch threshold values. Please check your connection.");
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const histData = await getHistoricalData();
      setHistoricalData(histData);
    } catch (err) {
      console.error("Failed to fetch historical data:", err);
      setError("Failed to fetch historical data. Please check your connection.");
    }
  };

  const fetchCloudConfig = async () => {
    try {
      const config = await getCloudConfig();
      setCloudConfig(config);
      return config; // Return the config explicitly
    } catch (err) {
      console.error("Failed to fetch cloud configuration:", err);
      setError("Failed to fetch cloud configuration. Please check your connection.");
      return null; // Return null on error
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSensorData(),
        fetchThresholds(),
        fetchHistoricalData(),
        fetchCloudConfig()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSensorThresholds = async (newThresholds: SensorThresholds) => {
    setIsLoading(true);
    try {
      const updatedThresholds = await updateThresholds(newThresholds);
      setThresholds(updatedThresholds);
      
      if (isAuthenticated) {
        toast({
          title: "Settings Updated",
          description: "Sensor thresholds have been updated successfully.",
        });
      }
    } catch (err) {
      console.error("Failed to update thresholds:", err);
      setError("Failed to update threshold values. Please try again.");
      
      if (isAuthenticated) {
        toast({
          title: "Update Failed",
          description: "Failed to update sensor thresholds. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateCloudConfiguration = async (newConfig: Partial<CloudConfig>) => {
    setIsLoading(true);
    try {
      const updatedConfig = await updateCloudConfig(newConfig);
      setCloudConfig(updatedConfig);
      
      setError(null);
      setConsecutiveErrors(0);
      
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
        dataIntervalRef.current = null;
      }
      
      await fetchSensorData();
      
      const interval = window.setInterval(() => {
        fetchSensorData();
      }, updatedConfig.refreshInterval || 5000);
      
      dataIntervalRef.current = interval;
      
      if (isAuthenticated) {
        toast({
          title: "Cloud Configuration Updated",
          description: "Your sensor connection settings have been updated.",
        });
      }
    } catch (err) {
      console.error("Failed to update cloud config:", err);
      setError("Failed to update cloud configuration. Please try again.");
      
      if (isAuthenticated) {
        toast({
          title: "Update Failed",
          description: "Failed to update cloud configuration. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Fix the first issue by properly handling the Promise
    fetchCloudConfig().then(config => {
      if (config) { // Now it's safe to check truthiness on the returned value
        const interval = window.setInterval(() => {
          fetchSensorData();
        }, config.refreshInterval || 20000); // Set default refresh interval to 20 seconds
        
        dataIntervalRef.current = interval;
      }
    });

    return () => {
      if (dataIntervalRef.current) {
        clearInterval(dataIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const historyInterval = window.setInterval(() => {
      fetchHistoricalData();
    }, 60000);

    return () => clearInterval(historyInterval);
  }, []);

  const value = {
    currentData,
    thresholds,
    historicalData,
    cloudConfig,
    isLoading,
    error,
    updateSensorThresholds,
    updateCloudConfiguration,
    refreshData
  };

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
};

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error("useSensor must be used within a SensorProvider");
  }
  return context;
};
