/** Declarative field catalog for the Home `configs.json` sample figure. */

export type SampleFieldTag = "required" | "optional";

export type SamplePrimitive = string | number | boolean;

export type SampleNode =
  | { type: "primitive"; value: SamplePrimitive }
  | { type: "object"; fields: readonly SampleField[] }
  | {
      type: "array";
      items: readonly SampleNode[];
      /** Elision line after concrete items (e.g. `{ … }` or `…`). */
      fold?: { text: string; noteKey?: string };
    };

export type SampleField = {
  key: string;
  value: SampleNode;
  tag?: SampleFieldTag;
  /** Short key under `home.sample.notes`. */
  noteKey?: string;
};

export type SampleTokenKind = "punct" | "key" | "string" | "number" | "boolean" | "fold";
export type SampleToken = { kind: SampleTokenKind; text: string };

export type SampleLineSpec = {
  depth: number;
  tokens: SampleToken[];
  noteKey?: string;
  tag?: SampleFieldTag;
};

export type SampleLine = SampleLineSpec & { number: number };

const punct = (text: string): SampleToken => ({ kind: "punct", text });
const keyToken = (name: string): SampleToken => ({ kind: "key", text: `"${name}"` });

export function noteKeyPath(short: string): string {
  return `home.sample.notes.${short}`;
}

function primitiveToken(value: SamplePrimitive): SampleToken {
  if (typeof value === "number") {
    return { kind: "number", text: String(value) };
  }
  if (typeof value === "boolean") {
    return { kind: "boolean", text: String(value) };
  }
  return { kind: "string", text: `"${value}"` };
}

function resolveNoteKey(short?: string): string | undefined {
  return short === undefined ? undefined : noteKeyPath(short);
}

function pushFieldLines(
  lines: SampleLineSpec[],
  field: SampleField,
  depth: number,
  isLast: boolean,
): void {
  const noteKey = resolveNoteKey(field.noteKey);
  const { value } = field;

  if (value.type === "primitive") {
    lines.push({
      depth,
      tokens: [
        keyToken(field.key),
        punct(": "),
        primitiveToken(value.value),
        ...(isLast ? [] : [punct(",")]),
      ],
      noteKey,
      tag: field.tag,
    });
    return;
  }

  if (value.type === "array") {
    lines.push({
      depth,
      tokens: [keyToken(field.key), punct(": [")],
      noteKey,
      tag: field.tag,
    });
    pushArrayBody(lines, value, depth + 1);
    lines.push({
      depth,
      tokens: [punct(isLast ? "]" : "],")],
    });
    return;
  }

  // Nested object-as-field is unused by the catalog today; keep for completeness.
  lines.push({
    depth,
    tokens: [keyToken(field.key), punct(": {")],
    noteKey,
    tag: field.tag,
  });
  pushObjectFields(lines, value.fields, depth + 1);
  lines.push({
    depth,
    tokens: [punct(isLast ? "}" : "},")],
  });
}

function pushObjectFields(
  lines: SampleLineSpec[],
  fields: readonly SampleField[],
  depth: number,
): void {
  fields.forEach((field, index) => {
    pushFieldLines(lines, field, depth, index === fields.length - 1);
  });
}

function pushArrayBody(
  lines: SampleLineSpec[],
  node: Extract<SampleNode, { type: "array" }>,
  depth: number,
): void {
  const hasFold = Boolean(node.fold);
  node.items.forEach((item, index) => {
    const isLastItem = index === node.items.length - 1 && !hasFold;
    if (item.type === "primitive") {
      lines.push({
        depth,
        tokens: [primitiveToken(item.value), ...(isLastItem ? [] : [punct(",")])],
      });
      return;
    }
    if (item.type === "object") {
      lines.push({ depth, tokens: [punct("{")] });
      pushObjectFields(lines, item.fields, depth + 1);
      lines.push({
        depth,
        tokens: [punct(isLastItem ? "}" : "},")],
      });
      return;
    }
    // Nested arrays are unused by the sample catalog.
    lines.push({ depth, tokens: [punct("[")] });
    pushArrayBody(lines, item, depth + 1);
    lines.push({
      depth,
      tokens: [punct(isLastItem ? "]" : "],")],
    });
  });

  if (node.fold) {
    lines.push({
      depth,
      tokens: [{ kind: "fold", text: node.fold.text }],
      noteKey: resolveNoteKey(node.fold.noteKey),
    });
  }
}

/** Expand a declarative sample tree into numbered syntax-highlight lines. */
export function buildSampleLines(root: SampleNode = CONFIG_JSON_SAMPLE_ROOT): SampleLine[] {
  const specs: SampleLineSpec[] = [];

  if (root.type !== "object") {
    throw new Error("CONFIG_JSON_SAMPLE_ROOT must be an object");
  }

  specs.push({ depth: 0, tokens: [punct("{")] });
  pushObjectFields(specs, root.fields, 1);
  specs.push({ depth: 0, tokens: [punct("}")] });

  return specs.map((spec, index) => ({ ...spec, number: index + 1 }));
}

