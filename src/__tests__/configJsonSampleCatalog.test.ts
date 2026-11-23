import { describe, expect, it } from "vitest";

import {
  CONFIG_JSON_SAMPLE_ROOT,
  buildSampleLines,
  noteKeyPath,
  type SampleLine,
} from "../lib/configs/sampleCatalog";

function annotatedFields(lines: SampleLine[]) {
  return lines
    .filter((line) => line.tag || line.noteKey)
    .map((line) => {
      const keyToken = line.tokens.find((token) => token.kind === "key");
      return {
        key: keyToken?.text.replaceAll('"', ""),
        tag: line.tag,
        noteKey: line.noteKey,
        fold: line.tokens.some((token) => token.kind === "fold")
          ? line.tokens.find((token) => token.kind === "fold")?.text
          : undefined,
      };
    });
}

describe("config JSON sample catalog", () => {
  it("builds annotated lines from a declarative field catalog", () => {
    const lines = buildSampleLines(CONFIG_JSON_SAMPLE_ROOT);

    expect(lines[0]).toMatchObject({
      number: 1,
      depth: 0,
      tokens: [{ kind: "punct", text: "{" }],
    });
    expect(lines.at(-1)).toMatchObject({
      depth: 0,
      tokens: [{ kind: "punct", text: "}" }],
    });

    expect(annotatedFields(lines)).toEqual([
      { key: "videos", tag: "required", noteKey: noteKeyPath("videos"), fold: undefined },
      { key: "id", tag: "required", noteKey: noteKeyPath("id"), fold: undefined },
      { key: "title", tag: "required", noteKey: noteKeyPath("title"), fold: undefined },
      { key: "url", tag: "required", noteKey: noteKeyPath("url"), fold: undefined },
      { key: "poster-url", tag: "optional", noteKey: noteKeyPath("posterUrl"), fold: undefined },
      {
        key: "autoDisplaySubtitles",
        tag: "optional",
        noteKey: noteKeyPath("autoDisplaySubtitles"),
        fold: undefined,
      },
      { key: "subtitles", tag: "optional", noteKey: noteKeyPath("subtitles"), fold: undefined },
      { key: "id", tag: "required", noteKey: noteKeyPath("subtitleId"), fold: undefined },
      { key: "title", tag: "required", noteKey: noteKeyPath("subtitleTitle"), fold: undefined },
      { key: "url", tag: "required", noteKey: noteKeyPath("subtitleUrl"), fold: undefined },
      {
        key: "language",
        tag: "optional",
        noteKey: noteKeyPath("subtitleLanguage"),
        fold: undefined,
      },
      {
        key: "default",
        tag: "optional",
        noteKey: noteKeyPath("subtitleDefault"),
        fold: undefined,
      },
      {
        key: undefined,
        tag: undefined,
        noteKey: noteKeyPath("moreSubtitles"),
        fold: "{ … }",
      },
      {
        key: "bullet-comments",
        tag: "optional",
        noteKey: noteKeyPath("bulletComments"),
        fold: undefined,
      },
      { key: "id", tag: "required", noteKey: noteKeyPath("bulletId"), fold: undefined },
      { key: "title", tag: "required", noteKey: noteKeyPath("bulletTitle"), fold: undefined },
      { key: "url", tag: "required", noteKey: noteKeyPath("bulletUrl"), fold: undefined },
      {
        key: undefined,
        tag: undefined,
        noteKey: noteKeyPath("moreVideos"),
        fold: "{ … }",
      },
      { key: "playlists", tag: "optional", noteKey: noteKeyPath("playlists"), fold: undefined },
      { key: "id", tag: "required", noteKey: noteKeyPath("playlistId"), fold: undefined },
      { key: "title", tag: "required", noteKey: noteKeyPath("playlistTitle"), fold: undefined },
      {
        key: "poster-url",
        tag: "optional",
        noteKey: noteKeyPath("playlistPosterUrl"),
        fold: undefined,
      },
      {
        key: "videos",
        tag: undefined,
        noteKey: noteKeyPath("playlistVideos"),
        fold: undefined,
      },
      {
        key: undefined,
        tag: undefined,
        noteKey: noteKeyPath("morePlaylists"),
        fold: "{ … }",
      },
    ]);
  });

  it("keeps sample primitive values used in the Home figure", () => {
    const lines = buildSampleLines(CONFIG_JSON_SAMPLE_ROOT);
    const texts = lines.flatMap((line) => line.tokens.map((token) => token.text));

    expect(texts).toContain('"big-buck-bunny"');
    expect(texts).toContain('"Big Buck Bunny"');
    expect(texts).toContain('"https://…/video.mp4"');
    expect(texts).toContain("true");
    expect(texts).toContain('"demo-playlist"');
    expect(texts).toContain("…");
  });
});
