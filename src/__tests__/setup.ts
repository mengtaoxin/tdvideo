import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { db } from "../db/database";
import { DEFAULT_CONFIGS_URL } from "../lib/configs";
import { useConfigsStore } from "../stores/configsStore";
import { usePlaybackStore } from "../stores/playbackStore";

afterEach(async () => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await db.settings.clear();
  await db.history.clear();
  useConfigsStore.setState({
    status: "idle",
    settingsUrl: null,
    effectiveUrl: DEFAULT_CONFIGS_URL,
    catalog: null,
    error: null,
  });
  usePlaybackStore.setState({ session: null });
});
