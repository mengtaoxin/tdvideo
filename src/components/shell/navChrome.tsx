import AboutIcon from "@mui/icons-material/InfoOutlined";
import ContinueWatchingIcon from "@mui/icons-material/HistoryOutlined";
import FeedbackIcon from "@mui/icons-material/FeedbackOutlined";
import LanguageIcon from "@mui/icons-material/Translate";
import NowPlayingIcon from "@mui/icons-material/PlayCircleOutlined";
import PlaylistsIcon from "@mui/icons-material/PlaylistPlayOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import VideosIcon from "@mui/icons-material/VideoLibraryOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import type { ReactNode } from "react";

import { NAV_ITEMS } from "@/constants";

export const NAV_GAP_PX = 4;
export const MAX_VISIBLE_NAV_ITEMS = 5;

/** Right-side chrome routes — Home is the brand link on the left, not a nav item. */
export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.to !== "/");

const ROUTE_ICONS: Record<(typeof PRIMARY_NAV_ITEMS)[number]["to"], SvgIconComponent> = {
  "/now-playing": NowPlayingIcon,
  "/continue-watching": ContinueWatchingIcon,
  "/videos": VideosIcon,
  "/playlists": PlaylistsIcon,
  "/settings": SettingsIcon,
  "/about": AboutIcon,
};

export type NavChromeItem =
  | { id: string; kind: "route"; to: (typeof PRIMARY_NAV_ITEMS)[number]["to"]; labelKey: string }
  | { id: string; kind: "language"; labelKey: string }
  | { id: string; kind: "feedback"; labelKey: string };

export const CHROME_ITEMS: NavChromeItem[] = [
  ...PRIMARY_NAV_ITEMS.map((item) => ({
    id: item.to,
    kind: "route" as const,
    to: item.to,
    labelKey: item.labelKey,
  })),
  { id: "language", kind: "language", labelKey: "nav.language" },
  { id: "feedback", kind: "feedback", labelKey: "nav.feedback" },
];

export function iconFor(item: NavChromeItem): ReactNode {
  const props = { fontSize: "small" as const };
  if (item.kind === "route") {
    const Icon = ROUTE_ICONS[item.to];
    return <Icon {...props} />;
  }
  if (item.kind === "language") {
    return <LanguageIcon {...props} />;
  }
  return <FeedbackIcon {...props} />;
}
