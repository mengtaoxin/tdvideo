import type {
  BulletCommentTrack,
  ConfigsCatalog,
  PlaylistConfig,
  RawBulletCommentTrack,
  RawConfigs,
  RawPlaylist,
  RawSubtitleTrack,
  RawVideo,
  SubtitleTrack,
  VideoConfig,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid configs: expected non-empty string for ${field}`);
  }
  return value;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    result.push(item);
  }

  return result;
}

function normalizeSubtitle(raw: RawSubtitleTrack): SubtitleTrack {
  return {
    id: requireString(raw.id, "subtitle.id"),
    title: requireString(raw.title, "subtitle.title"),
    url: requireString(raw.url, "subtitle.url"),
    language: typeof raw.language === "string" ? raw.language : "",
    ...(raw.default === true ? { default: true } : {}),
  };
}

function normalizeBullet(raw: RawBulletCommentTrack): BulletCommentTrack {
  return {
    id: requireString(raw.id, "bullet-comment.id"),
    title: requireString(raw.title, "bullet-comment.title"),
    url: requireString(raw.url, "bullet-comment.url"),
  };
}

function optionalPosterUrl(raw: { "poster-url"?: string; posterUrl?: string }): string | undefined {
  const value = raw["poster-url"] ?? raw.posterUrl;
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value;
}

function normalizeVideo(raw: RawVideo): VideoConfig {
  const rawBullets = raw["bullet-comments"] ?? raw.bulletComments ?? [];
  const subtitles = Array.isArray(raw.subtitles)
    ? dedupeById(raw.subtitles.map(normalizeSubtitle))
    : [];
  const bulletComments = Array.isArray(rawBullets)
    ? dedupeById(rawBullets.map(normalizeBullet))
    : [];
  const posterUrl = optionalPosterUrl(raw);

  return {
    id: requireString(raw.id, "video.id"),
    title: requireString(raw.title, "video.title"),
    url: requireString(raw.url, "video.url"),
    ...(posterUrl ? { posterUrl } : {}),
    ...(raw.autoDisplaySubtitles === true ? { autoDisplaySubtitles: true } : {}),
    subtitles,
    bulletComments,
  };
}

function resolvePlaylistVideos(videoIds: string[], knownVideoIds: Set<string>): string[] {
  const resolved: string[] = [];

  for (const videoId of videoIds) {
    if (!knownVideoIds.has(videoId)) {
      console.warn(`Skipping unknown playlist video id: ${videoId}`);
      continue;
    }
    resolved.push(videoId);
  }

  return resolved;
}

function normalizePlaylist(raw: RawPlaylist, knownVideoIds: Set<string>): PlaylistConfig {
  const videoIds = Array.isArray(raw.videos)
    ? raw.videos.filter((id): id is string => typeof id === "string")
    : [];
  const posterUrl = optionalPosterUrl(raw);

  return {
    id: requireString(raw.id, "playlist.id"),
    title: requireString(raw.title, "playlist.title"),
    videos: resolvePlaylistVideos(videoIds, knownVideoIds),
    ...(posterUrl ? { posterUrl } : {}),
  };
}

export function selectDefaultSubtitle(
  subtitles: readonly SubtitleTrack[],
): SubtitleTrack | undefined {
  const preferred = subtitles.find((track) => track.default === true);
  if (preferred) {
    return preferred;
  }
  return subtitles[0];
}

export function normalizeConfigs(raw: unknown): ConfigsCatalog {
  if (!isRecord(raw)) {
    throw new Error("Invalid configs: expected a JSON object");
  }

  if (raw.videos !== undefined && !Array.isArray(raw.videos)) {
    throw new Error("Invalid configs: videos must be an array");
  }

  if (raw.playlists !== undefined && !Array.isArray(raw.playlists)) {
    throw new Error("Invalid configs: playlists must be an array");
  }

  const asRaw = raw as RawConfigs;
  const videos = dedupeById((asRaw.videos ?? []).map(normalizeVideo));
  const knownVideoIds = new Set(videos.map((video) => video.id));
  const playlists = dedupeById(
    (asRaw.playlists ?? []).map((playlist) => normalizePlaylist(playlist, knownVideoIds)),
  );

  return { videos, playlists };
}
