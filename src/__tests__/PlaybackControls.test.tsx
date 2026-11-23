import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PlaybackControls } from "@/components/player/PlaybackControls";
import i18n from "@/i18n";
import { theme } from "@/theme";

vi.mock("@videojs/react", () => ({
  useCaptionsOptions: () => null,
}));

function renderControls(
  props: Partial<{
    bulletCommentsEnabled: boolean;
    hasBulletComments: boolean;
    onBulletCommentsEnabledChange: (enabled: boolean) => void;
  }> = {},
) {
  const onBulletCommentsEnabledChange =
    props.onBulletCommentsEnabledChange ?? vi.fn<(enabled: boolean) => void>();

  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlaybackControls
        autoDisplaySubtitles={false}
        hasSubtitles={false}
        bulletCommentsEnabled={props.bulletCommentsEnabled ?? true}
        onBulletCommentsEnabledChange={onBulletCommentsEnabledChange}
        hasBulletComments={props.hasBulletComments ?? true}
      />
    </ThemeProvider>,
  );

  return { onBulletCommentsEnabledChange };
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
