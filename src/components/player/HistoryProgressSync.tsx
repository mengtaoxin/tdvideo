import { selectPlayback, selectTime, usePlayer } from "@videojs/react";
import { useEffect, useEffectEvent, useRef } from "react";

import { upsertHistoryEntry } from "@/db/database";
import type { HistoryUpsertInput } from "@/lib/history";

const WRITE_INTERVAL_MS = 5000;

export type HistoryTarget =
  | { type: "video"; id: string }
  | { type: "list"; id: string; index: number };

function toUpsertInput(target: HistoryTarget, progress: number): HistoryUpsertInput {
  if (target.type === "video") {
    return { type: "video", id: target.id, progress };
  }
  return { type: "list", id: target.id, index: target.index, progress };
}

/** Persist progress ~every 5s while playing, and on pause / unload. Remount per target. */
export function HistoryProgressSync({ target }: { target: HistoryTarget }) {
  const time = usePlayer(selectTime);
  const playback = usePlayer(selectPlayback);
  const wasPlayingRef = useRef(false);

  const save = useEffectEvent(() => {
    const current = time?.currentTime;
    const progress =
      typeof current === "number" && Number.isFinite(current) ? Math.max(0, current) : 0;
    // Avoid clobbering a resumed position with 0 before playback (or seek) has started.
    if (!wasPlayingRef.current && progress <= 0) {
      return;
    }
    void upsertHistoryEntry(toUpsertInput(target, progress));
  });

  useEffect(() => {
    const onPageHide = () => {
      save();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      save();
    };
  }, []);

  const paused = playback?.paused ?? true;

  useEffect(() => {
    if (!paused) {
      wasPlayingRef.current = true;
      const intervalId = window.setInterval(() => {
        save();
      }, WRITE_INTERVAL_MS);
      return () => {
        window.clearInterval(intervalId);
      };
    }

    if (wasPlayingRef.current) {
      save();
    }
    return undefined;
  }, [paused]);

  return null;
}

/** Seek once to a saved progress after media metadata is available. */
export function HistoryResumeSeek({ progress }: { progress: number }) {
  const time = usePlayer(selectTime);
  const didSeekRef = useRef(false);
  const duration = typeof time?.duration === "number" ? time.duration : 0;

  useEffect(() => {
    if (didSeekRef.current || progress <= 0 || !time) {
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    didSeekRef.current = true;
    void time.seek(Math.min(progress, duration));
  }, [progress, time, duration]);

  return null;
}
