export interface SubtitleTrack {
  id: string;
  title: string;
  url: string;
  language: string;
  default?: boolean;
}

export interface BulletCommentTrack {
  id: string;
  title: string;
  url: string;
}

export interface VideoConfig {
  id: string;
  title: string;
  url: string;
  autoDisplaySubtitles?: boolean;
  subtitles: SubtitleTrack[];
  bulletComments: BulletCommentTrack[];
}

export interface PlaylistConfig {
  id: string;
  title: string;
  videos: string[];
}

export interface ConfigsCatalog {
  videos: VideoConfig[];
  playlists: PlaylistConfig[];
}

export interface RawSubtitleTrack {
  id: string;
  title: string;
  url: string;
  language?: string;
  default?: boolean;
}

export interface RawBulletCommentTrack {
  id: string;
  title: string;
  url: string;
}

export interface RawVideo {
  id: string;
  title: string;
  url: string;
  autoDisplaySubtitles?: boolean;
  subtitles?: RawSubtitleTrack[];
  "bullet-comments"?: RawBulletCommentTrack[];
  bulletComments?: RawBulletCommentTrack[];
}

export interface RawPlaylist {
  id: string;
  title: string;
  videos?: string[];
}

export interface RawConfigs {
  videos?: RawVideo[];
  playlists?: RawPlaylist[];
}
