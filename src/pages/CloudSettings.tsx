import React, { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { useSensor } from "@/contexts/SensorContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudConfig } from "@/types/sensor";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Save, RefreshCw, Server } from "lucide-react";

const CloudSettings: React.FC = () => {
  const { cloudConfig, isLoading, updateCloudConfiguration } = useSensor();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<CloudConfig>({
    apiKey: "",
    deviceId: "baby-monitor-01",
    refreshInterval: 5000,
    endpoint: "http://localhost:3000/readings",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cloudConfig) {
      setFormValues(cloudConfig);
    }
  }, [cloudConfig]);

  const handleChange = (field: keyof CloudConfig, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate endpoint URL
      try {
        new URL(formValues.endpoint);
      } catch (error) {
        toast({
          title: "Invalid Endpoint URL",
          description: "Please enter a valid URL for the endpoint.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Validate refresh interval
      if (formValues.refreshInterval < 1000) {
        toast({
          title: "Invalid Refresh Interval",
          description: "Refresh interval should be at least 1000ms (1 second).",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await updateCloudConfiguration(formValues);
      toast({
        title: "Cloud Settings Saved",
        description: "Your cloud connection settings have been updated.",
      });
    } catch (error) {
      console.error("Failed to save cloud settings:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your cloud settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setLocalServer = () => {
    setFormValues({
      ...formValues,
      endpoint: "http://localhost:3000/readings",
      deviceId: "baby-monitor-01",
      refreshInterval: 5000,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppHeader title="Cloud Settings" subtitle="Configure IoT connection settings" />

      <main className="flex-1 px-4 py-6 pb-20">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Cloud Connection Configuration
        </h2>

        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-3xl mb-4" />
            <Skeleton className="h-48 rounded-3xl mb-4" />
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-md border-2 border-blue-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2">
                      <Server size={24} className="text-blue-500" />
                    </div>
                    <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      Server Connection
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Configure the connection to your IoT data server
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="endpoint" className="text-gray-700">API Endpoint URL</Label>
                      <Input
                        id="endpoint"
                        type="text"
                        value={formValues.endpoint}
                        onChange={(e) => handleChange("endpoint", e.target.value)}
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                        placeholder="https://api.example.com/readings"
                      />
                      <p className="text-xs text-gray-600">
                        The URL endpoint where sensor data is fetched from
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deviceId" className="text-gray-700">Device ID</Label>
                      <Input
                        id="deviceId"
                        type="text"
                        value={formValues.deviceId}
                        onChange={(e) => handleChange("deviceId", e.target.value)}
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                        placeholder="baby-monitor-01"
                      />
                      <p className="text-xs text-gray-600">
                        The unique identifier for your baby monitor device
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-gray-700">API Key (Optional)</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={formValues.apiKey}
                        onChange={(e) => handleChange("apiKey", e.target.value)}
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                        placeholder="Enter your API key"
                      />
                      <p className="text-xs text-gray-600">
                        Authentication key for accessing the API (if required)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval" className="text-gray-700">Refresh Interval (ms)</Label>
                      <Input
                        id="refreshInterval"
                        type="number"
                        value={formValues.refreshInterval}
                        onChange={(e) => handleChange("refreshInterval", parseInt(e.target.value))}
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                        min="1000"
                        step="1000"
                      />
                      <p className="text-xs text-gray-600">
                        How often to fetch new data (in milliseconds)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-white rounded-3xl shadow-md border-2 border-cyan-100 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2">
                      <Cloud size={24} className="text-cyan-500" />
                    </div>
                    <CardTitle className="text-xl font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                      Quick Setup
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Quickly set up connection to local test server
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Button
                    type="button"
                    onClick={setLocalServer}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Server size={16} className="mr-2" /> Connect to Local Test Server
                  </Button>
                  <p className="text-xs text-gray-600 mt-2">
                    This will set up the connection to your local test server running at http://localhost:3000
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all"
                onClick={() => setFormValues(cloudConfig || formValues)}
                disabled={isLoading || isSaving}
              >
                <RefreshCw size={16} className="mr-2" /> Reset
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
                disabled={isLoading || isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" /> Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default CloudSettings;
