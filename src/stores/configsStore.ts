import { create } from "zustand";

import { clearConfigsUrlSetting, getConfigsUrlSetting, setConfigsUrlSetting } from "../db/database";
import { DEFAULT_CONFIGS_URL, fetchConfigs, type ConfigsCatalog } from "../lib/configs";

export type ConfigsStatus = "idle" | "loading" | "ready" | "error";

export interface ConfigsState {
  status: ConfigsStatus;
  /** Persisted override; null means use the default URL. */
  settingsUrl: string | null;
  /** URL used for the latest load attempt. */
  effectiveUrl: string;
  catalog: ConfigsCatalog | null;
  error: string | null;
  initialize: () => Promise<void>;
  reload: () => Promise<void>;
  saveConfigsUrl: (url: string) => Promise<void>;
  resetConfigsUrl: () => Promise<void>;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Failed to load configs";
}

export const useConfigsStore = create<ConfigsState>((set, get) => ({
  status: "idle",
  settingsUrl: null,
  effectiveUrl: DEFAULT_CONFIGS_URL,
  catalog: null,
  error: null,

  initialize: async () => {
    const settingsUrl = await getConfigsUrlSetting();
    set({ settingsUrl });
    await get().reload();
  },

  reload: async () => {
    const settingsUrl = get().settingsUrl;
    const effectiveUrl =
      settingsUrl && settingsUrl.trim().length > 0 ? settingsUrl.trim() : DEFAULT_CONFIGS_URL;

    set({ status: "loading", effectiveUrl, error: null });

    try {
      const catalog = await fetchConfigs(effectiveUrl);
      set({ status: "ready", catalog, error: null });
    } catch (error) {
      set({
        status: "error",
        catalog: null,
        error: toErrorMessage(error),
      });
    }
  },

  saveConfigsUrl: async (url: string) => {
    const trimmed = url.trim();
    if (trimmed.length === 0 || trimmed === DEFAULT_CONFIGS_URL) {
      await clearConfigsUrlSetting();
      set({ settingsUrl: null });
    } else {
      await setConfigsUrlSetting(trimmed);
      set({ settingsUrl: trimmed });
    }
    await get().reload();
  },

  resetConfigsUrl: async () => {
    await clearConfigsUrlSetting();
    set({ settingsUrl: null });
    await get().reload();
  },
}));
