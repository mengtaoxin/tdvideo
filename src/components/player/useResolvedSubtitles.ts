import { useEffect, useRef, useState } from "react";

import type { SubtitleTrack } from "@/lib/configs";
import { isSrtUrl, resolveSubtitleSrc } from "@/lib/playback";

export interface UseResolvedSubtitlesResult {
  subtitles: SubtitleTrack[];
  subtitleError: string | null;
}

function subtitleTracksKey(tracks: readonly SubtitleTrack[] | undefined): string {
  if (!tracks || tracks.length === 0) {
    return "";
  }
  return tracks
    .map((track) =>
      [track.id, track.url, track.title, track.language, track.default === true ? "1" : "0"].join(
        "\0",
      ),
    )
    .join("\n");
}

/** Resolve catalog subtitle URLs (SRT → WebVTT blob); abort and revoke on change. */
export function useResolvedSubtitles(
  tracks: readonly SubtitleTrack[] | undefined,
  loadErrorFallback: string,
): UseResolvedSubtitlesResult {
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);
  const tracksKey = subtitleTracksKey(tracks);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  useEffect(() => {
    if (!tracksKey) {
      setSubtitles([]);
      setSubtitleError(null);
      return undefined;
    }

    const sourceTracks = tracksRef.current ?? [];
    const controller = new AbortController();
    const blobUrls: string[] = [];
    setSubtitleError(null);

    void (async () => {
      const resolved: SubtitleTrack[] = [];
      let error: string | null = null;

      for (const track of sourceTracks) {
        if (controller.signal.aborted) {
          break;
        }
        try {
          const url = await resolveSubtitleSrc(track.url, controller.signal);
          if (url !== track.url) {
            blobUrls.push(url);
          }
          resolved.push({ ...track, url });
        } catch (caught: unknown) {
          if (controller.signal.aborted) {
            break;
          }
          if (!isSrtUrl(track.url)) {
            resolved.push(track);
          } else {
            error = caught instanceof Error ? caught.message : loadErrorFallback;
          }
        }
      }

      if (controller.signal.aborted) {
        for (const url of blobUrls) {
          URL.revokeObjectURL(url);
        }
        return;
      }

      setSubtitles(resolved);
      setSubtitleError(error);
    })();

    return () => {
      controller.abort();
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [tracksKey, loadErrorFallback]);

  return { subtitles, subtitleError };
}
