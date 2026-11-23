import { createTheme, ThemeProvider } from "@mui/material/styles";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CatalogGallery } from "@/components/CatalogGallery";
import {
  CATALOG_GALLERY_ITEM_WIDTH_PX,
  catalogGalleryPosterHeightPx,
} from "@/lib/catalog/galleryLayout";

const theme = createTheme();

function renderGallery() {
  return render(
    <ThemeProvider theme={theme}>
      <CatalogGallery
        label="Videos"
        items={[
          {
            id: "v1",
            title: "Demo Video",
            meta: "id v1",
            posterUrl: "/fixtures/poster-demo.svg",
          },
        ]}
        onOpen={vi.fn()}
      />
    </ThemeProvider>,
  );
}

describe("CatalogGallery", () => {
  it("lays out fixed-size 16:9 posters in a flex wrap row", () => {
    renderGallery();
    const gallery = screen.getByRole("list", { name: "Videos" });
    expect(getComputedStyle(gallery).display).toBe("flex");
    expect(getComputedStyle(gallery).flexWrap).toBe("wrap");

    const item = within(gallery).getByRole("listitem");
    expect(getComputedStyle(item).flexGrow).toBe("0");
    expect(getComputedStyle(item).flexShrink).toBe("0");
    expect(getComputedStyle(item).width).toBe(`${CATALOG_GALLERY_ITEM_WIDTH_PX}px`);

    const poster = within(gallery).getByRole("img", { name: "Demo Video" });
    expect(getComputedStyle(poster).width).toBe(`${CATALOG_GALLERY_ITEM_WIDTH_PX}px`);
    expect(getComputedStyle(poster).height).toBe(`${catalogGalleryPosterHeightPx()}px`);
  });
});
