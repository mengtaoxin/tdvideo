# Tech stack

Frontend-only browser video player. Persistence is Dexie in the browser; there is no application backend in this repo.

## Runtime and toolchain

| Area            | Choice                                                         |
| --------------- | -------------------------------------------------------------- |
| Language        | TypeScript                                                     |
| Package manager | npm                                                            |
| Node            | `engines.node`: **>=24**                                       |
| Bundler         | Vite 8                                                         |
| UI              | React 19                                                       |
| Router          | TanStack Router (file-based routes)                            |
| Components      | MUI 9 (`@mui/material`), light theme                           |
| Player          | Video.js (progressive MP4; HLS via `.m3u8`)                    |
| State           | Zustand                                                        |
| Persistence     | Dexie (history + Settings)                                     |
| i18n            | i18next + react-i18next (en default, zh)                       |
| PWA             | vite-plugin-pwa                                                |
| Unit / e2e      | Vitest + Playwright — see [testing.md](./testing.md)           |
| Lint / format   | oxlint + oxfmt via `@mengtaoxin/oxc-config` (`stack("react")`) |
| Agent stages    | `@mengtaoxin/evolving` (`evolving.yml`)                        |

Use latest **stable** dependency versions at install time. Private `@mengtaoxin/*` packages come from GitHub Packages (`NODE_AUTH_TOKEN`).

## Product (supported)

- **Catalog**: JSON with `videos` and `playlists`. Default URL `/configs.json`; Settings may override the URL and persist it in Dexie. Playlist entries reference video ids as strings. Videos and playlists may include optional `poster-url`; the Videos and Playlists pages show items as a fixed-size 16:9 poster gallery in a flex wrap row (as many as fit across the content width, with no upper column cap; placeholder when a poster is omitted). Main content has no max-width so wide viewports can pack more gallery items.
- **Playback**: Now Playing is one shared stage for videos and playlists (Video.js). Playback is click-to-play only (no autoplay); media uses `preload="metadata"` until the user starts playback. Subtitles are WebVTT tracks (optional auto-display). Bullet comments load from JSON `{ "time", "text" }[]` and overlay in sync with playback. Playlists add previous/next controls and a sidebar to switch items; the player stage layout stays the same. The main stage grows as wide as the content area allows while keeping a 16:9 frame; when that would exceed the viewport height below the app bar, width shrinks so the frame and the controls row under it stay on-screen. Deep links `/quick-play?type=video|playlist&id=…` open that title into Now Playing (replace, query cleared). Reserved playlist id `all-videos` plays the catalog in order; reserved id `now-playing` continues the current session. Invalid or missing targets stay on Quick play with a short warning and keep the query.
- **History**: Dexie keeps the latest progress per video or playlist (playlists also store the item index). Progress is seconds; UI shows `mm:ss` or `hh:mm:ss`. Continue watching lists that history; opening a title restores progress.
- **Home**: Explains the catalog with an annotated `configs.json` sample (required/optional field notes), short feature blurbs, and links to Videos, Playlists, and Settings. Continue watching is a separate nav page, not embedded on Home.
- **Chrome**: Top bar splits left/right. Left: brand (favicon + app name) links Home, plus a read-only current-route crumb (menu label; not clickable). Right: Now Playing, Videos, Playlists, Settings, Continue watching, About, language, Feedback with icons; at most five stay visible and the rest fold into More (narrow viewports may show fewer); language opens a menu on click; Feedback asks for confirm, then opens the GitHub new-issue URL in a new tab. Menu pages omit a duplicate page H1 — the crumb is the route title. Empty Now Playing links to Videos / Playlists.
- **Settings**: Configs URL save/reset/reload, plus clear Cache Storage (confirm required; watching history in Dexie is kept).
- **Remote media**: Cross-origin media, subtitle, and bullet-comment URLs need CORS for the app origin. Same-origin assets under `public/` do not.
- **PWA**: Installable shell. Configs responses (default `/configs.json` and other `configs.json` URLs) use network-first caching with revalidation when online; after a successful load they remain available offline.

## Docs policy

English docs under `docs/`, each ≤5000 characters. Describe supported behavior only; put each contract in the owning file and link elsewhere instead of repeating it.
