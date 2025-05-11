
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SensorReading } from "@/types/sensor";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SensorChartProps {
  data: SensorReading[];
  type: "temperature" | "humidity" | "sound";
  minThreshold?: number;
  maxThreshold?: number;
}

const SensorChart: React.FC<SensorChartProps> = ({
  data,
  type,
  minThreshold,
  maxThreshold,
}) => {
  // Format data for chart
  const chartData = data.map((reading) => ({
    time: format(parseISO(reading.timestamp), "HH:mm"),
    value: reading.value,
    isAlert: reading.isAlert,
  }));

  // Determine chart configurations based on sensor type
  const getChartConfig = () => {
    switch (type) {
      case "temperature":
        return {
          title: "Temperature History",
          color: "#EF4444",
          unit: "°C",
          yAxisDomain: [
            Math.min(minThreshold || 10, Math.min(...data.map((item) => item.value)) - 5),
            Math.max(maxThreshold || 40, Math.max(...data.map((item) => item.value)) + 5),
          ],
        };
      case "humidity":
        return {
          title: "Humidity History",
          color: "#3B82F6",
          unit: "%",
          yAxisDomain: [
            Math.min(minThreshold || 0, Math.min(...data.map((item) => item.value)) - 5),
            Math.max(maxThreshold || 100, Math.max(...data.map((item) => item.value)) + 5),
          ],
        };
      case "sound":
        return {
          title: "Sound Level History",
          color: "#8B5CF6",
          unit: "dB",
          yAxisDomain: [
            0,
            Math.max(maxThreshold || 100, Math.max(...data.map((item) => item.value)) + 10),
          ],
        };
      default:
        return {
          title: "Sensor History",
          color: "#6B7280",
          unit: "",
          yAxisDomain: [0, 100],
        };
    }
  };

  const config = getChartConfig();

  // Custom tooltip to display alert status
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const reading = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-sm">{`${config.title.split(" ")[0]}: ${reading.value}${config.unit}`}</p>
          {reading.isAlert && (
            <p className="text-red-500 text-sm">⚠️ Alert triggered</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Show only a subset of hours on xAxis to avoid crowding
  const tickFormatter = (time: string, index: number) => {
    return index % 12 === 0 ? time : "";
  };

  return (
    <Card className="w-full h-full bg-white rounded-3xl shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tickFormatter={tickFormatter}
                tick={{ fontSize: 10 }}
                tickMargin={8}
              />
              <YAxis 
                domain={config.yAxisDomain} 
                tick={{ fontSize: 10 }}
                tickMargin={8}
                unit={config.unit}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: config.color }}
                name={config.title.split(" ")[0]}
              />
              {minThreshold !== undefined && type !== "sound" && (
                <Line
                  type="monotone"
                  dataKey={() => minThreshold}
                  stroke="#9CA3AF"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                  name={`Min Threshold (${minThreshold}${config.unit})`}
                />
              )}
              {maxThreshold !== undefined && (
                <Line
                  type="monotone"
                  dataKey={() => maxThreshold}
                  stroke="#9CA3AF"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                  name={`Max Threshold (${maxThreshold}${config.unit})`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorChart;
