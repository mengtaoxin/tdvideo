import { useEffect, useState } from "react";

import { getHistoryEntry } from "@/db/database";
import type { PlaybackSession } from "@/lib/playback";

/** Load resume progress for the active session; ignore stale lookups on change. */
export function useResumeProgress(session: PlaybackSession | null): number {
  const [resumeProgress, setResumeProgress] = useState(0);

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

  return resumeProgress;
}
