import { describe, expect, it, vi } from "vitest";

import { isSrtUrl, resolveSubtitleSrc, srtToWebVtt } from "@/lib/playback/subtitles";

describe("isSrtUrl", () => {
  it("detects .srt paths case-insensitively and ignores query/hash", () => {
    expect(isSrtUrl("/subs/en.srt")).toBe(true);
    expect(isSrtUrl("https://cdn.example/a.SRT")).toBe(true);
    expect(isSrtUrl("/subs/en.srt?v=1")).toBe(true);
    expect(isSrtUrl("/subs/en.srt#cue")).toBe(true);
  });

  it("rejects non-srt urls", () => {
    expect(isSrtUrl("/subs/en.vtt")).toBe(false);
    expect(isSrtUrl("/subs/en")).toBe(false);
    expect(isSrtUrl("not a url")).toBe(false);
  });
});

describe("srtToWebVtt", () => {
  it("converts multi-cue SRT with comma timestamps to WebVTT", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:03,500",
      "Hello world",
      "",
      "2",
      "00:00:04,000 --> 00:00:06,000",
      "Line two",
      "still cue two",
      "",
    ].join("\n");

    expect(srtToWebVtt(srt)).toBe(
      [
        "WEBVTT",
        "",
        "1",
        "00:00:01.000 --> 00:00:03.500",
        "Hello world",
        "",
        "2",
        "00:00:04.000 --> 00:00:06.000",
        "Line two",
        "still cue two",
        "",
      ].join("\n"),
    );
  });

  it("handles BOM, CRLF, and short MM:SS,mmm timestamps", () => {
    const srt = `\uFEFF1\r\n00:01,000 --> 00:02,500\r\nHi\r\n\r\n`;

    expect(srtToWebVtt(srt)).toBe(
      ["WEBVTT", "", "1", "00:01.000 --> 00:02.500", "Hi", ""].join("\n"),
    );
  });

  it("returns a WEBVTT header for empty input", () => {
    expect(srtToWebVtt("")).toBe("WEBVTT\n\n");
    expect(srtToWebVtt("   \n\n")).toBe("WEBVTT\n\n");
  });
});

describe("resolveSubtitleSrc", () => {
  it("returns the original url for non-srt tracks", async () => {
    await expect(resolveSubtitleSrc("/subs/en.vtt")).resolves.toBe("/subs/en.vtt");
  });

  it("fetches srt, converts to WebVTT, and returns a blob url", async () => {
    const srt = "1\n00:00:00,000 --> 00:00:01,000\nHi\n";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(srt),
      }),
    );
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-subtitle");

    const src = await resolveSubtitleSrc("/subs/en.srt");
    expect(src).toBe("blob:mock-subtitle");
    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    const text = await (blob as Blob).text();
    expect(text.startsWith("WEBVTT")).toBe(true);
    expect(text).toContain("00:00:00.000 --> 00:00:01.000");
  });

  it("throws when the srt fetch is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    await expect(resolveSubtitleSrc("/missing.srt")).rejects.toThrow(
      /Failed to fetch subtitle \(404\)/,
    );
  });
});
