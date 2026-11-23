import { describe, expect, it } from "vitest";

import {
  STAGE_ASPECT_RATIO,
  availableStageHeight,
  fitStageSize,
} from "../lib/playback/fitStageSize";

describe("fitStageSize", () => {
  it("uses full width when the resulting height still fits", () => {
    // 800×450 at 16:9; 450 < 500 available
    expect(fitStageSize(800, 500)).toEqual({ width: 800, height: 450 });
  });

  it("shrinks width when full-width height would exceed the available height", () => {
    // Full width 1600 → height 900, but only 450 tall → width 800
    expect(fitStageSize(1600, 450)).toEqual({ width: 800, height: 450 });
  });

  it("returns zeros when either dimension is non-positive", () => {
    expect(fitStageSize(0, 500)).toEqual({ width: 0, height: 0 });
    expect(fitStageSize(800, 0)).toEqual({ width: 0, height: 0 });
    expect(fitStageSize(-1, 500)).toEqual({ width: 0, height: 0 });
  });

  it("honors a custom aspect ratio", () => {
    expect(fitStageSize(400, 400, 4 / 3)).toEqual({ width: 400, height: 300 });
    expect(fitStageSize(800, 300, 4 / 3)).toEqual({ width: 400, height: 300 });
  });

  it("exports the default 16:9 stage ratio", () => {
    expect(STAGE_ASPECT_RATIO).toBe(16 / 9);
  });
});

describe("availableStageHeight", () => {
  it("reserves toolbar, gap, and bottom inset below the stage top", () => {
    // viewport 900, stage starts at 100, toolbar 40, gap 16, bottom 24 → 720
    expect(
      availableStageHeight({
        viewportHeight: 900,
        stageTop: 100,
        toolbarHeight: 40,
        toolbarGap: 16,
        bottomInset: 24,
      }),
    ).toBe(720);
  });

  it("never returns a negative height", () => {
    expect(
      availableStageHeight({
        viewportHeight: 200,
        stageTop: 180,
        toolbarHeight: 40,
        toolbarGap: 16,
        bottomInset: 24,
      }),
    ).toBe(0);
  });
});
