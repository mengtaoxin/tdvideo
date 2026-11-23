import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      setupFiles: ["./src/__tests__/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/**/__tests__/**", "src/main.tsx", "src/routeTree.gen.ts", "src/locales/**"],
        thresholds: {
          lines: 50,
          branches: 50,
          functions: 50,
          statements: 50,
        },
      },
    },
  }),
);
