
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, History, Bell, Settings, AlertTriangle, Syringe } from "lucide-react";

const BottomNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      <div className="flex justify-around items-center h-16 px-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
          end
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
        >
          <History size={20} />
          <span className="text-xs mt-1">History</span>
        </NavLink>
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
        >
          <AlertTriangle size={20} />
          <span className="text-xs mt-1">Alerts</span>
        </NavLink>
        <NavLink
          to="/vaccination"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
        >
          <Syringe size={20} />
          <span className="text-xs mt-1">Vaccines</span>
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
        >
          <Bell size={20} />
          <span className="text-xs mt-1">Notify</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-1/6 py-2 ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-primary transition-colors"
            }`
          }
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNavigation;
