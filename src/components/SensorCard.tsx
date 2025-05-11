import React from "react";
import { SensorReading } from "@/types/sensor";
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Volume2 } from "lucide-react";

interface SensorCardProps {
  type: "temperature" | "humidity" | "sound";
  reading: SensorReading;
  minThreshold?: number;
  maxThreshold?: number;
}

const SensorCard: React.FC<SensorCardProps> = ({
  type,
  reading,
  minThreshold,
  maxThreshold,
}) => {
  // Define card styles and content based on sensor type
  const getCardConfig = () => {
    switch (type) {
      case "temperature":
        return {
          title: "Temperature",
          icon: <Thermometer size={36} className="text-red-500" />,
          value: `${reading.value}°C`,
          bgColor: reading.isAlert ? "bg-red-50" : "bg-gradient-to-br from-babyblue to-white",
          borderColor: reading.isAlert ? "border-red-200" : "border-blue-200",
          thresholdText: `Safe range: ${minThreshold}°C - ${maxThreshold}°C`,
        };
      case "humidity":
        return {
          title: "Humidity",
          icon: <Droplets size={36} className="text-blue-500" />,
          value: `${reading.value}%`,
          bgColor: reading.isAlert ? "bg-red-50" : "bg-gradient-to-br from-babymint to-white",
          borderColor: reading.isAlert ? "border-red-200" : "border-green-200",
          thresholdText: `Safe range: ${minThreshold}% - ${maxThreshold}%`,
        };
      case "sound":
        return {
          title: "Sound Level",
          icon: <Volume2 size={36} className="text-purple-500" />,
          value: `${reading.value} dB`,
          bgColor: reading.isAlert ? "bg-red-50" : "bg-gradient-to-br from-babylavender to-white",
          borderColor: reading.isAlert ? "border-red-200" : "border-purple-200",
          thresholdText: `Safe under: ${maxThreshold} dB`,
        };
      default:
        return {
          title: "Unknown",
          icon: null,
          value: "N/A",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          thresholdText: "",
        };
    }
  };

  const config = getCardConfig();

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor} rounded-3xl shadow-lg transition-all duration-300 overflow-hidden hover:shadow-xl transform hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold">{config.title}</h3>
          <div className="p-2 bg-white/50 rounded-full shadow-sm">
            {config.icon}
          </div>
        </div>
        
        <div className="mt-2">
          <p className={`text-4xl font-bold mb-2 ${reading.isAlert ? "text-red-500 animate-pulse-gentle" : ""}`}>
            {config.value}
          </p>
          <p className="text-sm text-gray-600 mt-2 bg-white/50 p-2 rounded-lg">{config.thresholdText}</p>
          
          {reading.isAlert && (
            <div className="mt-3 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border-2 border-red-300 flex items-center justify-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-red-500">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <span>Alert: Outside safe range</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorCard;
