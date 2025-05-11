
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.205b6401bd3147128197ae3158cbf9c5',
  appName: 'sleepy-dream-nursery-watch',
  webDir: 'dist',
  server: {
    url: 'https://205b6401-bd31-4712-8197-ae3158cbf9c5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#FDF2F8", // Pink-50 from Tailwind
      androidSplashResourceName: "splash"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
