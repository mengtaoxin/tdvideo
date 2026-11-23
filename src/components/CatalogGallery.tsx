import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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

export function CatalogGallery({ label, items, onOpen }: CatalogGalleryProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const cols = isMdUp ? 3 : isSmUp ? 2 : 1;

  return (
    <ImageList cols={cols} gap={16} aria-label={label} sx={{ margin: 0 }}>
      {items.map((item) => (
        <ImageListItem key={item.id}>
          <ButtonBase
            onClick={() => onOpen(item.id)}
            sx={{
              display: "block",
              width: "100%",
              textAlign: "left",
              color: "inherit",
            }}
          >
            <Box sx={{ overflow: "hidden", borderRadius: 3, width: "100%" }}>
              {item.posterUrl ? (
                <Box
                  component="img"
                  src={item.posterUrl}
                  alt={item.title}
                  loading="lazy"
                  sx={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  aria-hidden
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    bgcolor: "action.hover",
                  }}
                />
              )}
            </Box>
            <ImageListItemBar title={item.title} subtitle={item.meta} position="below" />
          </ButtonBase>
        </ImageListItem>
      ))}
    </ImageList>
  );
}
