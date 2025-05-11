
import React, { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import SensorChart from "@/components/SensorChart";
import { useSensor } from "@/contexts/SensorContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const History: React.FC = () => {
  const { historicalData, thresholds, isLoading, refreshData } = useSensor();
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity" | "sound">("temperature");

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader
        title="History"
        subtitle="Environmental readings over time"
      />

      <main className="flex-1 px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sensor History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>

        <Tabs defaultValue="temperature" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="sound">Sound</TabsTrigger>
          </TabsList>

          <div className="h-[400px] w-full">
            {isLoading || !historicalData || !thresholds ? (
              <Skeleton className="h-full w-full rounded-3xl" />
            ) : (
              <>
                <TabsContent value="temperature" className="h-full">
                  <SensorChart
                    data={historicalData.temperature}
                    type="temperature"
                    minThreshold={thresholds.temperature.min}
                    maxThreshold={thresholds.temperature.max}
                  />
                </TabsContent>
                
                <TabsContent value="humidity" className="h-full">
                  <SensorChart
                    data={historicalData.humidity}
                    type="humidity"
                    minThreshold={thresholds.humidity.min}
                    maxThreshold={thresholds.humidity.max}
                  />
                </TabsContent>
                
                <TabsContent value="sound" className="h-full">
                  <SensorChart
                    data={historicalData.sound}
                    type="sound"
                    maxThreshold={thresholds.sound.max}
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Readings Summary</h3>
          <div className="grid grid-cols-1 gap-4">
            {isLoading || !historicalData ? (
              <Skeleton className="h-36 rounded-3xl" />
            ) : (
              <div className="bg-white rounded-3xl p-5 shadow-md">
                <h4 className="font-semibold mb-3">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Statistics</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-r pr-4">
                    <p className="text-gray-600 mb-1">Average</p>
                    <p className="text-2xl font-bold">
                      {historicalData[activeTab].length > 0
                        ? (
                            historicalData[activeTab].reduce(
                              (sum, reading) => sum + reading.value,
                              0
                            ) / historicalData[activeTab].length
                          ).toFixed(1)
                        : "N/A"}
                      {activeTab === "temperature" ? "°C" : activeTab === "humidity" ? "%" : " dB"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-1">Max</p>
                    <p className="text-2xl font-bold">
                      {historicalData[activeTab].length > 0
                        ? Math.max(...historicalData[activeTab].map(reading => reading.value)).toFixed(1)
                        : "N/A"}
                      {activeTab === "temperature" ? "°C" : activeTab === "humidity" ? "%" : " dB"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-3">
                  <p className="text-gray-600">Alert Events</p>
                  <p className="text-xl font-bold">
                    {historicalData[activeTab].filter(reading => reading.isAlert).length} times
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
