
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SensorProvider } from "@/contexts/SensorContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { VaccinationProvider } from "@/contexts/VaccinationContext";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import CloudSettings from "@/pages/CloudSettings";
import Notifications from "@/pages/Notifications";
import Vaccination from "@/pages/Vaccination";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthenticatedToasts from "@/components/AuthenticatedToasts";

// Import Google Fonts in index.html
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SensorProvider>
          <NotificationProvider>
            <VaccinationProvider>
              <AuthenticatedToasts />
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="history" element={<History />} />
                      <Route path="alerts" element={<Alerts />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="cloud-settings" element={<CloudSettings />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="vaccination" element={<Vaccination />} />
                    </Route>
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </VaccinationProvider>
          </NotificationProvider>
        </SensorProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
