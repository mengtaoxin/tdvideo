import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { listHistory } from "@/db/database";
import type { ConfigsCatalog } from "@/lib/configs";
import { formatProgress, type HistoryEntry } from "@/lib/history";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function historyTitle(entry: HistoryEntry, catalog: ConfigsCatalog | null): string {
  if (!catalog) {
    return entry.id;
  }
  if (entry.type === "video") {
    return catalog.videos.find((video) => video.id === entry.id)?.title ?? entry.id;
  }
  return catalog.playlists.find((playlist) => playlist.id === entry.id)?.title ?? entry.id;
}

function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const catalog = useConfigsStore((state) => state.catalog);
  const openVideo = usePlaybackStore((state) => state.openVideo);
  const openPlaylist = usePlaybackStore((state) => state.openPlaylist);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listHistory().then((entries) => {
      if (!cancelled) {
        setHistory(entries);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleContinue(entry: HistoryEntry) {
    if (entry.type === "video") {
      openVideo(entry.id);
    } else {
      openPlaylist(entry.id, entry.index);
    }
    void navigate({ to: "/now-playing" });
  }

  return (
    <>
      <Typography component="h1" variant="h3" gutterBottom>
        {t("home.brand")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("home.tagline")}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button component={RouterLink} to="/videos" variant="contained">
          {t("home.goToVideos")}
        </Button>
        <Button component={RouterLink} to="/playlists" variant="outlined">
          {t("home.goToPlaylists")}
        </Button>
      </Stack>

      {history.length > 0 ? (
        <>
          <Typography component="h2" variant="h5" gutterBottom>
            {t("home.continueWatching")}
          </Typography>
          <List aria-label={t("home.continueWatching")}>
            {history.map((entry) => (
              <ListItemButton
                key={`${entry.type}:${entry.id}`}
                divider
                onClick={() => handleContinue(entry)}
              >
                <ListItemText
                  primary={historyTitle(entry, catalog)}
                  secondary={t("home.continueMeta", {
                    progress: formatProgress(entry.progress),
                    type: entry.type === "video" ? t("home.typeVideo") : t("home.typeList"),
                  })}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      ) : null}
    </>
  );
}
