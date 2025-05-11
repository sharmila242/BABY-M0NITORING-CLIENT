import React from "react";
import AppHeader from "@/components/AppHeader";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Trash2, BellRing } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notifications: React.FC = () => {
  const { notificationLogs, clearLogs } = useNotification();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <AppHeader title="Alert History" subtitle="View your recent in-app alerts" />

      <main className="flex-1 px-4 py-6 pb-20">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Alert History
            </h3>
            {notificationLogs.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearLogs}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 border-red-200"
              >
                <Trash2 size={14} /> Clear History
              </Button>
            )}
          </div>

          {notificationLogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <BellRing size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No alert history yet</p>
              <p className="text-gray-400 text-sm">In-app alerts will appear here when triggered</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificationLogs.map((log) => (
                <Alert key={log.id} className={`rounded-xl border-l-4 ${log.delivered ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex justify-between">
                    <div className="flex items-start gap-2">
                      {log.delivered ? (
                        <CheckCircle size={18} className="text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                      )}
                      <div>
                        <AlertTitle className="flex items-center gap-2">
                          {log.sensor === 'temperature' && 'Temperature Alert'}
                          {log.sensor === 'humidity' && 'Humidity Alert'}
                          {log.sensor === 'sound' && 'Sound Alert'}
                          <span className="text-xs font-normal text-gray-500">
                            via {log.type === 'app' ? 'App' : log.type === 'email' ? 'Email' : 'SMS'}
                          </span>
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          <p>
                            {log.sensor === 'temperature' && `Temperature reading: ${log.value}°C (Threshold: ${log.threshold}°C)`}
                            {log.sensor === 'humidity' && `Humidity reading: ${log.value}% (Threshold: ${log.threshold}%)`}
                            {log.sensor === 'sound' && `Sound level: ${log.value}dB (Threshold: ${log.threshold}dB)`}
                          </p>
                          {log.type !== 'app' && <p className="text-xs text-gray-500">Sent to: {log.contact}</p>}
                          {log.error && <p className="text-xs text-red-500 mt-1">Error: {log.error}</p>}
                        </AlertDescription>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
