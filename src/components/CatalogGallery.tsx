import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ImageListItemBar from "@mui/material/ImageListItemBar";

import {
  CATALOG_GALLERY_GAP_PX,
  CATALOG_GALLERY_ITEM_WIDTH_PX,
  catalogGalleryPosterHeightPx,
} from "@/lib/catalog/galleryLayout";

export interface CatalogGalleryItem {
  id: string;
  title: string;
  meta: string;
  posterUrl?: string;
}

export interface CatalogGalleryProps {
  label: string;
  items: readonly CatalogGalleryItem[];
  onOpen: (id: string) => void;
}

const posterWidth = CATALOG_GALLERY_ITEM_WIDTH_PX;
const posterHeight = catalogGalleryPosterHeightPx();

export function CatalogGallery({ label, items, onOpen }: CatalogGalleryProps) {
  return (
    <Box
      component="ul"
      aria-label={label}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `${CATALOG_GALLERY_GAP_PX}px`,
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {items.map((item) => (
        <Box
          component="li"
          key={item.id}
          sx={{
            flex: `0 0 ${posterWidth}px`,
            width: posterWidth,
          }}
        >
          <ButtonBase
            onClick={() => onOpen(item.id)}
            sx={{
              display: "block",
              width: "100%",
              textAlign: "left",
              color: "inherit",
            }}
          >
            <Box
              sx={{
                overflow: "hidden",
                borderRadius: 3,
                width: posterWidth,
                height: posterHeight,
              }}
            >
              {item.posterUrl ? (
                <Box
                  component="img"
                  src={item.posterUrl}
                  alt={item.title}
                  loading="lazy"
                  sx={{
                    display: "block",
                    width: posterWidth,
                    height: posterHeight,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  aria-hidden
                  sx={{
                    width: posterWidth,
                    height: posterHeight,
                    bgcolor: "action.hover",
                  }}
                />
              )}
            </Box>
            <ImageListItemBar title={item.title} subtitle={item.meta} position="below" />
          </ButtonBase>
        </Box>
      ))}
    </Box>
  );
}
