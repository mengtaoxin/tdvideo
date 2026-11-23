import Typography from "@mui/material/Typography";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { CatalogGallery } from "@/components/CatalogGallery";
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
      <ConfigsStatusBanner />
      {status === "ready" && videos && videos.length === 0 ? (
        <Typography color="text.secondary">{t("videos.empty")}</Typography>
      ) : null}
      {status === "ready" && videos && videos.length > 0 ? (
        <CatalogGallery
          label={t("videos.title")}
          items={videos.map((video) => ({
            id: video.id,
            title: video.title,
            posterUrl: video.posterUrl,
            meta: t("videos.itemMeta", {
              id: video.id,
              subtitleCount: video.subtitles.length,
              bulletCount: video.bulletComments.length,
            }),
          }))}
          onOpen={handleOpen}
        />
      ) : null}
    </>
  );
}
