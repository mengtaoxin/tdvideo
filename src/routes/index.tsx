import type { SvgIconComponent } from "@mui/icons-material";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute, Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfigJsonSample } from "@/components/ConfigJsonSample";
import { listHistory } from "@/db/database";
import type { ConfigsCatalog } from "@/lib/configs";
import { formatProgress, type HistoryEntry } from "@/lib/history";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FEATURES: { icon: SvgIconComponent; key: string }[] = [
  { icon: CloudOffOutlinedIcon, key: "noServer" },
  { icon: LockPersonOutlinedIcon, key: "yourData" },
  { icon: HistoryOutlinedIcon, key: "history" },
];

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
    <Stack spacing={4} sx={{ pb: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="overline" component="p" color="primary" sx={{ fontWeight: 600, m: 0 }}>
          {t("home.eyebrow")}
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 600, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
        >
          {t("home.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: "62ch" }}>
          {t("home.lead")}
        </Typography>
      </Stack>

      <ConfigJsonSample />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button component={RouterLink} to="/videos" variant="contained" size="large">
          {t("home.goToVideos")}
        </Button>
        <Button component={RouterLink} to="/playlists" variant="outlined" size="large">
          {t("home.goToPlaylists")}
        </Button>
        <Button component={RouterLink} to="/settings" variant="outlined" size="large">
          {t("home.goToSettings")}
        </Button>
      </Stack>

      {history.length > 0 ? (
        <Stack spacing={1}>
          <Typography component="h2" variant="h5">
            {t("home.continueWatching")}
          </Typography>
          <List aria-label={t("home.continueWatching")} disablePadding>
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
        </Stack>
      ) : null}

      <Grid container spacing={3}>
        {FEATURES.map(({ icon: Icon, key }) => (
          <Grid key={key} size={{ xs: 12, sm: 4 }}>
            <Stack spacing={1}>
              <Icon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
                {t(`home.features.${key}.title`)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(`home.features.${key}.description`)}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
