import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotification } from "@/contexts/NotificationContext";

// Local helper functions
const isBrowserNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

const NotificationPermission: React.FC = () => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const { updateSettings } = useNotification();

  useEffect(() => {
    // Check current permission state on component mount
    if (isBrowserNotificationSupported()) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isBrowserNotificationSupported()) {
      alert("This browser does not support desktop notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission === "granted") {
        // Enable notifications in settings
        updateSettings({ enabled: true, type: 'browser' });
        
        // Show a test notification
        new Notification("Baby Monitor Notifications Enabled", {
          body: "You will now receive notifications when sensor readings exceed thresholds.",
          icon: "/favicon.ico"
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  if (permissionState === "granted") {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-700 flex items-center">
            <Bell className="mr-2" size={18} />
            Notifications Enabled
          </CardTitle>
          <CardDescription className="text-green-600">
            You will receive browser notifications when sensor readings exceed thresholds
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BellOff className="mr-2" size={18} />
          Enable Notifications
        </CardTitle>
        <CardDescription>
          Allow browser notifications to get alerts when your baby's environment changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={requestPermission}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
        >
          Enable Browser Notifications
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPermission;
