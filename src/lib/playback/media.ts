/** True when the URL looks like an HLS playlist (optional Video.js HLS path). */
export function isHlsUrl(url: string): boolean {
  try {
    const pathname = new URL(url, "https://example.invalid").pathname.toLowerCase();
    return pathname.endsWith(".m3u8");
  } catch {
    return url.toLowerCase().includes(".m3u8");
  }
}
