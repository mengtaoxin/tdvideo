import { beforeEach, describe, expect, it } from "vitest";

import { db, getHistoryEntry, listHistory, upsertHistoryEntry } from "../db/database";
import { formatProgress } from "../lib/history";

describe("formatProgress", () => {
  it("formats under one hour as mm:ss", () => {
    expect(formatProgress(0)).toBe("00:00");
    expect(formatProgress(5)).toBe("00:05");
    expect(formatProgress(65)).toBe("01:05");
    expect(formatProgress(492)).toBe("08:12");
    expect(formatProgress(3599.9)).toBe("59:59");
  });

  it("formats one hour or more as hh:mm:ss", () => {
    expect(formatProgress(3600)).toBe("01:00:00");
    expect(formatProgress(3661)).toBe("01:01:01");
    expect(formatProgress(7325)).toBe("02:02:05");
  });

  it("floors fractional seconds and clamps negatives to zero", () => {
    expect(formatProgress(1.9)).toBe("00:01");
    expect(formatProgress(-3)).toBe("00:00");
  });
});

describe("upsertHistoryEntry", () => {
  beforeEach(async () => {
    await db.history.clear();
  });

  it("inserts a video row and upserts the latest progress for the same (type, id)", async () => {
    await upsertHistoryEntry({ type: "video", id: "v1", progress: 10 });
    await upsertHistoryEntry({ type: "video", id: "v1", progress: 42 });

    const row = await getHistoryEntry("video", "v1");
    expect(row).toMatchObject({ type: "video", id: "v1", progress: 42 });

    const all = await listHistory();
    expect(all).toHaveLength(1);
  });

  it("keeps separate rows for different ids and for video vs list", async () => {
    await upsertHistoryEntry({ type: "video", id: "shared", progress: 1 });
    await upsertHistoryEntry({ type: "list", id: "shared", index: 0, progress: 2 });
    await upsertHistoryEntry({ type: "video", id: "other", progress: 3 });

    expect(await listHistory()).toHaveLength(3);
    expect(await getHistoryEntry("video", "shared")).toMatchObject({ progress: 1 });
    expect(await getHistoryEntry("list", "shared")).toMatchObject({ index: 0, progress: 2 });
  });

  it("upserts playlist index and progress for the same list id", async () => {
    await upsertHistoryEntry({ type: "list", id: "p1", index: 0, progress: 12 });
    await upsertHistoryEntry({ type: "list", id: "p1", index: 2, progress: 90 });

    const row = await getHistoryEntry("list", "p1");
    expect(row).toMatchObject({ type: "list", id: "p1", index: 2, progress: 90 });
    expect(await listHistory()).toHaveLength(1);
  });

  it("lists most recently updated first", async () => {
    await upsertHistoryEntry({ type: "video", id: "old", progress: 1 });
    await upsertHistoryEntry({ type: "video", id: "new", progress: 2 });
    await upsertHistoryEntry({ type: "video", id: "old", progress: 3 });

    const ids = (await listHistory()).map((entry) => entry.id);
    expect(ids).toEqual(["old", "new"]);
  });
});
