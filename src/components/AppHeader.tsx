
import React from "react";
import { Baby } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle }) => {
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b bg-gradient-to-r from-babyblue via-babypink to-babymint shadow-sm">
      <div className="flex items-center">
        <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl mr-3 shadow-md">
          <Baby size={isMobile ? 20 : 24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-foreground to-secondary-foreground bg-clip-text text-transparent">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
