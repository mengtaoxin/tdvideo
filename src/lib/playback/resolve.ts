import type { ConfigsCatalog, PlaylistConfig, VideoConfig } from "../configs";

import { ALL_VIDEOS_PLAYLIST_ID, allVideosPlaylist } from "./quickPlay";

export type PlaybackSession =
  | { type: "video"; videoId: string }
  | { type: "playlist"; playlistId: string; index: number };

export interface ResolvedPlayback {
  video: VideoConfig;
  playlist?: PlaylistConfig;
  index?: number;
}

function resolvePlaylist(catalog: ConfigsCatalog, playlistId: string): PlaylistConfig | undefined {
  if (playlistId === ALL_VIDEOS_PLAYLIST_ID) {
    const playlist = allVideosPlaylist(catalog);
    return playlist.videos.length > 0 ? playlist : undefined;
  }
  return catalog.playlists.find((item) => item.id === playlistId);
}

export function resolvePlayback(
  catalog: ConfigsCatalog,
  session: PlaybackSession,
): ResolvedPlayback | null {
  if (session.type === "video") {
    const video = catalog.videos.find((item) => item.id === session.videoId);
    if (!video) {
      return null;
    }
    return { video };
  }

  const playlist = resolvePlaylist(catalog, session.playlistId);
  if (!playlist || playlist.videos.length === 0) {
    return null;
  }

  const videoId = playlist.videos[session.index];
  if (videoId === undefined) {
    return null;
  }

  const video = catalog.videos.find((item) => item.id === videoId);
  if (!video) {
    return null;
  }

  return { video, playlist, index: session.index };
}
