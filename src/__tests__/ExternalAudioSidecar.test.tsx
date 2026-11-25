import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExternalAudioSidecar } from "@/components/player/ExternalAudioSidecar";
import { EMBEDDED_AUDIO_ID } from "@/lib/configs";

const setMuted = vi.fn();

const playerState = {
  time: { currentTime: 1.5, duration: 10, seeking: false, seek: vi.fn() },
  playback: {
    paused: true,
    ended: false,
    started: false,
    waiting: false,
    autoplay: false,
    autoplaying: false,
    play: vi.fn(),
    pause: vi.fn(),
  },
  volume: {
    volume: 0.8,
    muted: false,
    volumeAvailability: "available" as const,
    mutedAvailability: "available" as const,
    setVolume: vi.fn(),
    setMuted,
  },
  rate: {
    playbackRate: 1,
    playbackRateAvailability: "available" as const,
    setPlaybackRate: vi.fn(),
    playbackRates: [1] as const,
  },
};

vi.mock("@videojs/react", () => {
  const selectTime = "selectTime";
  const selectPlayback = "selectPlayback";
  const selectVolume = "selectVolume";
  const selectPlaybackRate = "selectPlaybackRate";
  return {
    selectTime,
    selectPlayback,
    selectVolume,
    selectPlaybackRate,
    usePlayer: (selector: string) => {
      switch (selector) {
        case selectTime:
          return playerState.time;
        case selectPlayback:
          return playerState.playback;
        case selectVolume:
          return playerState.volume;
        case selectPlaybackRate:
          return playerState.rate;
        default:
          return undefined;
      }
    },
  };
});

describe("ExternalAudioSidecar", () => {
  beforeEach(() => {
    setMuted.mockClear();
    playerState.volume.muted = false;
    playerState.playback.paused = true;
  });

  it("mutes the player and sets the audio src when an external track is selected", async () => {
    const { container, rerender } = render(
      <ExternalAudioSidecar
        selectedId="commentary"
        src="/fixtures/demo-audio.wav"
        onLoadError={vi.fn()}
      />,
    );

    const audio = container.querySelector("audio");
    expect(audio).toBeTruthy();
    expect(audio?.crossOrigin).toBe("anonymous");

    await waitFor(() => {
      expect(setMuted).toHaveBeenCalledWith(true);
    });
    expect(audio?.src).toContain("demo-audio.wav");

    rerender(
      <ExternalAudioSidecar selectedId={EMBEDDED_AUDIO_ID} src={undefined} onLoadError={vi.fn()} />,
    );

    await waitFor(() => {
      expect(setMuted).toHaveBeenCalledWith(false);
    });
  });

  it("reports load errors and leaves recovery to the caller", async () => {
    const onLoadError = vi.fn();
    const { container } = render(
      <ExternalAudioSidecar
        selectedId="broken"
        src="/fixtures/missing-audio.wav"
        onLoadError={onLoadError}
      />,
    );

    const audio = container.querySelector("audio");
    audio?.dispatchEvent(new Event("error"));

    await waitFor(() => {
      expect(onLoadError).toHaveBeenCalled();
    });
  });
});
