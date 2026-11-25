import { useState } from "react";

import { EMBEDDED_AUDIO_ID, selectDefaultAudio, type AudioTrackConfig } from "@/lib/configs";

export function audioSelectionId(selection: ReturnType<typeof selectDefaultAudio>): string {
  return selection.kind === "external" ? selection.track.id : EMBEDDED_AUDIO_ID;
}

function tracksKey(audioTracks: readonly AudioTrackConfig[]): string {
  return audioTracks.map((track) => track.id).join("\0");
}

/** Reset selection whenever the external track list identity changes (e.g. new video). */
export function useAudioTrackSelection(audioTracks: readonly AudioTrackConfig[]): {
  selectedId: string;
  setSelectedId: (id: string) => void;
} {
  const key = tracksKey(audioTracks);
  const [selectedId, setSelectedId] = useState(() =>
    audioSelectionId(selectDefaultAudio(audioTracks)),
  );
  const [prevKey, setPrevKey] = useState(key);

  if (key !== prevKey) {
    setPrevKey(key);
    setSelectedId(audioSelectionId(selectDefaultAudio(audioTracks)));
  }

  return { selectedId, setSelectedId };
}
