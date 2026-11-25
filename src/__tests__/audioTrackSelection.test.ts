import { describe, expect, it } from "vitest";

import { audioSelectionId } from "@/components/player/useAudioTrackSelection";
import { EMBEDDED_AUDIO_ID, selectDefaultAudio } from "@/lib/configs";

describe("audioSelectionId", () => {
  it("maps embedded and external selections to picker values", () => {
    expect(audioSelectionId({ kind: "embedded" })).toBe(EMBEDDED_AUDIO_ID);
    expect(
      audioSelectionId(
        selectDefaultAudio([
          { id: "a1", title: "A", url: "/a.mp3", language: "en", default: true },
        ]),
      ),
    ).toBe("a1");
  });
});
