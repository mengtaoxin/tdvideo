import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Keep in sync with CONFIGS_CACHE_NAME in src/lib/configs/cache.ts
const CONFIGS_CACHE_NAME = "tdvideo-configs";

const { name: appName, version: appVersion } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { name: string; version: string };

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_NAME__: JSON.stringify(appName),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "fixtures/**/*"],
      manifest: {
        name: "tdvideo",
        short_name: "tdvideo",
        description: "Frontend-only online video player",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        // Precache the app shell and static assets. Omit *.json so configs.json
        // is handled by negotiated runtime caching instead of a revisioned precache.
        globPatterns: ["**/*.{js,css,html,ico,svg,png,webp,woff2,vtt}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // Default `/configs.json` and any URL path ending in configs.json.
            urlPattern: /\/configs\.json(?:\?.*)?$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: CONFIGS_CACHE_NAME,
              networkTimeoutSeconds: 5,
              // Force revalidation so ETag / Last-Modified validators are honored online.
              fetchOptions: {
                cache: "no-cache",
              },
              expiration: {
                maxEntries: 16,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
