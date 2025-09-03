import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Force rollup to use WASM instead of native binaries
process.env.ROLLUP_NO_NATIVE = 'true';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["use-sidecar", "use-callback-ref"],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
}));
