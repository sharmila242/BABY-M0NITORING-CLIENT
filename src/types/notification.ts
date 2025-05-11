
export type NotificationType = 'email' | 'sms' | 'app' | 'browser' | 'none';

export interface NotificationSettings {
  enabled: boolean;
  type: NotificationType;
  temperature: boolean;
  humidity: boolean;
  sound: boolean;
  contact: string; // email or phone number
  cooldown: number; // minutes between notifications
  lastNotified?: string; // ISO string timestamp
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: NotificationType;
  sensor: 'temperature' | 'humidity' | 'sound';
  value: number;
  threshold: number;
  contact: string;
  delivered: boolean;
  error?: string;
}
