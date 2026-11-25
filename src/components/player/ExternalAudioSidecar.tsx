import {
  selectPlayback,
  selectPlaybackRate,
  selectTime,
  selectVolume,
  usePlayer,
} from "@videojs/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { EMBEDDED_AUDIO_ID } from "@/lib/configs";
import { shouldResyncExternalAudio } from "@/lib/playback";

/**
 * Hidden sidecar `<audio>` that mirrors video transport when an external track is selected.
 * Mutes the Video.js volume while external audio is active; restores prior mute on return.
 */
export function ExternalAudioSidecar({
  selectedId,
  src,
  onLoadError,
}: {
  selectedId: string;
  src: string | undefined;
  onLoadError: (message: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const time = usePlayer(selectTime);
  const playback = usePlayer(selectPlayback);
  const volume = usePlayer(selectVolume);
  const rate = usePlayer(selectPlaybackRate);
  const muteIntentRef = useRef(false);
  const wasExternalRef = useRef(false);
  const externalActive = selectedId !== EMBEDDED_AUDIO_ID && Boolean(src);

  const reportError = useEffectEvent((message: string) => {
    onLoadError(message);
  });

  const playerMuted = volume?.muted ?? false;
  const videoTime = typeof time?.currentTime === "number" ? time.currentTime : 0;
  const paused = playback?.paused ?? true;
  const playbackRate = rate?.playbackRate ?? 1;
  const volumeLevel = volume?.volume ?? 1;

  useEffect(() => {
    if (!volume) {
      return;
    }

    if (externalActive && !wasExternalRef.current) {
      muteIntentRef.current = volume.muted;
      volume.setMuted(true);
    } else if (!externalActive && wasExternalRef.current) {
      volume.setMuted(muteIntentRef.current);
    }

    wasExternalRef.current = externalActive;
  }, [externalActive, volume]);

  useEffect(() => {
    if (!externalActive || !volume || playerMuted) {
      return;
    }
    volume.setMuted(true);
  }, [externalActive, volume, playerMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !externalActive || !src) {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      return undefined;
    }

    const onError = () => {
      reportError(audio.error?.message || "audio load failed");
    };

    audio.src = src;
    audio.load();
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, [externalActive, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !externalActive) {
      return;
    }

    audio.playbackRate = playbackRate;
    audio.volume = volumeLevel;
    audio.muted = false;

    if (shouldResyncExternalAudio(audio.currentTime, videoTime)) {
      audio.currentTime = videoTime;
    }

    if (paused) {
      audio.pause();
    } else if (audio.paused) {
      void audio.play().catch(() => {
        /* autoplay / play races are ignored; next tick retries */
      });
    }
  }, [externalActive, videoTime, paused, playbackRate, volumeLevel]);

  return (
    <audio
      ref={audioRef}
      aria-hidden
      crossOrigin="anonymous"
      preload="metadata"
      style={{ display: "none" }}
    />
  );
}
