import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBulletComments } from "@/components/player/useBulletComments";
import { useResumeProgress } from "@/components/player/useResumeProgress";
import * as database from "@/db/database";
import { upsertHistoryEntry } from "@/db/database";
import type { BulletComment } from "@/lib/playback";

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
