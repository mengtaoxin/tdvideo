import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CONFIGS_CACHE_NAME,
  clearAppCaches,
  fetchConfigs,
  isConfigsRuntimeCacheUrl,
  normalizeConfigs,
  selectDefaultAudio,
  selectDefaultSubtitle,
  type RawConfigs,
} from "../lib/configs";
import { installCacheStorageStub } from "./cacheStorageStub";

describe("normalizeConfigs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dedupes videos and playlists by id (first wins)", () => {
    const raw: RawConfigs = {
      videos: [
        { id: "v1", title: "First", url: "https://example.com/a.mp4" },
        { id: "v1", title: "Duplicate", url: "https://example.com/b.mp4" },
        { id: "v2", title: "Second", url: "https://example.com/c.mp4" },
      ],
      playlists: [
        { id: "p1", title: "List A", videos: ["v1"] },
        { id: "p1", title: "List A dup", videos: ["v2"] },
        { id: "p2", title: "List B", videos: ["v2"] },
      ],
    };

    const result = normalizeConfigs(raw);

    expect(result.videos.map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(result.videos[0]?.title).toBe("First");
    expect(result.playlists.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.playlists[0]?.title).toBe("List A");
    expect(result.playlists[0]?.videos).toEqual(["v1"]);
  });

  it("allows the same id on a video and a playlist", () => {
    const raw: RawConfigs = {
      videos: [{ id: "shared", title: "Video", url: "https://example.com/a.mp4" }],
      playlists: [{ id: "shared", title: "Playlist", videos: ["shared"] }],
    };

    const result = normalizeConfigs(raw);

    expect(result.videos).toHaveLength(1);
    expect(result.playlists).toHaveLength(1);
    expect(result.videos[0]?.id).toBe("shared");
    expect(result.playlists[0]?.id).toBe("shared");
  });

  it("skips unknown playlist video refs and console.warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const raw: RawConfigs = {
      videos: [{ id: "v1", title: "Known", url: "https://example.com/a.mp4" }],
      playlists: [{ id: "p1", title: "Mixed", videos: ["v1", "missing", "also-missing"] }],
    };

    const result = normalizeConfigs(raw);

    expect(result.playlists[0]?.videos).toEqual(["v1"]);
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.some((call) => String(call[0]).includes("missing"))).toBe(true);
  });

  it("maps bullet-comments to bulletComments", () => {
    const raw: RawConfigs = {
      videos: [
        {
          id: "v1",
          title: "With bullets",
          url: "https://example.com/a.mp4",
          "bullet-comments": [{ id: "b1", title: "Main", url: "/fixtures/bullets.json" }],
        },
      ],
      playlists: [],
    };

    const result = normalizeConfigs(raw);

    expect(result.videos[0]?.bulletComments).toEqual([
      { id: "b1", title: "Main", url: "/fixtures/bullets.json" },
    ]);
  });

  it("maps audioTracks / audio-tracks, dedupes by id, and defaults to empty", () => {
    const raw: RawConfigs = {
      videos: [
        {
          id: "v1",
          title: "With audio",
          url: "https://example.com/a.mp4",
          audioTracks: [
            {
              id: "a1",
              title: "Director",
              url: "/fixtures/demo-audio.wav",
              language: "en",
              default: true,
            },
            {
              id: "a1",
              title: "Dup",
              url: "/fixtures/other.wav",
              language: "zh",
            },
          ],
        },
        {
          id: "v2",
          title: "Kebab audio",
          url: "https://example.com/b.mp4",
          "audio-tracks": [{ id: "a2", title: "Commentary", url: "/fixtures/demo-audio.wav" }],
        },
        {
          id: "v3",
          title: "No audio",
          url: "https://example.com/c.mp4",
        },
      ],
      playlists: [],
    };

    const result = normalizeConfigs(raw);

    expect(result.videos[0]?.audioTracks).toEqual([
      {
        id: "a1",
        title: "Director",
        url: "/fixtures/demo-audio.wav",
        language: "en",
        default: true,
      },
    ]);
    expect(result.videos[1]?.audioTracks).toEqual([
      { id: "a2", title: "Commentary", url: "/fixtures/demo-audio.wav", language: "" },
    ]);
    expect(result.videos[2]?.audioTracks).toEqual([]);
  });

  it("rejects empty audio track id/title/url", () => {
    expect(() =>
      normalizeConfigs({
        videos: [
          {
            id: "v1",
            title: "Bad audio",
            url: "https://example.com/a.mp4",
            audioTracks: [{ id: "", title: "X", url: "/a.mp3" }],
          },
        ],
      }),
    ).toThrow(/audio/i);

    expect(() =>
      normalizeConfigs({
        videos: [
          {
            id: "v1",
            title: "Bad audio",
            url: "https://example.com/a.mp4",
            audioTracks: [{ id: "a1", title: "", url: "/a.mp3" }],
          },
        ],
      }),
    ).toThrow(/audio/i);

    expect(() =>
      normalizeConfigs({
        videos: [
          {
            id: "v1",
            title: "Bad audio",
            url: "https://example.com/a.mp4",
            audioTracks: [{ id: "a1", title: "X", url: "" }],
          },
        ],
      }),
    ).toThrow(/audio/i);
  });

  it("maps poster-url onto videos and playlists", () => {
    const raw: RawConfigs = {
      videos: [
        {
          id: "v1",
          title: "With poster",
          url: "https://example.com/a.mp4",
          "poster-url": "/fixtures/poster-v1.svg",
        },
        {
          id: "v2",
          title: "Camel poster",
          url: "https://example.com/b.mp4",
          posterUrl: "/fixtures/poster-v2.svg",
        },
        {
          id: "v3",
          title: "Empty poster",
          url: "https://example.com/c.mp4",
          "poster-url": "",
        },
      ],
      playlists: [
        {
          id: "p1",
          title: "List with poster",
          videos: ["v1"],
          "poster-url": "/fixtures/poster-p1.svg",
        },
      ],
    };

    const result = normalizeConfigs(raw);

    expect(result.videos[0]?.posterUrl).toBe("/fixtures/poster-v1.svg");
    expect(result.videos[1]?.posterUrl).toBe("/fixtures/poster-v2.svg");
    expect(result.videos[2]?.posterUrl).toBeUndefined();
    expect(result.playlists[0]?.posterUrl).toBe("/fixtures/poster-p1.svg");
  });

  it("throws on invalid root shape", () => {
    expect(() => normalizeConfigs(null)).toThrow(/configs/i);
    expect(() => normalizeConfigs({ videos: "nope" })).toThrow();
  });
});

