import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ConfigsStatusBanner } from "@/components/ConfigsStatus";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

export const Route = createFileRoute("/videos")({
  component: VideosPage,
});

function VideosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = useConfigsStore((state) => state.status);
  const catalog = useConfigsStore((state) => state.catalog);
  const openVideo = usePlaybackStore((state) => state.openVideo);
  const videos = catalog?.videos;

  function handleOpen(videoId: string) {
    openVideo(videoId);
    void navigate({ to: "/now-playing" });
  }

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("videos.title")}
      </Typography>
      <ConfigsStatusBanner />
      {status === "ready" && videos && videos.length === 0 ? (
        <Typography color="text.secondary">{t("videos.empty")}</Typography>
      ) : null}
      {status === "ready" && videos && videos.length > 0 ? (
        <List aria-label={t("videos.title")}>
          {videos.map((video) => (
            <ListItemButton key={video.id} divider onClick={() => handleOpen(video.id)}>
              <ListItemText
                primary={video.title}
                secondary={t("videos.itemMeta", {
                  id: video.id,
                  subtitleCount: video.subtitles.length,
                  bulletCount: video.bulletComments.length,
                })}
              />
            </ListItemButton>
          ))}
        </List>
      ) : null}
    </>
  );
}
