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

  it("packs as many items as fit with no upper column cap", () => {
    expect(catalogGalleryColumnsForWidth(4 * w + 3 * g)).toBe(4);
    expect(catalogGalleryColumnsForWidth(5 * w + 4 * g)).toBe(5);
    expect(catalogGalleryColumnsForWidth(8 * w + 7 * g)).toBe(8);
  });

  it("drops to three, then two, then one as the row narrows", () => {
    expect(catalogGalleryColumnsForWidth(3 * w + 2 * g)).toBe(3);
    expect(catalogGalleryColumnsForWidth(2 * w + g)).toBe(2);
    expect(catalogGalleryColumnsForWidth(w)).toBe(1);
  });

  it("still shows one column when the container is narrower than an item", () => {
    expect(catalogGalleryColumnsForWidth(w - 40)).toBe(1);
    expect(catalogGalleryColumnsForWidth(0)).toBe(1);
  });
});
