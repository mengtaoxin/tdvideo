import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBulletComments } from "@/components/player/useBulletComments";
import { useResolvedSubtitles } from "@/components/player/useResolvedSubtitles";
import { useResumeProgress } from "@/components/player/useResumeProgress";
import * as database from "@/db/database";
import { upsertHistoryEntry } from "@/db/database";
import type { BulletComment } from "@/lib/playback";
import type { SubtitleTrack } from "@/lib/configs";

describe("useResumeProgress", () => {
  it("returns 0 when there is no session", () => {
    const { result } = renderHook(() => useResumeProgress(null));
    expect(result.current).toBe(0);
  });

  it("loads video history progress for a video session", async () => {
    await upsertHistoryEntry({ type: "video", id: "v1", progress: 42 });

    const { result } = renderHook(() => useResumeProgress({ type: "video", videoId: "v1" }));

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it("loads list progress only when history index matches the session index", async () => {
    await upsertHistoryEntry({ type: "list", id: "p1", index: 1, progress: 77 });

    const matching = renderHook(() =>
      useResumeProgress({ type: "playlist", playlistId: "p1", index: 1 }),
    );
    await waitFor(() => {
      expect(matching.result.current).toBe(77);
    });

    const mismatched = renderHook(() =>
      useResumeProgress({ type: "playlist", playlistId: "p1", index: 0 }),
    );
    await waitFor(() => {
      expect(mismatched.result.current).toBe(0);
    });
  });

  it("ignores stale async results after the session changes", async () => {
    let resolveSlow: (() => void) | undefined;
    const slowGate = new Promise<void>((resolve) => {
      resolveSlow = resolve;
    });

    vi.spyOn(database, "getHistoryEntry").mockImplementation(async (type, id) => {
      if (type === "video" && id === "slow") {
        await slowGate;
        return { type: "video", id: "slow", progress: 99, updatedAt: 1 };
      }
      if (type === "video" && id === "fast") {
        return { type: "video", id: "fast", progress: 5, updatedAt: 2 };
      }
      return undefined;
    });

    const { result, rerender } = renderHook(({ session }) => useResumeProgress(session), {
      initialProps: { session: { type: "video" as const, videoId: "slow" } },
    });

    rerender({ session: { type: "video" as const, videoId: "fast" } });

    await waitFor(() => {
      expect(result.current).toBe(5);
    });

    act(() => {
      resolveSlow?.();
    });

    expect(result.current).toBe(5);
  });
});

describe("useBulletComments", () => {
  it("clears comments and disables when there is no track url", () => {
    const { result } = renderHook(() => useBulletComments(undefined, "fallback"));

    expect(result.current.bulletComments).toEqual([]);
    expect(result.current.bulletCommentsEnabled).toBe(false);
    expect(result.current.bulletError).toBeNull();
  });

  it("loads comments and enables the toggle for a track url", async () => {
    const comments: BulletComment[] = [
      { time: 1, text: "hi" },
      { time: 2, text: "there" },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(comments),
      }),
    );

    const { result } = renderHook(() => useBulletComments("/bullets.json", "fallback"));

    await waitFor(() => {
      expect(result.current.bulletComments).toEqual(comments);
    });
    expect(result.current.bulletCommentsEnabled).toBe(true);
    expect(result.current.bulletError).toBeNull();
  });

  it("surfaces fetch errors with the Error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() => useBulletComments("/bad.json", "fallback"));

    await waitFor(() => {
      expect(result.current.bulletError).toMatch(/Failed to fetch bullet comments/);
    });
    expect(result.current.bulletComments).toEqual([]);
  });

  it("uses the fallback message when the rejection is not an Error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("boom"));

    const { result } = renderHook(() => useBulletComments("/bad.json", "fallback"));

    await waitFor(() => {
      expect(result.current.bulletError).toBe("fallback");
    });
  });

  it("ignores aborted in-flight fetch when the track url changes", async () => {
    let resolveFirst: ((value: Response) => void) | undefined;
    const firstResponse = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });

    const fetchMock = vi.fn((url: string) => {
      if (url === "/first.json") {
        return firstResponse;
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ time: 3, text: "second" }]),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(({ url }) => useBulletComments(url, "fallback"), {
      initialProps: { url: "/first.json" as string | undefined },
    });

    rerender({ url: "/second.json" });

    await waitFor(() => {
      expect(result.current.bulletComments).toEqual([{ time: 3, text: "second" }]);
    });

    act(() => {
      resolveFirst?.({
        ok: true,
        json: () => Promise.resolve([{ time: 1, text: "stale" }]),
      } as Response);
    });

    expect(result.current.bulletComments).toEqual([{ time: 3, text: "second" }]);
  });

  it("allows toggling bulletCommentsEnabled", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    );

    const { result } = renderHook(() => useBulletComments("/b.json", "fallback"));

    await waitFor(() => {
      expect(result.current.bulletCommentsEnabled).toBe(true);
    });

    act(() => {
      result.current.setBulletCommentsEnabled(false);
    });
    expect(result.current.bulletCommentsEnabled).toBe(false);
  });
});

