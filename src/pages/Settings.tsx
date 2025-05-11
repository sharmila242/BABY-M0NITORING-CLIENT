
import React, { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { useSensor } from "@/contexts/SensorContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Thermometer, Droplets, Volume2, Save, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SensorThresholds } from "@/types/sensor";
import { Skeleton } from "@/components/ui/skeleton";

const Settings: React.FC = () => {
  const { thresholds, isLoading, updateSensorThresholds } = useSensor();
  const [formValues, setFormValues] = useState<SensorThresholds>({
    temperature: { min: 18, max: 30 },
    humidity: { min: 30, max: 60 },
    sound: { max: 70 },
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (thresholds) {
      setFormValues(thresholds);
    }
  }, [thresholds]);

  const handleChange = (
    sensorType: "temperature" | "humidity" | "sound",
    field: "min" | "max",
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setFormValues((prev) => ({
      ...prev,
      [sensorType]: {
        ...prev[sensorType],
        [field]: numValue,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate ranges
      if (formValues.temperature.min >= formValues.temperature.max) {
        toast({
          title: "Invalid Temperature Range",
          description: "Minimum temperature must be less than maximum.",
          variant: "destructive",
        });
        return;
      }

      if (formValues.humidity.min >= formValues.humidity.max) {
        toast({
          title: "Invalid Humidity Range",
          description: "Minimum humidity must be less than maximum.",
          variant: "destructive",
        });
        return;
      }

      await updateSensorThresholds(formValues);
      toast({
        title: "Settings Saved",
        description: "Your threshold settings have been updated.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <AppHeader title="Settings" subtitle="Manage sensor thresholds and alerts" />

      <main className="flex-1 px-4 py-6 pb-20">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Alert Thresholds</h2>

        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-3xl mb-4" />
            <Skeleton className="h-48 rounded-3xl mb-4" />
            <Skeleton className="h-48 rounded-3xl" />
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-babyblue to-white rounded-3xl shadow-md border-2 border-blue-100 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2">
                      <Thermometer size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Temperature</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempMin" className="text-gray-700">Minimum (°C)</Label>
                      <Input
                        id="tempMin"
                        type="number"
                        value={formValues.temperature.min}
                        onChange={(e) =>
                          handleChange("temperature", "min", e.target.value)
                        }
                        step="0.1"
                        className="rounded-xl border-2 focus:border-red-200 focus:ring-red-100"
                      />
                      <p className="text-xs text-gray-600">
                        Alert if below this value
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempMax" className="text-gray-700">Maximum (°C)</Label>
                      <Input
                        id="tempMax"
                        type="number"
                        value={formValues.temperature.max}
                        onChange={(e) =>
                          handleChange("temperature", "max", e.target.value)
                        }
                        step="0.1"
                        className="rounded-xl border-2 focus:border-red-200 focus:ring-red-100"
                      />
                      <p className="text-xs text-gray-600">
                        Alert if above this value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-babymint to-white rounded-3xl shadow-md border-2 border-green-100 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2">
                      <Droplets size={24} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">Humidity</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="humidMin" className="text-gray-700">Minimum (%)</Label>
                      <Input
                        id="humidMin"
                        type="number"
                        value={formValues.humidity.min}
                        onChange={(e) =>
                          handleChange("humidity", "min", e.target.value)
                        }
                        step="1"
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                      />
                      <p className="text-xs text-gray-600">
                        Alert if below this value
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="humidMax" className="text-gray-700">Maximum (%)</Label>
                      <Input
                        id="humidMax"
                        type="number"
                        value={formValues.humidity.max}
                        onChange={(e) =>
                          handleChange("humidity", "max", e.target.value)
                        }
                        step="1"
                        className="rounded-xl border-2 focus:border-blue-200 focus:ring-blue-100"
                      />
                      <p className="text-xs text-gray-600">
                        Alert if above this value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-babylavender to-white rounded-3xl shadow-md border-2 border-purple-100 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-white rounded-full shadow-sm mr-2">
                      <Volume2 size={24} className="text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Sound Level</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="soundMax" className="text-gray-700">Maximum (dB)</Label>
                      <Input
                        id="soundMax"
                        type="number"
                        value={formValues.sound.max}
                        onChange={(e) =>
                          handleChange("sound", "max", e.target.value)
                        }
                        step="1"
                        className="rounded-xl border-2 focus:border-purple-200 focus:ring-purple-100"
                      />
                      <p className="text-xs text-gray-600">
                        Alert if above this value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                className="rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all"
                onClick={() => setFormValues(thresholds || formValues)}
                disabled={isLoading || isSaving}
              >
                <RefreshCw size={16} className="mr-2" /> Reset
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all"
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

export default Settings;
