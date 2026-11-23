export interface BulletComment {
  time: number;
  text: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse a bullet-comment track payload into sorted `{ time, text }` items. */
export function parseBulletComments(raw: unknown): BulletComment[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const comments: BulletComment[] = [];

  for (const entry of raw) {
    if (!isRecord(entry)) {
      continue;
    }
    if (typeof entry.time !== "number" || !Number.isFinite(entry.time)) {
      continue;
    }
    if (typeof entry.text !== "string") {
      continue;
    }
    comments.push({ time: entry.time, text: entry.text });
  }

  comments.sort((a, b) => a.time - b.time);
  return comments;
}

/**
 * Comments whose cue time falls in `(currentTime - windowSeconds, currentTime]`.
 * A comment at exactly `currentTime` is visible; one older than the window is not.
 */
export function commentsVisibleAt(
  comments: readonly BulletComment[],
  currentTime: number,
  windowSeconds: number,
): BulletComment[] {
  const start = currentTime - windowSeconds;
  return comments.filter((comment) => comment.time > start && comment.time <= currentTime);
}

export async function fetchBulletComments(
  url: string,
  signal?: AbortSignal,
): Promise<BulletComment[]> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch bullet comments (${response.status}) from ${url}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Failed to parse bullet comments JSON from ${url}`);
  }

  return parseBulletComments(payload);
}
