import React from "react";
import { Toaster } from "@/components/ui/toaster";

/**
 * Component that renders toast notifications for the application
 * Modified to always show notifications regardless of authentication status
 */
const AuthenticatedToasts: React.FC = () => {
  // Always render the Toaster regardless of authentication status
  // This ensures notifications are always visible
  return <Toaster />;
};

export default AuthenticatedToasts;
