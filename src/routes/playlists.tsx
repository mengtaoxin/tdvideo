import Typography from "@mui/material/Typography";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { CatalogGallery } from "@/components/CatalogGallery";
import { ConfigsStatusBanner } from "@/components/ConfigsStatus";
import { getHistoryEntry } from "@/db/database";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

export const Route = createFileRoute("/playlists")({
  component: PlaylistsPage,
});

function PlaylistsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = useConfigsStore((state) => state.status);
  const catalog = useConfigsStore((state) => state.catalog);
  const openPlaylist = usePlaybackStore((state) => state.openPlaylist);
  const playlists = catalog?.playlists;

  async function handleOpen(playlistId: string) {
    const entry = await getHistoryEntry("list", playlistId);
    const index = entry?.type === "list" ? entry.index : 0;
    openPlaylist(playlistId, index);
    await navigate({ to: "/now-playing" });
  }

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("playlists.title")}
      </Typography>
      <ConfigsStatusBanner />
      {status === "ready" && playlists && playlists.length === 0 ? (
        <Typography color="text.secondary">{t("playlists.empty")}</Typography>
      ) : null}
      {status === "ready" && playlists && playlists.length > 0 ? (
        <CatalogGallery
          label={t("playlists.title")}
          items={playlists.map((playlist) => ({
            id: playlist.id,
            title: playlist.title,
            posterUrl: playlist.posterUrl,
            meta: t("playlists.itemMeta", {
              id: playlist.id,
              count: playlist.videos.length,
            }),
          }))}
          onOpen={(id) => {
            void handleOpen(id);
          }}
        />
      ) : null}
    </>
  );
}
