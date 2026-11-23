import type { ConfigsCatalog, PlaylistConfig } from "../configs";

/** Reserved playlist id: play every video in catalog order. */
export const ALL_VIDEOS_PLAYLIST_ID = "all-videos";

/** Reserved id: continue the current Now Playing session without changing the queue. */
export const NOW_PLAYING_QUICK_ID = "now-playing";

export type QuickPlayErrorCode =
  | "missing-params"
  | "invalid-type"
  | "unknown-video"
  | "unknown-playlist"
  | "empty-playlist"
  | "no-session";

export type QuickPlayPlan =
  | { action: "open-video"; videoId: string }
  | { action: "open-playlist"; playlistId: string }
  | { action: "continue" }
  | { action: "error"; code: QuickPlayErrorCode };

export function allVideosPlaylist(catalog: ConfigsCatalog): PlaylistConfig {
  return {
    id: ALL_VIDEOS_PLAYLIST_ID,
    title: "All videos",
    videos: catalog.videos.map((video) => video.id),
  };
}

export function planQuickPlay(
  type: string | undefined,
  id: string | undefined,
  catalog: ConfigsCatalog,
  hasSession: boolean,
): QuickPlayPlan {
  if (type === undefined || id === undefined || type === "" || id === "") {
    return { action: "error", code: "missing-params" };
  }

  if (type !== "video" && type !== "playlist") {
    return { action: "error", code: "invalid-type" };
  }

  if (id === NOW_PLAYING_QUICK_ID) {
    return hasSession ? { action: "continue" } : { action: "error", code: "no-session" };
  }

  if (type === "video") {
    if (!catalog.videos.some((video) => video.id === id)) {
      return { action: "error", code: "unknown-video" };
    }
    return { action: "open-video", videoId: id };
  }

  if (id === ALL_VIDEOS_PLAYLIST_ID) {
    if (catalog.videos.length === 0) {
      return { action: "error", code: "empty-playlist" };
    }
    return { action: "open-playlist", playlistId: ALL_VIDEOS_PLAYLIST_ID };
  }

  const playlist = catalog.playlists.find((item) => item.id === id);
  if (!playlist) {
    return { action: "error", code: "unknown-playlist" };
  }
  if (playlist.videos.length === 0) {
    return { action: "error", code: "empty-playlist" };
  }
  return { action: "open-playlist", playlistId: id };
}
