import { create } from "zustand";

import type { PlaybackSession } from "../lib/playback";

export type { PlaybackSession };

export interface PlaybackState {
  session: PlaybackSession | null;
  openVideo: (videoId: string) => void;
  openPlaylist: (playlistId: string, index?: number) => void;
  setPlaylistIndex: (index: number) => void;
  clear: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  session: null,

  openVideo: (videoId: string) => {
    set({ session: { type: "video", videoId } });
  },

  openPlaylist: (playlistId: string, index = 0) => {
    set({ session: { type: "playlist", playlistId, index } });
  },

  setPlaylistIndex: (index: number) => {
    const session = get().session;
    if (!session || session.type !== "playlist") {
      return;
    }
    set({ session: { ...session, index } });
  },

  clear: () => {
    set({ session: null });
  },
}));
