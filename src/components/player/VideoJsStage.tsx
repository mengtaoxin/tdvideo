import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { Video, VideoPlayer, VideoSkin } from "@videojs/react/video";
import "@videojs/react/video/skin.css";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { selectDefaultSubtitle, type SubtitleTrack } from "@/lib/configs";
import { availableStageHeight, fitStageSize, isHlsUrl, type BulletComment } from "@/lib/playback";

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
  const theme = useTheme();
  const widthRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const widthEl = widthRef.current;
    if (!widthEl) {
      return undefined;
    }

    const toolbarGap = Number.parseFloat(theme.spacing(2));
    const bottomInset = Number.parseFloat(theme.spacing(3));

    function measure() {
      const el = widthRef.current;
      if (!el) {
        return;
      }
      const availableWidth = el.clientWidth;
      const stageTop = el.getBoundingClientRect().top;
      const toolbarHeight = toolbarRef.current?.offsetHeight ?? 0;
      const availableHeight = availableStageHeight({
        viewportHeight: window.innerHeight,
        stageTop,
        toolbarHeight,
        toolbarGap,
        bottomInset,
      });
      setFrameSize(fitStageSize(availableWidth, availableHeight));
    }

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        window.removeEventListener("resize", measure);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(widthEl);
    if (toolbarRef.current) {
      observer.observe(toolbarRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [theme]);

  const hls = isHlsUrl(src);
  let media: ReactNode;

  if (hls) {
    media = (
      <HlsJsVideo
        key={src}
        src={src}
        autoPlay={false}
        playsInline
        crossOrigin="anonymous"
        title={title}
        preload="metadata"
      >
        <SubtitleTracks subtitles={subtitles} autoDisplaySubtitles={autoDisplaySubtitles} />
      </HlsJsVideo>
    );
  } else {
    media = (
      <Video key={src} src={src} autoPlay={false} playsInline title={title} preload="metadata">
        <SubtitleTracks subtitles={subtitles} autoDisplaySubtitles={autoDisplaySubtitles} />
      </Video>
    );
  }

  const frameSx =
    frameSize === null
      ? { width: "100%", aspectRatio: "16 / 9" }
      : { width: frameSize.width, height: frameSize.height };

  return (
    <VideoPlayer key={src} title={title}>
      <HistoryProgressSync key={historyTargetKey(historyTarget)} target={historyTarget} />
      <HistoryResumeSeek key={`resume:${resumeProgress}`} progress={resumeProgress} />
      <Box
        ref={widthRef}
        sx={{
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ position: "relative", maxWidth: "100%", ...frameSx }}>
          <VideoSkin style={{ width: "100%", height: "100%" }}>{media}</VideoSkin>
          <BulletCommentOverlay comments={bulletComments} enabled={bulletCommentsEnabled} />
        </Box>
      </Box>
      <Box
        ref={toolbarRef}
        sx={{
          mt: 2,
          width: frameSize?.width ?? "100%",
          maxWidth: "100%",
          mx: "auto",
        }}
      >
        <PlaybackControls
          autoDisplaySubtitles={autoDisplaySubtitles}
          hasSubtitles={subtitles.length > 0}
          bulletCommentsEnabled={bulletCommentsEnabled}
          onBulletCommentsEnabledChange={onBulletCommentsEnabledChange}
          hasBulletComments={hasBulletCommentTrack}
        />
      </Box>
    </VideoPlayer>
  );
}
