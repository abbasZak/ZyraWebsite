import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api/jupiter': {
        target: 'https://quote-api.jup.ag',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jupiter/, '/v6'),
        secure: false, // Set to false if having SSL issues
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url);
            // Add headers to avoid issues
            proxyReq.setHeader('Origin', 'https://quote-api.jup.ag');
            proxyReq.setHeader('Referer', 'https://quote-api.jup.ag');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Response status:', proxyRes.statusCode);
          });
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});