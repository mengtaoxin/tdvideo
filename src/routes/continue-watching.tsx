import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { listHistory } from "@/db/database";
import type { ConfigsCatalog } from "@/lib/configs";
import { formatProgress, type HistoryEntry } from "@/lib/history";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

export const Route = createFileRoute("/continue-watching")({
  component: ContinueWatchingPage,
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

function ContinueWatchingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const catalog = useConfigsStore((state) => state.catalog);
  const openVideo = usePlaybackStore((state) => state.openVideo);
  const openPlaylist = usePlaybackStore((state) => state.openPlaylist);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

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
    <Stack spacing={2}>
      {history !== null && history.length === 0 ? (
        <Typography color="text.secondary">{t("continueWatching.empty")}</Typography>
      ) : null}
      {history !== null && history.length > 0 ? (
        <List aria-label={t("continueWatching.title")} disablePadding>
          {history.map((entry) => (
            <ListItemButton
              key={`${entry.type}:${entry.id}`}
              divider
              onClick={() => handleContinue(entry)}
            >
              <ListItemText
                primary={historyTitle(entry, catalog)}
                secondary={t("continueWatching.itemMeta", {
                  progress: formatProgress(entry.progress),
                  type:
                    entry.type === "video"
                      ? t("continueWatching.typeVideo")
                      : t("continueWatching.typeList"),
                })}
              />
            </ListItemButton>
          ))}
        </List>
      ) : null}
    </Stack>
  );
}
