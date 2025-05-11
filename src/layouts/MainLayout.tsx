
import React from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MainLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout} 
          className="text-gray-600 hover:text-pink-500 hover:bg-pink-50"
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </Button>
      </div>
      <Outlet />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