const subtitleTrack: SampleNode = {
  type: "object",
  fields: [
    {
      key: "id",
      value: { type: "primitive", value: "en" },
      tag: "required",
      noteKey: "subtitleId",
    },
    {
      key: "title",
      value: { type: "primitive", value: "English" },
      tag: "required",
      noteKey: "subtitleTitle",
    },
    {
      key: "url",
      value: { type: "primitive", value: "/subs/en.vtt" },
      tag: "required",
      noteKey: "subtitleUrl",
    },
    {
      key: "language",
      value: { type: "primitive", value: "en" },
      tag: "optional",
      noteKey: "subtitleLanguage",
    },
    {
      key: "default",
      value: { type: "primitive", value: true },
      tag: "optional",
      noteKey: "subtitleDefault",
    },
  ],
};

const audioTrack: SampleNode = {
  type: "object",
  fields: [
    {
      key: "id",
      value: { type: "primitive", value: "director" },
      tag: "required",
      noteKey: "audioId",
    },
    {
      key: "title",
      value: { type: "primitive", value: "Director commentary" },
      tag: "required",
      noteKey: "audioTitle",
    },
    {
      key: "url",
      value: { type: "primitive", value: "/audio/director.mp3" },
      tag: "required",
      noteKey: "audioUrl",
    },
    {
      key: "language",
      value: { type: "primitive", value: "en" },
      tag: "optional",
      noteKey: "audioLanguage",
    },
    {
      key: "default",
      value: { type: "primitive", value: false },
      tag: "optional",
      noteKey: "audioDefault",
    },
  ],
};

const bulletTrack: SampleNode = {
  type: "object",
  fields: [
    {
      key: "id",
      value: { type: "primitive", value: "demo" },
      tag: "required",
      noteKey: "bulletId",
    },
    {
      key: "title",
      value: { type: "primitive", value: "Demo bullets" },
      tag: "required",
      noteKey: "bulletTitle",
    },
    {
      key: "url",
      value: { type: "primitive", value: "/bullets.json" },
      tag: "required",
      noteKey: "bulletUrl",
    },
  ],
};

const videoItem: SampleNode = {
  type: "object",
  fields: [
    {
      key: "id",
      value: { type: "primitive", value: "big-buck-bunny" },
      tag: "required",
      noteKey: "id",
    },
    {
      key: "title",
      value: { type: "primitive", value: "Big Buck Bunny" },
      tag: "required",
      noteKey: "title",
    },
    {
      key: "url",
      value: { type: "primitive", value: "https://…/video.mp4" },
      tag: "required",
      noteKey: "url",
    },
    {
      key: "poster-url",
      value: { type: "primitive", value: "https://…/poster.jpg" },
      tag: "optional",
      noteKey: "posterUrl",
    },
    {
      key: "autoDisplaySubtitles",
      value: { type: "primitive", value: true },
      tag: "optional",
      noteKey: "autoDisplaySubtitles",
    },
    {
      key: "subtitles",
      tag: "optional",
      noteKey: "subtitles",
      value: {
        type: "array",
        items: [subtitleTrack],
        fold: { text: "{ … }", noteKey: "moreSubtitles" },
      },
    },
    {
      key: "audioTracks",
      tag: "optional",
      noteKey: "audioTracks",
      value: {
        type: "array",
        items: [audioTrack],
        fold: { text: "{ … }", noteKey: "moreAudioTracks" },
      },
    },
    {
      key: "bullet-comments",
      tag: "optional",
      noteKey: "bulletComments",
      value: {
        type: "array",
        items: [bulletTrack],
      },
    },
  ],
};

const playlistItem: SampleNode = {
  type: "object",
  fields: [
    {
      key: "id",
      value: { type: "primitive", value: "demo-playlist" },
      tag: "required",
      noteKey: "playlistId",
    },
    {
      key: "title",
      value: { type: "primitive", value: "Demo playlist" },
      tag: "required",
      noteKey: "playlistTitle",
    },
    {
      key: "poster-url",
      value: { type: "primitive", value: "https://…/list.jpg" },
      tag: "optional",
      noteKey: "playlistPosterUrl",
    },
    {
      key: "videos",
      noteKey: "playlistVideos",
      value: {
        type: "array",
        items: [{ type: "primitive", value: "big-buck-bunny" }],
        fold: { text: "…" },
      },
    },
  ],
};

/** Field directory for the annotated Home sample (videos / playlists contract). */
export const CONFIG_JSON_SAMPLE_ROOT: SampleNode = {
  type: "object",
  fields: [
    {
      key: "videos",
      tag: "required",
      noteKey: "videos",
      value: {
        type: "array",
        items: [videoItem],
        fold: { text: "{ … }", noteKey: "moreVideos" },
      },
    },
    {
      key: "playlists",
      tag: "optional",
      noteKey: "playlists",
      value: {
        type: "array",
        items: [playlistItem],
        fold: { text: "{ … }", noteKey: "morePlaylists" },
      },
    },
  ],
};