describe("useResolvedSubtitles", () => {
  const vttTrack: SubtitleTrack = {
    id: "vtt",
    title: "EN",
    url: "/subs/en.vtt",
    language: "en",
  };
  const srtTrack: SubtitleTrack = {
    id: "srt",
    title: "ZH",
    url: "/subs/zh.srt",
    language: "zh",
    default: true,
  };

  it("returns empty tracks when there are none", () => {
    const { result } = renderHook(() => useResolvedSubtitles([], "fallback"));
    expect(result.current.subtitles).toEqual([]);
    expect(result.current.subtitleError).toBeNull();
  });

  it("passes through vtt urls and converts srt to a blob url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("1\n00:00:00,000 --> 00:00:01,000\nHi\n"),
      }),
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:resolved-srt");

    const { result } = renderHook(() => useResolvedSubtitles([vttTrack, srtTrack], "fallback"));

    await waitFor(() => {
      expect(result.current.subtitles).toEqual([
        vttTrack,
        { ...srtTrack, url: "blob:resolved-srt" },
      ]);
    });
    expect(result.current.subtitleError).toBeNull();
  });

  it("keeps non-srt tracks and surfaces an error when srt fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const { result } = renderHook(() => useResolvedSubtitles([vttTrack, srtTrack], "fallback"));

    await waitFor(() => {
      expect(result.current.subtitleError).toMatch(/Failed to fetch subtitle/);
    });
    expect(result.current.subtitles).toEqual([vttTrack]);
  });

  it("revokes blob urls on unmount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("1\n00:00:00,000 --> 00:00:01,000\nHi\n"),
      }),
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:to-revoke");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    const { result, unmount } = renderHook(() => useResolvedSubtitles([srtTrack], "fallback"));

    await waitFor(() => {
      expect(result.current.subtitles[0]?.url).toBe("blob:to-revoke");
    });

    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:to-revoke");
  });

  it("ignores aborted in-flight resolve when tracks change", async () => {
    let resolveFirst: ((value: { ok: boolean; text: () => Promise<string> }) => void) | undefined;
    const firstResponse = new Promise<{ ok: boolean; text: () => Promise<string> }>((resolve) => {
      resolveFirst = resolve;
    });

    const fetchMock = vi.fn((url: string) => {
      if (url === "/slow.srt") {
        return firstResponse;
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve("1\n00:00:00,000 --> 00:00:01,000\nFast\n"),
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      void blob;
      return `blob:${String(fetchMock.mock.calls.length)}`;
    });

    const slow: SubtitleTrack = { ...srtTrack, id: "slow", url: "/slow.srt" };
    const fast: SubtitleTrack = { ...srtTrack, id: "fast", url: "/fast.srt" };

    const { result, rerender } = renderHook(
      ({ tracks }) => useResolvedSubtitles(tracks, "fallback"),
      { initialProps: { tracks: [slow] as readonly SubtitleTrack[] } },
    );

    rerender({ tracks: [fast] });

    await waitFor(() => {
      expect(result.current.subtitles).toHaveLength(1);
      expect(result.current.subtitles[0]?.id).toBe("fast");
    });

    act(() => {
      resolveFirst?.({
        ok: true,
        text: () => Promise.resolve("1\n00:00:00,000 --> 00:00:01,000\nStale\n"),
      });
    });

    expect(result.current.subtitles[0]?.id).toBe("fast");
  });
});
