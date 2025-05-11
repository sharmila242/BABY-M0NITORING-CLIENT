import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to disable server startup logs
const silentServerPlugin = () => ({
  name: 'silent-server',
  configureServer(server: any) {
    const originalPrintUrls = server.printUrls;
    server.printUrls = () => {
      // Do nothing, effectively suppressing the "Server is up and running" message
    };
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Suppress Vite's server startup messages
    logger: {
      // This disables all server startup logs
      clearScreen: false,
    },
  },
  // Base path for production deployment
  base: '/',
  plugins: [
    react(),
    silentServerPlugin(), // Add our custom plugin to disable server logs
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
