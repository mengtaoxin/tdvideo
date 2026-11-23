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

- **Catalog**: JSON with `videos` and `playlists`. Default URL `/configs.json`; Settings may override the URL and persist it in Dexie. Playlist entries reference video ids as strings.
- **Playback**: Now Playing uses Video.js. Subtitles are WebVTT tracks (optional auto-display). Bullet comments load from JSON `{ "time", "text" }[]` and overlay in sync with playback. Active playlists show a sidebar to switch items.
- **History**: Dexie keeps the latest progress per video or playlist (playlists also store the item index). Progress is seconds; UI shows `mm:ss` or `hh:mm:ss`. Home can continue watching; opening a title restores progress.
- **Chrome**: Home, Now Playing, Videos, Playlists, Settings, About; language switcher; Feedback opens the GitHub new-issue URL. Empty Now Playing links to Videos / Playlists.
- **Remote media**: Cross-origin media, subtitle, and bullet-comment URLs need CORS for the app origin. Same-origin assets under `public/` do not.
- **PWA**: Installable shell. Configs responses (default `/configs.json` and other `configs.json` URLs) use network-first caching with revalidation when online; after a successful load they remain available offline.

## Docs policy

English docs under `docs/`, each ≤5000 characters. Describe supported behavior only; put each contract in the owning file and link elsewhere instead of repeating it.
