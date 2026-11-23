import { describe, expect, it } from "vitest";

import { fitVisibleCount } from "../lib/nav/fitVisibleCount";

describe("fitVisibleCount", () => {
  it("returns all items when they fit without a More control", () => {
    expect(fitVisibleCount([40, 50, 60], 200, 48)).toBe(3);
  });

  it("reserves More width and hides trailing items as space shrinks", () => {
    // All three need 150; two + More need 40+50+48 = 138; one + More = 88
    expect(fitVisibleCount([40, 50, 60], 138, 48)).toBe(2);
    expect(fitVisibleCount([40, 50, 60], 137, 48)).toBe(1);
    expect(fitVisibleCount([40, 50, 60], 87, 48)).toBe(0);
  });

  it("accounts for gaps between visible items and More", () => {
    // two items 40+50 + gap 8 = 98; + gap + more 48 = 154
    expect(fitVisibleCount([40, 50, 60], 154, 48, 8)).toBe(2);
    expect(fitVisibleCount([40, 50, 60], 153, 48, 8)).toBe(1);
  });
});
