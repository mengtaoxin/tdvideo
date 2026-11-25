import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlaybackControls } from "@/components/player/PlaybackControls";
import i18n from "@/i18n";
import { EMBEDDED_AUDIO_ID, type AudioTrackConfig } from "@/lib/configs";
import { theme } from "@/theme";

vi.mock("@videojs/react", () => ({
  useCaptionsOptions: () => null,
}));

const demoAudioTracks: AudioTrackConfig[] = [
  {
    id: "commentary",
    title: "Demo commentary",
    url: "/fixtures/demo-audio.wav",
    language: "en",
  },
];

function renderControls(
  props: Partial<{
    bulletCommentsEnabled: boolean;
    hasBulletComments: boolean;
    onBulletCommentsEnabledChange: (enabled: boolean) => void;
    audioTracks: readonly AudioTrackConfig[];
    selectedAudioId: string;
    onSelectedAudioIdChange: (id: string) => void;
  }> = {},
) {
  const onBulletCommentsEnabledChange =
    props.onBulletCommentsEnabledChange ?? vi.fn<(enabled: boolean) => void>();
  const onSelectedAudioIdChange = props.onSelectedAudioIdChange ?? vi.fn<(id: string) => void>();

  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlaybackControls
        autoDisplaySubtitles={false}
        hasSubtitles={false}
        bulletCommentsEnabled={props.bulletCommentsEnabled ?? true}
        onBulletCommentsEnabledChange={onBulletCommentsEnabledChange}
        hasBulletComments={props.hasBulletComments ?? true}
        audioTracks={props.audioTracks ?? []}
        selectedAudioId={props.selectedAudioId ?? EMBEDDED_AUDIO_ID}
        onSelectedAudioIdChange={onSelectedAudioIdChange}
      />
    </ThemeProvider>,
  );

  return { onBulletCommentsEnabledChange, onSelectedAudioIdChange };
}

describe("PlaybackControls bullet comments toggle", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders a compact icon toggle without a visible Bullet comments label", () => {
    renderControls();

    const toggle = screen.getByRole("button", { name: "Toggle bullet comments" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle.querySelector("svg")).toBeTruthy();
    expect(screen.queryByText("Bullet comments")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("toggles pressed state via the icon button", async () => {
    const user = userEvent.setup();
    const { onBulletCommentsEnabledChange } = renderControls({ bulletCommentsEnabled: true });

    await user.click(screen.getByRole("button", { name: "Toggle bullet comments" }));
    expect(onBulletCommentsEnabledChange).toHaveBeenCalledWith(false);
  });

  it("disables the icon toggle when there is no bullet-comment track", () => {
    renderControls({ hasBulletComments: false, bulletCommentsEnabled: false });

    expect(screen.getByRole("button", { name: "Toggle bullet comments" })).toBeDisabled();
  });
});

describe("PlaybackControls audio track select", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("hides the audio select when there are no external tracks", () => {
    renderControls({ audioTracks: [] });

    expect(screen.queryByLabelText("Audio track")).not.toBeInTheDocument();
  });

  it("shows Original plus each external title and reports selection changes", async () => {
    const user = userEvent.setup();
    const { onSelectedAudioIdChange } = renderControls({
      audioTracks: demoAudioTracks,
      selectedAudioId: EMBEDDED_AUDIO_ID,
    });

    const select = screen.getByLabelText("Audio track");
    expect(select).toBeInTheDocument();

    await user.click(select);
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByRole("option", { name: "Original" })).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: "Demo commentary" })).toBeInTheDocument();

    await user.click(within(listbox).getByRole("option", { name: "Demo commentary" }));
    expect(onSelectedAudioIdChange).toHaveBeenCalledWith("commentary");
  });
});
