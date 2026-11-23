/** Fixed poster frame for Videos / Playlists gallery items (16:9). */
export const CATALOG_GALLERY_ASPECT_RATIO = 16 / 9;

/** Item width in px — does not grow or shrink with the container. */
export const CATALOG_GALLERY_ITEM_WIDTH_PX = 280;

/** Gap between flex-wrapped gallery items in px. */
export const CATALOG_GALLERY_GAP_PX = 16;

/** Poster height for a fixed gallery item width at 16:9. */
export function catalogGalleryPosterHeightPx(
  widthPx: number = CATALOG_GALLERY_ITEM_WIDTH_PX,
): number {
  return widthPx / CATALOG_GALLERY_ASPECT_RATIO;
}

/**
 * How many fixed-width gallery items fit in one flex row.
 * Matches CSS `flex-wrap` with `flex: 0 0 width` and a constant gap.
 */
export function catalogGalleryColumnsForWidth(
  containerWidth: number,
  itemWidth: number = CATALOG_GALLERY_ITEM_WIDTH_PX,
  gap: number = CATALOG_GALLERY_GAP_PX,
): number {
  if (containerWidth <= 0 || itemWidth <= 0) {
    return 1;
  }
  return Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
}