describe("selectDefaultSubtitle", () => {
  it("picks the first default:true track", () => {
    const track = selectDefaultSubtitle([
      { id: "a", title: "A", url: "/a.vtt", language: "en", default: false },
      { id: "b", title: "B", url: "/b.vtt", language: "zh", default: true },
      { id: "c", title: "C", url: "/c.vtt", language: "en", default: true },
    ]);

    expect(track?.id).toBe("b");
  });

  it("falls back to the first track when no default:true", () => {
    const track = selectDefaultSubtitle([
      { id: "a", title: "A", url: "/a.vtt", language: "en" },
      { id: "b", title: "B", url: "/b.vtt", language: "zh", default: false },
    ]);

    expect(track?.id).toBe("a");
  });

  it("returns undefined for an empty list", () => {
    expect(selectDefaultSubtitle([])).toBeUndefined();
  });
});

describe("selectDefaultAudio", () => {
  it("selects the first default:true external track", () => {
    const selection = selectDefaultAudio([
      { id: "a", title: "A", url: "/a.mp3", language: "en" },
      { id: "b", title: "B", url: "/b.mp3", language: "zh", default: true },
      { id: "c", title: "C", url: "/c.mp3", language: "en", default: true },
    ]);

    expect(selection).toEqual({
      kind: "external",
      track: { id: "b", title: "B", url: "/b.mp3", language: "zh", default: true },
    });
  });

  it("selects embedded when no external default:true", () => {
    expect(
      selectDefaultAudio([
        { id: "a", title: "A", url: "/a.mp3", language: "en" },
        { id: "b", title: "B", url: "/b.mp3", language: "zh", default: false },
      ]),
    ).toEqual({ kind: "embedded" });
  });

  it("selects embedded for an empty list", () => {
    expect(selectDefaultAudio([])).toEqual({ kind: "embedded" });
  });
});

describe("isConfigsRuntimeCacheUrl", () => {
  it("matches the default path and URLs ending in configs.json", () => {
    expect(isConfigsRuntimeCacheUrl("/configs.json")).toBe(true);
    expect(isConfigsRuntimeCacheUrl("https://cdn.example/configs.json")).toBe(true);
    expect(isConfigsRuntimeCacheUrl("https://cdn.example/v1/configs.json?x=1")).toBe(true);
    expect(isConfigsRuntimeCacheUrl("https://cdn.example/catalog.json")).toBe(false);
    expect(isConfigsRuntimeCacheUrl("/fixtures/demo-bullets.json")).toBe(false);
  });
});

describe("fetchConfigs offline cache", () => {
  const catalogBody = JSON.stringify({
    videos: [{ id: "v1", title: "Cached", url: "https://example.com/a.mp4" }],
    playlists: [],
  });

  beforeEach(async () => {
    installCacheStorageStub();
    await caches.delete(CONFIGS_CACHE_NAME);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches with cache:no-cache and stores a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(catalogBody, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const catalog = await fetchConfigs("https://cdn.example/custom-catalog.json");

    expect(catalog.videos[0]?.id).toBe("v1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://cdn.example/custom-catalog.json",
      expect.objectContaining({ cache: "no-cache" }),
    );

    const cached = await caches.open(CONFIGS_CACHE_NAME).then((cache) => {
      return cache.match("https://cdn.example/custom-catalog.json");
    });
    expect(cached).toBeTruthy();
    expect(await cached?.json()).toEqual(JSON.parse(catalogBody));
  });

  it("serves a previously stored configs response when the network fails", async () => {
    const cache = await caches.open(CONFIGS_CACHE_NAME);
    await cache.put(
      "https://cdn.example/custom-catalog.json",
      new Response(catalogBody, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const catalog = await fetchConfigs("https://cdn.example/custom-catalog.json");

    expect(catalog.videos[0]?.title).toBe("Cached");
  });

  it("clearAppCaches removes Cache Storage entries", async () => {
    const cache = await caches.open(CONFIGS_CACHE_NAME);
    await cache.put(
      "https://cdn.example/custom-catalog.json",
      new Response(catalogBody, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    await caches.open("other-cache");

    await clearAppCaches();

    expect(await caches.has(CONFIGS_CACHE_NAME)).toBe(false);
    expect(await caches.has("other-cache")).toBe(false);
  });
});
