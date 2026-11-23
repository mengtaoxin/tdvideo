/** Default Now Playing media frame (Video.js stage). */
export const STAGE_ASPECT_RATIO = 16 / 9;

/**
 * Fit a fixed-aspect media frame into available width and height.
 * Prefer full width when height allows; otherwise shrink width so height fits.
 */
export function fitStageSize(
  availableWidth: number,
  availableHeight: number,
  aspectRatio: number = STAGE_ASPECT_RATIO,
): { width: number; height: number } {
  if (availableWidth <= 0 || availableHeight <= 0 || aspectRatio <= 0) {
    return { width: 0, height: 0 };
  }

  const heightAtFullWidth = availableWidth / aspectRatio;
  if (heightAtFullWidth <= availableHeight) {
    return { width: availableWidth, height: heightAtFullWidth };
  }

  return {
    width: availableHeight * aspectRatio,
    height: availableHeight,
  };
}

/**
 * Height left for the media frame after reserving toolbar space and bottom inset
 * so the controls stay on-screen below the video.
 */
export function availableStageHeight({
  viewportHeight,
  stageTop,
  toolbarHeight,
  toolbarGap,
  bottomInset,
}: {
  viewportHeight: number;
  stageTop: number;
  toolbarHeight: number;
  toolbarGap: number;
  bottomInset: number;
}): number {
  return Math.max(0, viewportHeight - stageTop - toolbarHeight - toolbarGap - bottomInset);
}
