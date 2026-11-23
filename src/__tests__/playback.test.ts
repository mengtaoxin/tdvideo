import { beforeEach, describe, expect, it } from "vitest";

import { commentsVisibleAt, isHlsUrl, parseBulletComments, resolvePlayback } from "../lib/playback";
import type { ConfigsCatalog } from "../lib/configs";
import { usePlaybackStore } from "../stores/playbackStore";

const catalog: ConfigsCatalog = {
  videos: [
    {
      id: "v1",
      title: "Video One",
      url: "https://example.com/a.mp4",
      autoDisplaySubtitles: true,
      subtitles: [{ id: "s1", title: "EN", url: "/a.vtt", language: "en", default: true }],
      bulletComments: [{ id: "b1", title: "Main", url: "/bullets.json" }],
    },
    {
      id: "v2",
      title: "Video Two",
      url: "https://example.com/b.m3u8",
      subtitles: [],
      bulletComments: [],
    },
  ],
  playlists: [
    { id: "p1", title: "List", videos: ["v1", "v2"] },
    { id: "empty", title: "Empty", videos: [] },
  ],
};

describe("parseBulletComments", () => {
  it("parses a valid array of time/text items", () => {
    expect(
      parseBulletComments([
        { time: 1.5, text: "Hello" },
        { time: 0, text: "Start" },
      ]),
    ).toEqual([
      { time: 0, text: "Start" },
      { time: 1.5, text: "Hello" },
    ]);
  });

  it("skips invalid entries and rejects non-arrays", () => {
    expect(parseBulletComments(null)).toEqual([]);
    expect(
      parseBulletComments([
        { time: 2, text: "ok" },
        { time: "nope", text: "bad" },
        { time: 3 },
        "x",
      ]),
    ).toEqual([{ time: 2, text: "ok" }]);
  });
});

describe("commentsVisibleAt", () => {
  const comments = [
    { time: 1, text: "a" },
    { time: 4, text: "b" },
    { time: 10, text: "c" },
  ];

  it("returns comments whose time is within the display window ending at currentTime", () => {
    expect(commentsVisibleAt(comments, 4.2, 3)).toEqual([{ time: 4, text: "b" }]);
    expect(commentsVisibleAt(comments, 5.5, 3)).toEqual([{ time: 4, text: "b" }]);
    expect(commentsVisibleAt(comments, 3.9, 3)).toEqual([{ time: 1, text: "a" }]);
  });
});

describe("isHlsUrl", () => {
  it("detects m3u8 URLs", () => {
    expect(isHlsUrl("https://cdn.example.com/stream.m3u8")).toBe(true);
    expect(isHlsUrl("https://cdn.example.com/stream.m3u8?token=1")).toBe(true);
    expect(isHlsUrl("https://cdn.example.com/video.mp4")).toBe(false);
  });
});

describe("resolvePlayback", () => {
  it("resolves a single video session", () => {
    const resolved = resolvePlayback(catalog, { type: "video", videoId: "v1" });
    expect(resolved?.video.id).toBe("v1");
    expect(resolved?.playlist).toBeUndefined();
    expect(resolved?.index).toBeUndefined();
  });

  it("resolves a playlist session at an index", () => {
    const resolved = resolvePlayback(catalog, {
      type: "playlist",
      playlistId: "p1",
      index: 1,
    });
    expect(resolved?.video.id).toBe("v2");
    expect(resolved?.playlist?.id).toBe("p1");
    expect(resolved?.index).toBe(1);
  });

  it("returns null for missing video, playlist, or empty playlist", () => {
    expect(resolvePlayback(catalog, { type: "video", videoId: "missing" })).toBeNull();
    expect(
      resolvePlayback(catalog, { type: "playlist", playlistId: "missing", index: 0 }),
    ).toBeNull();
    expect(
      resolvePlayback(catalog, { type: "playlist", playlistId: "empty", index: 0 }),
    ).toBeNull();
    expect(resolvePlayback(catalog, { type: "playlist", playlistId: "p1", index: 99 })).toBeNull();
  });
});

describe("usePlaybackStore", () => {
  beforeEach(() => {
    usePlaybackStore.getState().clear();
  });

  it("opens a video and clears playlist context", () => {
    usePlaybackStore.getState().openPlaylist("p1", 1);
    usePlaybackStore.getState().openVideo("v1");
    expect(usePlaybackStore.getState().session).toEqual({ type: "video", videoId: "v1" });
  });

  it("opens a playlist at an index and can switch items", () => {
    usePlaybackStore.getState().openPlaylist("p1");
    expect(usePlaybackStore.getState().session).toEqual({
      type: "playlist",
      playlistId: "p1",
      index: 0,
    });
    usePlaybackStore.getState().setPlaylistIndex(2);
    expect(usePlaybackStore.getState().session).toEqual({
      type: "playlist",
      playlistId: "p1",
      index: 2,
    });
  });

  it("ignores setPlaylistIndex when not in playlist mode", () => {
    usePlaybackStore.getState().openVideo("v1");
    usePlaybackStore.getState().setPlaylistIndex(1);
    expect(usePlaybackStore.getState().session).toEqual({ type: "video", videoId: "v1" });
  });
});
