import { NAV_ITEMS } from "@/constants";

const EXTRA_CRUMBS: { to: string; labelKey: string }[] = [
  { to: "/quick-play", labelKey: "quickPlay.title" },
];

/** i18n key for the chrome crumb that mirrors the current route, or null if unknown. */
export function routeCrumbLabelKey(pathname: string): string | null {
  const navMatch = NAV_ITEMS.find((item) => item.to === pathname);
  if (navMatch) {
    return navMatch.labelKey;
  }
  return EXTRA_CRUMBS.find((item) => item.to === pathname)?.labelKey ?? null;
}
