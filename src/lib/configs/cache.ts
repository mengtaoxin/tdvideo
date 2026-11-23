/** Cache Storage name shared with the service worker runtimeCaching rule. */
export const CONFIGS_CACHE_NAME = "tdvideo-configs";

/** Match default `/configs.json` and any URL whose path ends with `configs.json`. */
export const CONFIGS_RUNTIME_CACHE_URL_PATTERN = /\/configs\.json(?:\?.*)?$/i;

export function isConfigsRuntimeCacheUrl(url: string): boolean {
  try {
    const pathname = new URL(url, "https://tdvideo.local").pathname;
    return pathname === "/configs.json" || pathname.endsWith("/configs.json");
  } catch {
    return CONFIGS_RUNTIME_CACHE_URL_PATTERN.test(url);
  }
}

function getCacheStorage(): CacheStorage | undefined {
  const cachesApi = (globalThis as typeof globalThis & { caches?: CacheStorage }).caches;
  return cachesApi;
}

export async function readCachedConfigsResponse(url: string): Promise<Response | undefined> {
  const storage = getCacheStorage();
  if (!storage) {
    return undefined;
  }

  const cache = await storage.open(CONFIGS_CACHE_NAME);
  return (await cache.match(url)) ?? undefined;
}

export async function writeCachedConfigsResponse(url: string, response: Response): Promise<void> {
  const storage = getCacheStorage();
  if (!storage || !response.ok) {
    return;
  }

  const cache = await storage.open(CONFIGS_CACHE_NAME);
  await cache.put(url, response.clone());
}
