import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import MobileNotification from "./MobileNotification";
import { NotificationLog } from "@/types/notification";

interface NotificationStackProps {
  notifications: NotificationLog[];
  onClose: (id: string) => void;
  maxVisible?: number;
}

const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  onClose,
  maxVisible = 3,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create a container for the portal if it doesn't exist
    let container = document.getElementById("notification-portal");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-portal";
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    // Clean up on unmount
    return () => {
      if (container && container.parentElement) {
        container.parentElement.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer) return null;

  // Only show the most recent notifications up to maxVisible
  const visibleNotifications = notifications.slice(0, maxVisible);

  return createPortal(
    <div className="notification-stack" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}>
      {visibleNotifications.map((notification, index) => (
        <div 
          key={notification.id}
          style={{ 
            position: "relative", 
            top: `${index * 4}px`,
            marginBottom: index === visibleNotifications.length - 1 ? 0 : "-65px", // Stack them with slight overlap
            zIndex: 9999 - index
          }}
        >
          <MobileNotification
            notification={notification}
            onClose={() => onClose(notification.id)}
            autoCloseTime={5000 + (index * 1000)} // Stagger the auto-close times
          />
        </div>
      ))}
    </div>,
    portalContainer
  );
};

export default NotificationStack;
