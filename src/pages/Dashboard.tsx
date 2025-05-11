
import React, { useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import SensorCard from "@/components/SensorCard";
import { useSensor } from "@/contexts/SensorContext";
import { Button } from "@/components/ui/button";
import { RefreshCw, Baby, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { currentData, thresholds, isLoading, error, refreshData } = useSensor();
  const { toast } = useToast();

  useEffect(() => {
    // Initial data fetch
    refreshData();
    
    // Show toast if there's an error with the real-time connection
    if (error) {
      toast({
        title: "Connection Issue",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <AppHeader 
        title="Baby Monitor" 
        subtitle="Real-time environment data" 
      />
      
      <main className="flex-1 px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Baby size={28} className="text-primary" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Current Readings</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1 rounded-full border-2 border-primary shadow-sm hover:shadow-md transition-all"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-center gap-2">
              <WifiOff size={20} className="text-red-500" />
              <p className="text-red-500 font-medium">{error}</p>
            </div>
            <p className="text-sm text-red-400 mt-1">
              Please check your API endpoint and connection settings.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading || !currentData || !thresholds ? (
            <>
              <Skeleton className="h-48 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
            </>
          ) : (
            <>
              <SensorCard
                type="temperature"
                reading={currentData.temperature}
                minThreshold={thresholds.temperature.min}
                maxThreshold={thresholds.temperature.max}
              />
              <SensorCard
                type="humidity"
                reading={currentData.humidity}
                minThreshold={thresholds.humidity.min}
                maxThreshold={thresholds.humidity.max}
              />
              <SensorCard
                type="sound"
                reading={currentData.sound}
                maxThreshold={thresholds.sound.max}
              />
            </>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">System Status</h3>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-5 shadow-md border-2 border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-600 font-medium">Connection</span>
              {currentData && currentData.connectionStatus === 'connected' ? (
                <span className="text-green-500 font-medium flex items-center">
                  <span className="bg-green-500 h-3 w-3 rounded-full mr-2 animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="text-red-500 font-medium flex items-center">
                  <span className="bg-red-500 h-3 w-3 rounded-full mr-2"></span>
                  Disconnected
                </span>
              )}
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
              <span className="text-gray-600 font-medium">Last Update</span>
              <span className="text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {currentData ? new Date(currentData.temperature.timestamp).toLocaleTimeString() : "--:--:--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Alert Status</span>
              <span className={`font-medium px-3 py-1 rounded-full text-sm ${(currentData?.temperature.isAlert || currentData?.humidity.isAlert || currentData?.sound.isAlert) ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"}`}>
                {(currentData?.temperature.isAlert || currentData?.humidity.isAlert || currentData?.sound.isAlert) ? "Active Alerts" : "All Normal"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
