function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Format a progress value in seconds as `mm:ss` or `hh:mm:ss`. */
export function formatProgress(seconds: number): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(secs)}`;
  }

  return `${pad2(minutes)}:${pad2(secs)}`;
}
