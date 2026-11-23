import { describe, expect, it } from "vitest";

import { routeCrumbLabelKey } from "../lib/nav/routeCrumb";

describe("routeCrumbLabelKey", () => {
  it("maps primary nav paths to their nav label keys", () => {
    expect(routeCrumbLabelKey("/")).toBe("nav.home");
    expect(routeCrumbLabelKey("/now-playing")).toBe("nav.nowPlaying");
    expect(routeCrumbLabelKey("/videos")).toBe("nav.videos");
    expect(routeCrumbLabelKey("/playlists")).toBe("nav.playlists");
    expect(routeCrumbLabelKey("/settings")).toBe("nav.settings");
    expect(routeCrumbLabelKey("/continue-watching")).toBe("nav.continueWatching");
    expect(routeCrumbLabelKey("/about")).toBe("nav.about");
  });

  it("maps quick-play to its page title key", () => {
    expect(routeCrumbLabelKey("/quick-play")).toBe("quickPlay.title");
  });

  it("returns null for unknown paths", () => {
    expect(routeCrumbLabelKey("/does-not-exist")).toBeNull();
  });
});
