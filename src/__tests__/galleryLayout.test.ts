import { describe, expect, it } from "vitest";

import {
  CATALOG_GALLERY_GAP_PX,
  CATALOG_GALLERY_ITEM_WIDTH_PX,
  catalogGalleryColumnsForWidth,
  catalogGalleryPosterHeightPx,
} from "../lib/catalog/galleryLayout";

describe("catalogGalleryPosterHeightPx", () => {
  it("keeps a 16:9 poster for the fixed item width", () => {
    expect(catalogGalleryPosterHeightPx()).toBe(CATALOG_GALLERY_ITEM_WIDTH_PX / (16 / 9));
    expect(catalogGalleryPosterHeightPx(320)).toBe(180);
  });
});

describe("catalogGalleryColumnsForWidth", () => {
  const w = CATALOG_GALLERY_ITEM_WIDTH_PX;
  const g = CATALOG_GALLERY_GAP_PX;

  it("fits four items on a wide content row", () => {
    expect(catalogGalleryColumnsForWidth(4 * w + 3 * g)).toBe(4);
  });

  it("fits three, then two, then one as the row narrows", () => {
    expect(catalogGalleryColumnsForWidth(3 * w + 2 * g)).toBe(3);
    expect(catalogGalleryColumnsForWidth(2 * w + g)).toBe(2);
    expect(catalogGalleryColumnsForWidth(w)).toBe(1);
  });

  it("still shows one column when the container is narrower than an item", () => {
    expect(catalogGalleryColumnsForWidth(w - 40)).toBe(1);
    expect(catalogGalleryColumnsForWidth(0)).toBe(1);
  });
});
