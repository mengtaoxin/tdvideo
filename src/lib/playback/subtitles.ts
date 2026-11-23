const SRT_TIMESTAMP = /(\d{1,2}:)?\d{1,2}:\d{2},\d{3}\s*-->\s*(\d{1,2}:)?\d{1,2}:\d{2},\d{3}/;

/** True when the URL pathname ends with `.srt` (case-insensitive; query/hash ignored). */
export function isSrtUrl(url: string): boolean {
  try {
    const pathname = new URL(url, "https://example.invalid").pathname;
    return pathname.toLowerCase().endsWith(".srt");
  } catch {
    return false;
  }
}

function normalizeSrtTimestamps(line: string): string {
  if (!SRT_TIMESTAMP.test(line)) {
    return line;
  }
  return line.replaceAll(",", ".");
}

/**
 * Convert SubRip (SRT) text to WebVTT. Empty/blank input yields a header-only cue sheet.
 * Callers must revoke any blob URL created from the result when finished.
 */
export function srtToWebVtt(srt: string): string {
  const normalized = srt
    .replace(/^\uFEFF/, "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  if (blocks.length === 0) {
    return "WEBVTT\n\n";
  }

  const cues = blocks.map((block) => {
    const lines = block.split("\n");
    return lines.map((line) => normalizeSrtTimestamps(line)).join("\n");
  });

  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}

/**
 * Resolve a catalog subtitle URL to a playable `<track>` src.
 * SRT URLs are fetched, converted to WebVTT, and returned as blob URLs (caller must revoke).
 * Other URLs pass through unchanged.
 */
export async function resolveSubtitleSrc(url: string, signal?: AbortSignal): Promise<string> {
  if (!isSrtUrl(url)) {
    return url;
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch subtitle (${response.status}) from ${url}`);
  }

  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new Error(`Failed to read subtitle text from ${url}`);
  }

  const webVtt = srtToWebVtt(text);
  return URL.createObjectURL(new Blob([webVtt], { type: "text/vtt" }));
}
