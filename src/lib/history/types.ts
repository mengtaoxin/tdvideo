export type HistoryType = "video" | "list";

export interface VideoHistoryEntry {
  type: "video";
  id: string;
  progress: number;
  updatedAt: number;
}

export interface ListHistoryEntry {
  type: "list";
  id: string;
  index: number;
  progress: number;
  updatedAt: number;
}

export type HistoryEntry = VideoHistoryEntry | ListHistoryEntry;

export type HistoryUpsertInput =
  | { type: "video"; id: string; progress: number }
  | { type: "list"; id: string; index: number; progress: number };
