import Box from "@mui/material/Box";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import type { ReactNode } from "react";

import { selectDefaultSubtitle, type SubtitleTrack } from "@/lib/configs";
import { isHlsUrl, type BulletComment } from "@/lib/playback";

import { BulletCommentOverlay } from "./BulletCommentOverlay";
import { HistoryProgressSync, HistoryResumeSeek, type HistoryTarget } from "./HistoryProgressSync";
import { PlaybackControls } from "./PlaybackControls";

function historyTargetKey(target: HistoryTarget): string {
  return target.type === "list" ? `list:${target.id}:${target.index}` : `video:${target.id}`;
}

function SubtitleTracks({
  subtitles,
  autoDisplaySubtitles,
}: {
  subtitles: readonly SubtitleTrack[];
  autoDisplaySubtitles: boolean;
}) {
  const defaultTrack = autoDisplaySubtitles ? selectDefaultSubtitle(subtitles) : undefined;

  return (
    <>
      {subtitles.map((track) => (
        <track
          key={track.id}
          kind="subtitles"
          src={track.url}
          srcLang={track.language || undefined}
          label={track.title}
          default={defaultTrack?.id === track.id}
        />
      ))}
    </>
  );
}

export function VideoJsStage({
  src,
  title,
  subtitles,
  autoDisplaySubtitles,
  bulletComments,
  bulletCommentsEnabled,
  onBulletCommentsEnabledChange,
  hasBulletCommentTrack,
  historyTarget,
  resumeProgress,
}: {
  src: string;
  title: string;
  subtitles: readonly SubtitleTrack[];
  autoDisplaySubtitles: boolean;
  bulletComments: readonly BulletComment[];
  bulletCommentsEnabled: boolean;
  onBulletCommentsEnabledChange: (enabled: boolean) => void;
  hasBulletCommentTrack: boolean;
  historyTarget: HistoryTarget;
  resumeProgress: number;
}) {
  const hls = isHlsUrl(src);
  let media: ReactNode;

  if (hls) {
    media = (
      <HlsJsVideo key={src} src={src} playsInline crossOrigin="anonymous" title={title}>
        <SubtitleTracks subtitles={subtitles} autoDisplaySubtitles={autoDisplaySubtitles} />
      </HlsJsVideo>
    );
  } else {
    media = (
      <Video key={src} src={src} playsInline title={title} preload="auto">
        <SubtitleTracks subtitles={subtitles} autoDisplaySubtitles={autoDisplaySubtitles} />
      </Video>
    );
  }

  return (
    <VideoPlayer key={src} title={title}>
      <HistoryProgressSync key={historyTargetKey(historyTarget)} target={historyTarget} />
      <HistoryResumeSeek key={`resume:${resumeProgress}`} progress={resumeProgress} />
      <Box sx={{ position: "relative" }}>
        <VideoSkin style={{ aspectRatio: "16 / 9", width: "100%" }}>{media}</VideoSkin>
        <BulletCommentOverlay comments={bulletComments} enabled={bulletCommentsEnabled} />
      </Box>
      <Box sx={{ mt: 2 }}>
        <PlaybackControls
          subtitles={subtitles}
          autoDisplaySubtitles={autoDisplaySubtitles}
          bulletCommentsEnabled={bulletCommentsEnabled}
          onBulletCommentsEnabledChange={onBulletCommentsEnabledChange}
          hasBulletComments={hasBulletCommentTrack}
        />
      </Box>
    </VideoPlayer>
  );
}
