import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api/quote': {
        target: 'https://quote-api.jup.ag/v6',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quote/, '/quote'),
        secure: false,
        ws: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url);
          });
        },
      },
      '/api/swap': {
        target: 'https://quote-api.jup.ag/v6',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/swap/, '/swap'),
        secure: false,
        ws: false,
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