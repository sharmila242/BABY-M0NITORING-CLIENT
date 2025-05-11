
import React, { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { useSensor } from "@/contexts/SensorContext";
import { format, parseISO } from "date-fns";
import { Thermometer, Droplets, Volume2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertEvent {
  id: string;
  type: "temperature" | "humidity" | "sound";
  value: number;
  timestamp: string;
  threshold: string;
}

const Alerts: React.FC = () => {
  const { historicalData, thresholds, isLoading } = useSensor();
  const [alertEvents, setAlertEvents] = useState<AlertEvent[]>([]);

  useEffect(() => {
    if (historicalData && thresholds) {
      const events: AlertEvent[] = [];
      
      // Process temperature alerts
      historicalData.temperature
        .filter(reading => reading.isAlert)
        .forEach(reading => {
          const isTooHigh = reading.value > (thresholds.temperature.max || 0);
          events.push({
            id: `temp-${reading.timestamp}`,
            type: "temperature",
            value: reading.value,
            timestamp: reading.timestamp,
            threshold: isTooHigh 
              ? `Above ${thresholds.temperature.max}°C` 
              : `Below ${thresholds.temperature.min}°C`,
          });
        });
      
      // Process humidity alerts
      historicalData.humidity
        .filter(reading => reading.isAlert)
        .forEach(reading => {
          const isTooHigh = reading.value > (thresholds.humidity.max || 0);
          events.push({
            id: `humid-${reading.timestamp}`,
            type: "humidity",
            value: reading.value,
            timestamp: reading.timestamp,
            threshold: isTooHigh 
              ? `Above ${thresholds.humidity.max}%` 
              : `Below ${thresholds.humidity.min}%`,
          });
        });
      
      // Process sound alerts
      historicalData.sound
        .filter(reading => reading.isAlert)
        .forEach(reading => {
          events.push({
            id: `sound-${reading.timestamp}`,
            type: "sound",
            value: reading.value,
            timestamp: reading.timestamp,
            threshold: `Above ${thresholds.sound.max} dB`,
          });
        });
      
      // Sort by timestamp (newest first)
      events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setAlertEvents(events);
    }
  }, [historicalData, thresholds]);

  // Get icon based on alert type
  const getAlertIcon = (type: "temperature" | "humidity" | "sound") => {
    switch (type) {
      case "temperature":
        return <Thermometer size={24} className="text-red-500" />;
      case "humidity":
        return <Droplets size={24} className="text-blue-500" />;
      case "sound":
        return <Volume2 size={24} className="text-purple-500" />;
    }
  };

  // Get formatted alert description
  const getAlertDescription = (alert: AlertEvent) => {
    switch (alert.type) {
      case "temperature":
        return `Temperature ${alert.value}°C (${alert.threshold})`;
      case "humidity":
        return `Humidity ${alert.value}% (${alert.threshold})`;
      case "sound":
        return `Sound level ${alert.value} dB (${alert.threshold})`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title="Alerts"
        subtitle="Alert history and notifications"
      />

      <main className="flex-1 px-4 py-6 pb-20">
        <h2 className="text-2xl font-bold mb-6">Alert History</h2>

        {isLoading ? (
          <>
            <Skeleton className="h-24 rounded-3xl mb-4" />
            <Skeleton className="h-24 rounded-3xl mb-4" />
            <Skeleton className="h-24 rounded-3xl" />
          </>
        ) : alertEvents.length === 0 ? (
          <div className="bg-babymint/50 rounded-3xl p-6 text-center shadow-sm">
            <p className="text-lg font-medium mb-2">No alerts detected</p>
            <p className="text-gray-600">All readings are within safe ranges</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertEvents.map((alert) => (
              <div 
                key={alert.id}
                className="bg-white rounded-3xl p-4 shadow-md border-l-4 border-red-400 flex items-start"
              >
                <div className="bg-red-50 p-2 rounded-full mr-3">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{getAlertDescription(alert)}</p>
                  <p className="text-sm text-gray-500">
                    {format(parseISO(alert.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Alert Settings</h3>
          <div className="bg-white rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Notifications</span>
              <span className="text-green-500 font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="text-gray-600">Alert Sounds</span>
              <span className="text-green-500 font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Vibration</span>
              <span className="text-green-500 font-medium">Enabled</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;
