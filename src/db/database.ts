import { Dexie, type EntityTable, type Table } from "dexie";

import type { HistoryEntry, HistoryType, HistoryUpsertInput } from "../lib/history";

export const SETTINGS_CONFIGS_URL_KEY = "configsUrl";

export interface SettingRow {
  key: string;
  value: string;
}

export type HistoryKey = [HistoryType, string];

export class TdvideoDatabase extends Dexie {
  settings!: EntityTable<SettingRow, "key">;
  history!: Table<HistoryEntry, HistoryKey>;

  constructor(name = "tdvideo") {
    super(name);
    this.version(1).stores({
      settings: "key",
    });
    this.version(2).stores({
      settings: "key",
      history: "[type+id], updatedAt",
    });
  }
}

export const db = new TdvideoDatabase();

export async function getConfigsUrlSetting(): Promise<string | null> {
  const row = await db.settings.get(SETTINGS_CONFIGS_URL_KEY);
  return row?.value ?? null;
}

export async function setConfigsUrlSetting(url: string): Promise<void> {
  await db.settings.put({ key: SETTINGS_CONFIGS_URL_KEY, value: url });
}

export async function clearConfigsUrlSetting(): Promise<void> {
  await db.settings.delete(SETTINGS_CONFIGS_URL_KEY);
}

export async function upsertHistoryEntry(input: HistoryUpsertInput): Promise<void> {
  const progress = Number.isFinite(input.progress) ? Math.max(0, input.progress) : 0;
  const updatedAt = Date.now();

  if (input.type === "video") {
    const row: HistoryEntry = {
      type: "video",
      id: input.id,
      progress,
      updatedAt,
    };
    await db.history.put(row);
    return;
  }

  const row: HistoryEntry = {
    type: "list",
    id: input.id,
    index: Math.max(0, Math.floor(input.index)),
    progress,
    updatedAt,
  };
  await db.history.put(row);
}

export async function getHistoryEntry(
  type: HistoryType,
  id: string,
): Promise<HistoryEntry | undefined> {
  return db.history.get([type, id]);
}

export async function listHistory(): Promise<HistoryEntry[]> {
  return db.history.orderBy("updatedAt").reverse().toArray();
}
