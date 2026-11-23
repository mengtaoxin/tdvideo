import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("vercel.json", () => {
  it("rewrites unmatched paths to index.html for SPA deep links", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")) as {
      rewrites?: { source: string; destination: string }[];
    };

    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          destination: "/index.html",
        }),
      ]),
    );
  });
});
