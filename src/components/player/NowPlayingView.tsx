import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AudioTrackConfig } from "@/lib/configs";
import { resolvePlayback, type PlaybackSession } from "@/lib/playback";
import { useConfigsStore } from "@/stores/configsStore";
import { usePlaybackStore } from "@/stores/playbackStore";

import type { HistoryTarget } from "./HistoryProgressSync";
import { PlaylistSidebar } from "./PlaylistSidebar";
import { useAudioTrackSelection } from "./useAudioTrackSelection";
import { useBulletComments } from "./useBulletComments";
import { useResolvedSubtitles } from "./useResolvedSubtitles";
import { useResumeProgress } from "./useResumeProgress";
import { VideoJsStage } from "./VideoJsStage";

const EMPTY_AUDIO_TRACKS: readonly AudioTrackConfig[] = [];

function toHistoryTarget(session: PlaybackSession, index: number | undefined): HistoryTarget {
  if (session.type === "video") {
    return { type: "video", id: session.videoId };
  }
  return { type: "list", id: session.playlistId, index: index ?? session.index };
}

function NowPlayingEmptyState() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
      <Typography color="text.secondary">{t("nowPlaying.empty")}</Typography>
      <Stack direction="row" spacing={1}>
        <Button component={RouterLink} to="/videos" variant="contained">
          {t("nowPlaying.goToVideos")}
        </Button>
        <Button component={RouterLink} to="/playlists" variant="outlined">
          {t("nowPlaying.goToPlaylists")}
        </Button>
      </Stack>
    </Stack>
  );
}

function PlaylistNavButtons({
  currentIndex,
  total,
  onSelectIndex,
}: {
  currentIndex: number;
  total: number;
  onSelectIndex: (index: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
      <IconButton
        aria-label={t("nowPlaying.playlistPrevious")}
        disabled={currentIndex <= 0}
        onClick={() => onSelectIndex(currentIndex - 1)}
        size="small"
      >
        <SkipPreviousIcon />
      </IconButton>
      <IconButton
        aria-label={t("nowPlaying.playlistNext")}
        disabled={currentIndex >= total - 1}
        onClick={() => onSelectIndex(currentIndex + 1)}
        size="small"
      >
        <SkipNextIcon />
      </IconButton>
    </Stack>
  );
}

export function NowPlayingView() {
  const { t } = useTranslation();
  const catalog = useConfigsStore((state) => state.catalog);
  const status = useConfigsStore((state) => state.status);
  const session = usePlaybackStore((state) => state.session);
  const setPlaylistIndex = usePlaybackStore((state) => state.setPlaylistIndex);

  const resolved = catalog && session ? resolvePlayback(catalog, session) : null;

  const video = resolved?.video;
  const playlist = resolved?.playlist;
  const playlistIndex = resolved?.index;
  const bulletTrackUrl = video?.bulletComments[0]?.url;

  const resumeProgress = useResumeProgress(session);
  const { bulletComments, bulletCommentsEnabled, setBulletCommentsEnabled, bulletError } =
    useBulletComments(bulletTrackUrl, t("nowPlaying.bulletLoadError"));
  const { subtitles, subtitleError } = useResolvedSubtitles(
    video?.subtitles,
    t("nowPlaying.subtitleLoadError"),
  );
  const audioTracks = video?.audioTracks ?? EMPTY_AUDIO_TRACKS;
  const { selectedId: selectedAudioId, setSelectedId: setSelectedAudioId } =
    useAudioTrackSelection(audioTracks);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioTracksKey = audioTracks.map((track) => track.id).join("\0");
  const [prevAudioTracksKey, setPrevAudioTracksKey] = useState(audioTracksKey);
  if (audioTracksKey !== prevAudioTracksKey) {
    setPrevAudioTracksKey(audioTracksKey);
    setAudioError(null);
  }

  const videosById = new Map((catalog?.videos ?? []).map((item) => [item.id, item]));

  return (
    <>
      {!session || !resolved || !video ? (
        <NowPlayingEmptyState />
      ) : (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            alignItems: { xs: "stretch", md: "flex-start" },
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1, minHeight: 40 }}>
              <Typography component="h2" variant="h5" sx={{ flex: 1, minWidth: 0 }}>
                {video.title}
              </Typography>
              {playlist && playlistIndex !== undefined ? (
                <PlaylistNavButtons
                  currentIndex={playlistIndex}
                  total={playlist.videos.length}
                  onSelectIndex={setPlaylistIndex}
                />
              ) : null}
            </Stack>
            {bulletError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {bulletError}
              </Alert>
            ) : null}
            {subtitleError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {subtitleError}
              </Alert>
            ) : null}
            {audioError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {audioError}
              </Alert>
            ) : null}
            <VideoJsStage
              src={video.url}
              title={video.title}
              subtitles={subtitles}
              autoDisplaySubtitles={video.autoDisplaySubtitles === true}
              audioTracks={audioTracks}
              selectedAudioId={selectedAudioId}
              onSelectedAudioIdChange={(id) => {
                setAudioError(null);
                setSelectedAudioId(id);
              }}
              onExternalAudioError={() => {
                setAudioError(t("nowPlaying.audioLoadError"));
              }}
              bulletComments={bulletComments}
              bulletCommentsEnabled={bulletCommentsEnabled}
              onBulletCommentsEnabledChange={setBulletCommentsEnabled}
              hasBulletCommentTrack={Boolean(bulletTrackUrl)}
              historyTarget={toHistoryTarget(session, playlistIndex)}
              resumeProgress={resumeProgress}
            />
          </Box>
          {playlist && playlistIndex !== undefined ? (
            <Box
              sx={{
                width: { xs: "100%", md: 300 },
                flexShrink: 0,
              }}
            >
              <PlaylistSidebar
                playlist={playlist}
                videosById={videosById}
                currentIndex={playlistIndex}
                onSelectIndex={setPlaylistIndex}
              />
            </Box>
          ) : null}
        </Stack>
      )}

      {session && !resolved && status === "ready" ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t("nowPlaying.missingItem")}
        </Alert>
      ) : null}
    </>
  );
}
