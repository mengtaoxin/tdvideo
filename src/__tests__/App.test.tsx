import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FEEDBACK_URL, NAV_ITEMS } from "../constants";
import { upsertHistoryEntry } from "../db/database";
import i18n from "../i18n";
import { routeTree } from "../routeTree.gen";
import { theme } from "../theme";

const sampleConfigs = {
  videos: [
    {
      id: "demo",
      title: "Demo Video",
      url: "https://example.com/demo.mp4",
      subtitles: [],
      "bullet-comments": [],
    },
  ],
  playlists: [{ id: "pl1", title: "Demo Playlist", videos: ["demo"] }],
};

async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();

  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>,
  );
}

describe("App shell", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(sampleConfigs, {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    );
  });

  it("renders the tdvideo brand on Home", async () => {
    await renderAt("/");
    expect(await screen.findByRole("heading", { name: "tdvideo" })).toBeInTheDocument();
  });

  it("exposes all primary nav routes and the Feedback link", async () => {
    await renderAt("/");
    const nav = await screen.findByRole("banner");

    for (const item of NAV_ITEMS) {
      expect(within(nav).getByRole("link", { name: i18n.t(item.labelKey) })).toHaveAttribute(
        "href",
        item.to,
      );
    }

    expect(within(nav).getByRole("link", { name: "Feedback" })).toHaveAttribute(
      "href",
      FEEDBACK_URL,
    );
  });

  it("renders nav actions as left-aligned icon buttons without uppercase transform", async () => {
    await renderAt("/");
    const nav = await screen.findByRole("banner");
    const home = within(nav).getByRole("link", { name: "Home" });

    expect(home.querySelector("svg")).toBeTruthy();
    expect(getComputedStyle(home).textTransform).toBe("none");
    expect(within(nav).queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Language" })).toBeInTheDocument();
  });

  it("updates chrome strings when the language switches to zh", async () => {
    const user = userEvent.setup();
    await renderAt("/");

    await user.click(await screen.findByRole("button", { name: "Language" }));
    await user.click(await screen.findByRole("menuitem", { name: "中文" }));

    expect(await screen.findByRole("link", { name: "首页" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "正在播放" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "反馈" })).toBeInTheDocument();
  });

  it("shows the Now Playing empty-state CTAs", async () => {
    await renderAt("/now-playing");
    expect(await screen.findByRole("heading", { name: "Now Playing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse videos" })).toHaveAttribute("href", "/videos");
    expect(screen.getByRole("link", { name: "Browse playlists" })).toHaveAttribute(
      "href",
      "/playlists",
    );
  });

  it("lists videos from loaded configs", async () => {
    await renderAt("/videos");
    expect(await screen.findByText("Demo Video")).toBeInTheDocument();
  });

  it("lists playlists from loaded configs", async () => {
    await renderAt("/playlists");
    expect(await screen.findByText("Demo Playlist")).toBeInTheDocument();
  });

  it("opens a video into Now Playing", async () => {
    const user = userEvent.setup();
    await renderAt("/videos");
    await user.click(await screen.findByRole("button", { name: /Demo Video/i }));
    expect(await screen.findByRole("heading", { name: "Now Playing" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle subtitles")).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Playlist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous in playlist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next in playlist" })).not.toBeInTheDocument();
  });

  it("opens a playlist into Now Playing with the same stage plus sidebar and nav", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          Response.json(
            {
              videos: [
                {
                  id: "demo",
                  title: "Demo Video",
                  url: "https://example.com/demo.mp4",
                  subtitles: [],
                  "bullet-comments": [],
                },
                {
                  id: "demo-b",
                  title: "Second Video",
                  url: "https://example.com/demo-b.mp4",
                  subtitles: [],
                  "bullet-comments": [],
                },
              ],
              playlists: [{ id: "pl1", title: "Demo Playlist", videos: ["demo", "demo-b"] }],
            },
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      ),
    );

    await renderAt("/playlists");
    await user.click(await screen.findByRole("button", { name: /Demo Playlist/i }));
    expect(await screen.findByRole("heading", { name: "Now Playing" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle subtitles")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Playlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous in playlist" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next in playlist" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next in playlist" }));
    expect(await screen.findByRole("heading", { name: "Second Video" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous in playlist" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next in playlist" })).toBeDisabled();
  });

  it("shows a clear error when configs fail to load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("nope", { status: 500 }))),
    );

    await renderAt("/videos");
    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not load configs/i);
  });

  it("shows continue watching on Home when history exists", async () => {
    await upsertHistoryEntry({ type: "video", id: "demo", progress: 125 });
    await renderAt("/");
    expect(await screen.findByRole("heading", { name: "Continue watching" })).toBeInTheDocument();
    expect(screen.getByText("Demo Video")).toBeInTheDocument();
    expect(screen.getByText(/Video · 02:05/)).toBeInTheDocument();
  });

  it("shows About app name, description, version, and repo link", async () => {
    await renderAt("/about");
    expect(await screen.findByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "tdvideo" })).toBeInTheDocument();
    expect(screen.getByText("Frontend-only online video player.")).toBeInTheDocument();
    expect(screen.getByText("Version 0.1.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repository" })).toHaveAttribute(
      "href",
      "https://github.com/mengtaoxin/tdvideo",
    );
  });
});
