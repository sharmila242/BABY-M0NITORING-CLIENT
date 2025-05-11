import React, { useState, useEffect } from "react";
import { X, Thermometer, Droplets, Volume2, Bell } from "lucide-react";
import { NotificationLog } from "@/types/notification";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNotificationProps {
  notification: NotificationLog;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const MobileNotification: React.FC<MobileNotificationProps> = ({
  notification,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow exit animation to complete
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  const getIcon = () => {
    switch (notification.sensor) {
      case "temperature":
        return <Thermometer size={20} className="text-red-500" />;
      case "humidity":
        return <Droplets size={20} className="text-blue-500" />;
      case "sound":
        return <Volume2 size={20} className="text-purple-500" />;
      default:
        return <Bell size={20} className="text-orange-500" />;
    }
  };

  const getTitle = () => {
    switch (notification.sensor) {
      case "temperature":
        return `Temperature Alert: ${notification.value}°C`;
      case "humidity":
        return `Humidity Alert: ${notification.value}%`;
      case "sound":
        return `Sound Alert: ${notification.value} dB`;
      default:
        return "Alert";
    }
  };

  const getMessage = () => {
    switch (notification.sensor) {
      case "temperature":
        return notification.value > notification.threshold 
          ? `Above maximum threshold (${notification.threshold}°C)`
          : `Below minimum threshold (${notification.threshold}°C)`;
      case "humidity":
        return notification.value > notification.threshold 
          ? `Above maximum threshold (${notification.threshold}%)`
          : `Below minimum threshold (${notification.threshold}%)`;
      case "sound":
        return `Above maximum threshold (${notification.threshold} dB)`;
      default:
        return "Threshold exceeded";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 mx-auto my-2 max-w-sm"
        >
          <div className="mx-4 overflow-hidden">
            {/* Android-style notification */}
            <div className="bg-gray-900/90 backdrop-blur-sm text-white rounded-md shadow-xl border border-gray-700">
              <div className="flex items-start p-3">
                <div className="flex-shrink-0 mr-3">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-medium text-gray-300">Baby Monitor</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5">{getTitle()}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{getMessage()}</p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white focus:outline-none"
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onClose, 300);
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNotification;
