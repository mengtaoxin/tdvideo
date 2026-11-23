import { readCachedConfigsResponse, writeCachedConfigsResponse } from "./cache";
import { normalizeConfigs, selectDefaultSubtitle } from "./normalize";
import type { ConfigsCatalog } from "./types";

export {
  CONFIGS_CACHE_NAME,
  CONFIGS_RUNTIME_CACHE_URL_PATTERN,
  isConfigsRuntimeCacheUrl,
  readCachedConfigsResponse,
  writeCachedConfigsResponse,
} from "./cache";
export { normalizeConfigs, selectDefaultSubtitle };
export type {
  BulletCommentTrack,
  ConfigsCatalog,
  PlaylistConfig,
  RawConfigs,
  SubtitleTrack,
  VideoConfig,
} from "./types";

export const DEFAULT_CONFIGS_URL = "/configs.json";

async function parseConfigsResponse(response: Response, url: string): Promise<ConfigsCatalog> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Failed to parse configs JSON from ${url}`);
  }

  return normalizeConfigs(payload);
}

export async function fetchConfigs(url: string, signal?: AbortSignal): Promise<ConfigsCatalog> {
  let response: Response;

  try {
    // Negotiated HTTP revalidation: send validators when the browser HTTP cache has them.
    response = await fetch(url, { signal, cache: "no-cache" });
  } catch (networkError) {
    const cached = await readCachedConfigsResponse(url);
    if (!cached) {
      throw networkError;
    }
    return parseConfigsResponse(cached, url);
  }

  if (!response.ok) {
    const cached = await readCachedConfigsResponse(url);
    if (cached) {
      return parseConfigsResponse(cached, url);
    }
    throw new Error(`Failed to fetch configs (${response.status}) from ${url}`);
  }

  await writeCachedConfigsResponse(url, response);
  return parseConfigsResponse(response, url);
}
