import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const RENDER_API_ORIGIN = "https://e-commerce-2-zpg7.onrender.com";

export default defineConfig({
  vite: {
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: RENDER_API_ORIGIN,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  },
});
