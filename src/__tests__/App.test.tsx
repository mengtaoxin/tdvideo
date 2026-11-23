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
      "poster-url": "/fixtures/poster-demo.svg",
      subtitles: [],
      "bullet-comments": [],
    },
  ],
  playlists: [
    {
      id: "pl1",
      title: "Demo Playlist",
      videos: ["demo"],
      "poster-url": "/fixtures/poster-playlist.svg",
    },
  ],
};

async function renderAt(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();

  const view = render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>,
  );

  return Object.assign(view, { router });
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

  it("leads Home with the configs.json catalog story", async () => {
    await renderAt("/");
    expect(
      await screen.findByRole("heading", {
        name: "One read-only JSON file is your whole video library",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse videos" })).toHaveAttribute("href", "/videos");
    expect(screen.getByRole("link", { name: "Browse playlists" })).toHaveAttribute(
      "href",
      "/playlists",
    );
  });

  it("annotates every configs.json key with whether it is required", async () => {
    await renderAt("/");
    const sample = await screen.findByTestId("home-json-sample");
    expect(within(sample).getByText("configs.json")).toBeInTheDocument();
    for (const key of [
      "videos",
      "id",
      "title",
      "url",
      "poster-url",
      "autoDisplaySubtitles",
      "subtitles",
      "language",
      "default",
      "bullet-comments",
      "playlists",
    ]) {
      expect(within(sample).getAllByText(`"${key}"`).length).toBeGreaterThan(0);
    }
    expect(within(sample).getAllByText("required").length).toBeGreaterThan(0);
    expect(within(sample).getAllByText("optional").length).toBeGreaterThan(0);
    expect(
      within(sample).getByText("Unique key; playlists refer to videos by it"),
    ).toBeInTheDocument();
  });

  it("shows configs.json sample annotations in Chinese", async () => {
    await i18n.changeLanguage("zh");
    await renderAt("/");
    const sample = await screen.findByTestId("home-json-sample");
    expect(within(sample).getAllByText("必填").length).toBeGreaterThan(0);
    expect(within(sample).getAllByText("可选").length).toBeGreaterThan(0);
  });

  it("exposes primary nav routes with overflow under More, plus Feedback", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    const nav = await screen.findByRole("banner");
    const primaryRoutes = NAV_ITEMS.filter((item) => item.to !== "/");
    const visibleRoutes = primaryRoutes.slice(0, 5);
    const overflowRoutes = primaryRoutes.slice(5);

    expect(within(nav).getByRole("link", { name: "tdvideo" })).toHaveAttribute("href", "/");
    expect(within(nav).queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    expect(within(nav).getByLabelText("Current page")).toHaveTextContent("Home");

    for (const item of visibleRoutes) {
      expect(within(nav).getByRole("link", { name: i18n.t(item.labelKey) })).toHaveAttribute(
        "href",
        item.to,
      );
    }

    expect(within(nav).getByRole("button", { name: "More" })).toBeInTheDocument();
    await user.click(within(nav).getByRole("button", { name: "More" }));

    for (const item of overflowRoutes) {
      expect(
        await screen.findByRole("menuitem", { name: i18n.t(item.labelKey) }),
      ).toBeInTheDocument();
    }
    expect(screen.getByRole("menuitem", { name: "Feedback" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Language" })).toBeInTheDocument();
  });

  it("shows the current route name as a non-interactive crumb in the chrome", async () => {
    await renderAt("/videos");
    const nav = await screen.findByRole("banner");
    const crumb = within(nav).getByLabelText("Current page");
    expect(crumb).toHaveTextContent("Videos");
    expect(within(crumb).queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Videos" })).not.toBeInTheDocument();
  });

  it("opens the Feedback URL only after confirm", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    await renderAt("/");
    const nav = await screen.findByRole("banner");
    await user.click(within(nav).getByRole("button", { name: "More" }));
    await user.click(await screen.findByRole("menuitem", { name: "Feedback" }));

    expect(await screen.findByRole("dialog", { name: "Leave feedback?" })).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Leave feedback?" })).not.toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    await user.click(within(nav).getByRole("button", { name: "More" }));
    await user.click(await screen.findByRole("menuitem", { name: "Feedback" }));
    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(openSpy).toHaveBeenCalledWith(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  });

  it("renders nav actions as right-aligned icon buttons without uppercase transform", async () => {
    await renderAt("/");
    const nav = await screen.findByRole("banner");
    const toolbar = nav.querySelector(".MuiToolbar-root");
    const brand = within(nav).getByRole("link", { name: "tdvideo" });
    const nowPlaying = within(nav).getByRole("link", { name: "Now Playing" });

    expect(toolbar).toHaveStyle({ justifyContent: "space-between" });
    expect(brand.querySelector("img")).toHaveAttribute("src", "/favicon.svg");
    expect(nowPlaying.querySelector("svg")).toBeTruthy();
    expect(getComputedStyle(nowPlaying).textTransform).toBe("none");
    expect(within(nav).queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("updates chrome strings when the language switches to zh", async () => {
    const user = userEvent.setup();
    await renderAt("/");
    const nav = await screen.findByRole("banner");

    await user.click(within(nav).getByRole("button", { name: "More" }));
    await user.click(await screen.findByRole("menuitem", { name: "Language" }));
    await user.click(await screen.findByRole("menuitem", { name: "中文" }));

    expect(await within(nav).findByLabelText("当前页面")).toHaveTextContent("首页");
    expect(within(nav).getByRole("link", { name: "tdvideo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "正在播放" })).toBeInTheDocument();
    await user.click(within(nav).getByRole("button", { name: "更多" }));
    expect(await screen.findByRole("menuitem", { name: "反馈" })).toBeInTheDocument();
  });

  it("shows the Now Playing empty-state CTAs", async () => {
    await renderAt("/now-playing");
    expect(await screen.findByRole("link", { name: "Browse videos" })).toHaveAttribute(
      "href",
      "/videos",
    );
    expect(screen.getByRole("link", { name: "Browse playlists" })).toHaveAttribute(
      "href",
      "/playlists",
    );
  });

  it("shows videos as a poster gallery from loaded configs", async () => {
    await renderAt("/videos");
    const gallery = await screen.findByRole("list", { name: "Videos" });
    expect(within(gallery).getByRole("button", { name: /Demo Video/i })).toBeInTheDocument();
    expect(within(gallery).getByRole("img", { name: "Demo Video" })).toHaveAttribute(
      "src",
      "/fixtures/poster-demo.svg",
    );
  });

  it("shows playlists as a poster gallery from loaded configs", async () => {
    await renderAt("/playlists");
    const gallery = await screen.findByRole("list", { name: "Playlists" });
    expect(within(gallery).getByRole("button", { name: /Demo Playlist/i })).toBeInTheDocument();
    expect(within(gallery).getByRole("img", { name: "Demo Playlist" })).toHaveAttribute(
      "src",
      "/fixtures/poster-playlist.svg",
    );
  });

  it("opens a video into Now Playing", async () => {
    const user = userEvent.setup();
    await renderAt("/videos");
    await user.click(await screen.findByRole("button", { name: /Demo Video/i }));
    expect(await screen.findByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Toggle subtitles")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Subtitle track")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle bullet comments" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Playlist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Previous in playlist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next in playlist" })).not.toBeInTheDocument();
  });

  it("quick-plays a video deep link into Now Playing and strips the query", async () => {
    const { router } = await renderAt("/quick-play?type=video&id=demo");
    expect(await screen.findByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/now-playing");
    expect(router.state.location.search).toEqual({});
  });

  it("quick-plays a playlist deep link into Now Playing", async () => {
    const { router } = await renderAt("/quick-play?type=playlist&id=pl1");
    expect(await screen.findByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/now-playing");
    expect(router.state.location.search).toEqual({});
  });

  it("stays on Quick play with a warning for an unknown video id", async () => {
    const { router } = await renderAt("/quick-play?type=video&id=missing");
    expect(await screen.findByRole("heading", { name: "Quick play" })).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /That video id is not in the loaded configs/i,
    );
    expect(router.state.location.pathname).toBe("/quick-play");
    expect(router.state.location.search).toEqual({ type: "video", id: "missing" });
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
    expect(await screen.findByRole("heading", { name: "Demo Video" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Toggle subtitles")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle bullet comments" })).toBeInTheDocument();
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

  it("does not show continue watching on Home when history exists", async () => {
    await upsertHistoryEntry({ type: "video", id: "demo", progress: 125 });
    await renderAt("/");
    expect(
      await screen.findByRole("heading", {
        name: "One read-only JSON file is your whole video library",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Continue watching" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Video · 02:05/)).not.toBeInTheDocument();
  });

  it("shows continue watching as a nav route with history entries", async () => {
    await upsertHistoryEntry({ type: "video", id: "demo", progress: 125 });
    await renderAt("/continue-watching");
    const nav = await screen.findByRole("banner");
    expect(within(nav).getByLabelText("Current page")).toHaveTextContent("Continue watching");
    expect(screen.queryByRole("heading", { name: "Continue watching" })).not.toBeInTheDocument();
    expect(await screen.findByText("Demo Video")).toBeInTheDocument();
    expect(screen.getByText(/Video · 02:05/)).toBeInTheDocument();
  });

  it("shows an empty state on Continue watching when history is empty", async () => {
    await renderAt("/continue-watching");
    expect(await screen.findByText("No watching history yet.")).toBeInTheDocument();
  });

  it("shows About app name, description, version, and repo link", async () => {
    await renderAt("/about");
    const nav = await screen.findByRole("banner");
    expect(within(nav).getByLabelText("Current page")).toHaveTextContent("About");
    expect(screen.queryByRole("heading", { name: "About" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "tdvideo" })).toBeInTheDocument();
    expect(screen.getByText("Frontend-only online video player.")).toBeInTheDocument();
    expect(screen.getByText("Version 0.1.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repository" })).toHaveAttribute(
      "href",
      "https://github.com/mengtaoxin/tdvideo",
    );
  });

  it("clears cache from Settings only after confirm", async () => {
    const user = userEvent.setup();
    const { installCacheStorageStub } = await import("./cacheStorageStub");
    const { CONFIGS_CACHE_NAME } = await import("../lib/configs");
    installCacheStorageStub();
    const cache = await caches.open(CONFIGS_CACHE_NAME);
    await cache.put("/configs.json", Response.json(sampleConfigs));
    expect(await caches.has(CONFIGS_CACHE_NAME)).toBe(true);

    await renderAt("/settings");
    await user.click(await screen.findByRole("button", { name: "Clear cache" }));

    const dialog = await screen.findByRole("dialog", { name: "Clear cached data?" });
    expect(dialog).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Clear cached data?" })).not.toBeInTheDocument();
    expect(await caches.has(CONFIGS_CACHE_NAME)).toBe(true);

    await user.click(screen.getByRole("button", { name: "Clear cache" }));
    const confirmDialog = await screen.findByRole("dialog", { name: "Clear cached data?" });
    await user.click(within(confirmDialog).getByRole("button", { name: "Clear" }));

    expect(await screen.findByText("Cache cleared.")).toBeInTheDocument();
  });
});
