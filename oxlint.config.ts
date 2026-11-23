import { stack } from "@mengtaoxin/oxc-config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: stack("react"),
  // Empty array = do not re-add default plugins on top of the preset.
  plugins: [],
  ignorePatterns: ["dist", "coverage", "playwright-report", "test-results", "src/routeTree.gen.ts"],
  overrides: [
    {
      files: ["**/__tests__/**"],
      rules: {
        "react/only-export-components": "off",
      },
    },
    {
      files: ["e2e/**"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
});
