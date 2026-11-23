import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import type { PlaylistConfig, VideoConfig } from "@/lib/configs";

export function PlaylistSidebar({
  playlist,
  videosById,
  currentIndex,
  onSelectIndex,
}: {
  playlist: PlaylistConfig;
  videosById: Map<string, VideoConfig>;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <aside aria-label={t("nowPlaying.playlistSidebar")}>
      <Typography component="h2" variant="h6" gutterBottom>
        {playlist.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t("nowPlaying.playlistPosition", {
          current: currentIndex + 1,
          total: playlist.videos.length,
        })}
      </Typography>
      <List dense disablePadding>
        {playlist.videos.map((videoId, index) => {
          const video = videosById.get(videoId);
          const label = video?.title ?? videoId;
          return (
            <ListItemButton
              key={videoId}
              selected={index === currentIndex}
              onClick={() => onSelectIndex(index)}
            >
              <ListItemText
                primary={label}
                secondary={t("nowPlaying.playlistItemIndex", { index: index + 1 })}
              />
            </ListItemButton>
          );
        })}
      </List>
    </aside>
  );
}
