import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getHistoryEntry } from "@/db/database";
import {
  fetchBulletComments,
  resolvePlayback,
  type BulletComment,
  type PlaybackSession,
} from "@/lib/playback";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

import type { HistoryTarget } from "./HistoryProgressSync";
import { PlaylistSidebar } from "./PlaylistSidebar";
import { VideoJsStage } from "./VideoJsStage";

function toHistoryTarget(session: PlaybackSession, index: number | undefined): HistoryTarget {
  if (session.type === "video") {
    return { type: "video", id: session.videoId };
  }
  return { type: "list", id: session.playlistId, index: index ?? session.index };
}

function NowPlayingEmptyState() {
  const { t } = useTranslation();

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {t("nowPlaying.empty")}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button component={RouterLink} to="/videos" variant="contained">
          {t("nowPlaying.goToVideos")}
        </Button>
        <Button component={RouterLink} to="/playlists" variant="outlined">
          {t("nowPlaying.goToPlaylists")}
        </Button>
      </Stack>
    </>
  );
}

export function NowPlayingView() {
  const { t } = useTranslation();
  const catalog = useConfigsStore((state) => state.catalog);
  const status = useConfigsStore((state) => state.status);
  const session = usePlaybackStore((state) => state.session);
  const setPlaylistIndex = usePlaybackStore((state) => state.setPlaylistIndex);

  const resolved = catalog && session ? resolvePlayback(catalog, session) : null;

  const [bulletComments, setBulletComments] = useState<BulletComment[]>([]);
  const [bulletCommentsEnabled, setBulletCommentsEnabled] = useState(true);
  const [bulletError, setBulletError] = useState<string | null>(null);
  const [resumeProgress, setResumeProgress] = useState(0);

  const video = resolved?.video;
  const bulletTrackUrl = video?.bulletComments[0]?.url;

  useEffect(() => {
    if (!session) {
      setResumeProgress(0);
      return undefined;
    }

    setResumeProgress(0);
    let cancelled = false;

    void (async () => {
      if (session.type === "video") {
        const entry = await getHistoryEntry("video", session.videoId);
        if (!cancelled) {
          setResumeProgress(entry?.progress ?? 0);
        }
        return;
      }

      const entry = await getHistoryEntry("list", session.playlistId);
      if (cancelled) {
        return;
      }
      if (entry?.type === "list" && entry.index === session.index) {
        setResumeProgress(entry.progress);
      } else {
        setResumeProgress(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!bulletTrackUrl) {
      setBulletComments([]);
      setBulletError(null);
      setBulletCommentsEnabled(false);
      return undefined;
    }

    const controller = new AbortController();
    setBulletCommentsEnabled(true);
    setBulletError(null);

    void fetchBulletComments(bulletTrackUrl, controller.signal)
      .then((comments) => {
        if (!controller.signal.aborted) {
          setBulletComments(comments);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setBulletComments([]);
        setBulletError(error instanceof Error ? error.message : t("nowPlaying.bulletLoadError"));
      });

    return () => {
      controller.abort();
    };
  }, [bulletTrackUrl, t]);

  const videosById = new Map((catalog?.videos ?? []).map((item) => [item.id, item]));

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("nowPlaying.title")}
      </Typography>

      {!session || !resolved || !video ? (
        <NowPlayingEmptyState />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: resolved.playlist ? 8 : 12 }}>
            <Typography component="h2" variant="h5" gutterBottom>
              {video.title}
            </Typography>
            {bulletError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {bulletError}
              </Alert>
            ) : null}
            <Box>
              <VideoJsStage
                src={video.url}
                title={video.title}
                subtitles={video.subtitles}
                autoDisplaySubtitles={video.autoDisplaySubtitles === true}
                bulletComments={bulletComments}
                bulletCommentsEnabled={bulletCommentsEnabled}
                onBulletCommentsEnabledChange={setBulletCommentsEnabled}
                hasBulletCommentTrack={Boolean(bulletTrackUrl)}
                historyTarget={toHistoryTarget(session, resolved.index)}
                resumeProgress={resumeProgress}
              />
            </Box>
          </Grid>
          {resolved.playlist && resolved.index !== undefined ? (
            <Grid size={{ xs: 12, md: 4 }}>
              <PlaylistSidebar
                playlist={resolved.playlist}
                videosById={videosById}
                currentIndex={resolved.index}
                onSelectIndex={setPlaylistIndex}
              />
            </Grid>
          ) : null}
        </Grid>
      )}

      {session && !resolved && status === "ready" ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t("nowPlaying.missingItem")}
        </Alert>
      ) : null}
    </>
  );
}
