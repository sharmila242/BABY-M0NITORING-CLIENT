
import React, { createContext, useContext, useState, useEffect } from "react";
import { NotificationSettings, NotificationLog, NotificationType } from "@/types/notification";
import { useSensor } from "@/contexts/SensorContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import NotificationStack from "@/components/NotificationStack";

interface NotificationContextType {
  settings: NotificationSettings;
  notificationLogs: NotificationLog[];
  activeNotifications: NotificationLog[];
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  sendTestNotification: () => Promise<boolean>;
  clearLogs: () => void;
  dismissNotification: (id: string) => void;
  isBrowserNotificationSupported: () => boolean;
  isBrowserNotificationPermitted: () => boolean;
}

// Default notification settings
const defaultSettings: NotificationSettings = {
  enabled: false,
  type: 'app',
  temperature: true,
  humidity: true,
  sound: true,
  contact: '',
  cooldown: 1, // 15 minutes between notifications
};

// Check if browser notifications are supported
const isBrowserNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Check if browser notifications are permitted
const isBrowserNotificationPermitted = () => {
  return isBrowserNotificationSupported() && Notification.permission === 'granted';
};

// Export these functions as part of the context to maintain compatibility with HMR

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('babyMonitor_notificationSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    // Load logs from localStorage if available
    const savedLogs = localStorage.getItem('babyMonitor_notificationLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // State for active notifications that will be displayed in the mobile-style UI
  const [activeNotifications, setActiveNotifications] = useState<NotificationLog[]>([]);

  const { currentData, thresholds } = useSensor();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('babyMonitor_notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('babyMonitor_notificationLogs', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  // Listen for custom sensor-alert events for testing
  useEffect(() => {
    const handleSensorAlert = (event: CustomEvent) => {
      const { notification, message } = event.detail;
      if (settings.enabled) {
        sendNotification(
          message,
          settings.type,
          notification.sensor,
          notification.value,
          notification.threshold
        );
      }
    };

    // Add event listener
    window.addEventListener('sensor-alert', handleSensorAlert as EventListener);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('sensor-alert', handleSensorAlert as EventListener);
    };
  }, [settings]);

  // Function to update notification settings
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    if (isAuthenticated) {
      toast({
        title: "Notification Settings Updated",
        description: "Your alert notification preferences have been saved.",
      });
    }
  };

  // Check sensor readings and send notifications if thresholds are exceeded
  useEffect(() => {
    if (!settings.enabled || !currentData || !thresholds || !isAuthenticated) return;

    const checkAndNotify = async () => {
      const now = new Date();
      const lastNotified = settings.lastNotified ? new Date(settings.lastNotified) : new Date(0);
      const cooldownInMs = settings.cooldown * 60 * 1000;
      
      // Check if we're still in cooldown period
      if (now.getTime() - lastNotified.getTime() < cooldownInMs) return;

      // Check each sensor against its threshold
      let shouldNotify = false;
      let notificationMessage = 'Alert: ';
      let alertType: 'temperature' | 'humidity' | 'sound' | null = null;
      let alertValue = 0;
      let thresholdValue = 0;

      if (settings.temperature && currentData.temperature.isAlert) {
        shouldNotify = true;
        notificationMessage += `Temperature (${currentData.temperature.value}°C) `;
        if (currentData.temperature.value > thresholds.temperature.max) {
          notificationMessage += `above maximum (${thresholds.temperature.max}°C). `;
          thresholdValue = thresholds.temperature.max;
        } else {
          notificationMessage += `below minimum (${thresholds.temperature.min}°C). `;
          thresholdValue = thresholds.temperature.min;
        }
        alertType = 'temperature';
        alertValue = currentData.temperature.value;
      }
      
      if (settings.humidity && currentData.humidity.isAlert) {
        shouldNotify = true;
        notificationMessage += `Humidity (${currentData.humidity.value}%) `;
        if (currentData.humidity.value > thresholds.humidity.max) {
          notificationMessage += `above maximum (${thresholds.humidity.max}%). `;
          thresholdValue = thresholds.humidity.max;
        } else {
          notificationMessage += `below minimum (${thresholds.humidity.min}%). `;
          thresholdValue = thresholds.humidity.min;
        }
        alertType = 'humidity';
        alertValue = currentData.humidity.value;
      }
      
      if (settings.sound && currentData.sound.isAlert) {
        shouldNotify = true;
        notificationMessage += `Sound level (${currentData.sound.value}dB) above maximum (${thresholds.sound.max}dB). `;
        alertType = 'sound';
        alertValue = currentData.sound.value;
        thresholdValue = thresholds.sound.max;
      }

      if (shouldNotify && alertType) {
        // Send notification
        await sendNotification(notificationMessage, settings.type, alertType, alertValue, thresholdValue);
        
        // Update last notified time
        setSettings(prev => ({
          ...prev,
          lastNotified: now.toISOString()
        }));
      }
    };

    // Run the check immediately and then every 30 seconds
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30000);
    
    return () => clearInterval(interval);
  }, [currentData, settings.enabled, thresholds, isAuthenticated]);

  // Function to send notifications based on type
  const sendNotification = async (
    message: string, 
    type: NotificationType, 
    sensor: 'temperature' | 'humidity' | 'sound',
    value: number,
    threshold: number
  ) => {
    if (!isAuthenticated) return;

    const newLog: NotificationLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      sensor,
      value,
      threshold,
      contact: settings.contact,
      delivered: false,
    };

    try {
      if (type === 'app') {
        // Local app notification
        toast({
          title: "Baby Monitor Alert",
          description: message,
          variant: "destructive",
        });
        
        // Add to active notifications for mobile-style display
        setActiveNotifications(prev => [newLog, ...prev]);
        
        newLog.delivered = true;
      } 
      else if (type === 'browser') {
        // Browser notification
        if (isBrowserNotificationPermitted()) {
          // Create title based on sensor type
          let title = "Baby Monitor Alert";
          let icon = "/favicon.ico";
          
          switch (sensor) {
            case 'temperature':
              title = `Temperature Alert: ${value}°C`;
              break;
            case 'humidity':
              title = `Humidity Alert: ${value}%`;
              break;
            case 'sound':
              title = `Sound Alert: ${value} dB`;
              break;
          }
          
          // Send browser notification
          const notification = new Notification(title, {
            body: message,
            icon: icon,
            tag: `baby-monitor-${sensor}`, // Tag to replace existing notifications of same type
            requireInteraction: true // Keep notification visible until user interacts with it
          });
          
          // Handle notification click
          notification.onclick = () => {
            // Focus on window when notification is clicked
            window.focus();
            notification.close();
          };
          
          newLog.delivered = true;
        } else {
          console.warn("Browser notifications not permitted");
          // Fallback to app notification if browser notifications not permitted
          toast({
            title: "Baby Monitor Alert",
            description: message,
            variant: "destructive",
          });
          
          setActiveNotifications(prev => [newLog, ...prev]);
          newLog.delivered = true;
        }
      }
      else if (type === 'email' && settings.contact) {
        // Mock email sending - in a real app, this would call an API
        console.log(`MOCK: Sending email to ${settings.contact} with message: ${message}`);
        // In a production app, this would be:
        // await emailService.send(settings.contact, "Baby Monitor Alert", message);
        newLog.delivered = true;
      } 
      else if (type === 'sms' && settings.contact) {
        // Mock SMS sending - in a real app, this would call an API
        console.log(`MOCK: Sending SMS to ${settings.contact} with message: ${message}`);
        // In a production app, this would be:
        // await smsService.send(settings.contact, message);
        newLog.delivered = true;
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      newLog.error = error instanceof Error ? error.message : "Unknown error";
    }

    // Add to notification log
    setNotificationLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  // Function to send a test notification
  const sendTestNotification = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    // Validate contact info for email/SMS notifications
    if (!settings.contact && (settings.type === 'email' || settings.type === 'sms')) {
      toast({
        title: "Configuration Error",
        description: `Please provide a valid ${settings.type === 'email' ? 'email address' : 'phone number'} for test ${settings.type} notifications.`,
        variant: "destructive",
      });
      return false;
    }

    // For browser notifications, check if permission is granted
    if (settings.type === 'browser' && !isBrowserNotificationPermitted()) {
      toast({
        title: "Permission Required",
        description: "You need to grant notification permission to receive browser notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Send a test notification with sample data
      await sendNotification(
        "This is a test notification from your Baby Monitor app.", 
        settings.type,
        'temperature',
        25,
        30
      );
      
      // Only show toast for non-browser notifications (to avoid duplicate notifications)
      if (settings.type !== 'browser') {
        toast({
          title: "Test Notification Sent",
          description: `A test notification has been sent via ${settings.type}.`,
        });
      }
      return true;
    } catch (error) {
      console.error("Failed to send test notification:", error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification. Please check your settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to clear notification logs
  const clearLogs = () => {
    setNotificationLogs([]);
    setActiveNotifications([]);
    
    if (isAuthenticated) {
      toast({
        title: "Logs Cleared",
        description: "Notification logs have been cleared.",
      });
    }
  };

  // Function to dismiss a specific notification from the active list
  const dismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        settings, 
        notificationLogs,
        activeNotifications,
        updateSettings, 
        sendTestNotification,
        clearLogs,
        dismissNotification,
        isBrowserNotificationSupported,
        isBrowserNotificationPermitted
      }}
    >
      {children}
      {/* Render the notification stack for mobile-style notifications */}
      {activeNotifications.length > 0 && (
        <NotificationStack 
          notifications={activeNotifications}
          onClose={dismissNotification}
          maxVisible={3}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
