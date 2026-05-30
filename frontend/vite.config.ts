import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const LOCAL_API_ORIGIN = "http://localhost:5000";

export default defineConfig({
  vite: {
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: LOCAL_API_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
