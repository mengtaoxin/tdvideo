export const APP_NAME = __APP_NAME__;
export const APP_VERSION = __APP_VERSION__;
export const REPO_URL = "https://github.com/mengtaoxin/tdvideo";
export const FEEDBACK_URL = `${REPO_URL}/issues/new`;

export const NAV_ITEMS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/now-playing", labelKey: "nav.nowPlaying" },
  { to: "/videos", labelKey: "nav.videos" },
  { to: "/playlists", labelKey: "nav.playlists" },
  { to: "/settings", labelKey: "nav.settings" },
  { to: "/about", labelKey: "nav.about" },
] as const;
