# Tech stack

Frontend-only online video player. No application backend.

## Runtime and toolchain

| Area            | Choice                                                         |
| --------------- | -------------------------------------------------------------- |
| Language        | TypeScript                                                     |
| Package manager | npm                                                            |
| Node            | `engines.node`: **>=24**                                       |
| Bundler         | Vite 8                                                         |
| UI              | React 19                                                       |
| Router          | TanStack Router (file-based routes preferred)                  |
| Components      | MUI 9 (`@mui/material`), **light** theme default               |
| Player          | Video.js (progressive MP4; optional HLS)                       |
| State           | Zustand                                                        |
| Persistence     | Dexie (history + Settings)                                     |
| i18n            | i18next + react-i18next (**en** default, **zh**)               |
| PWA             | vite-plugin-pwa                                                |
| Unit tests      | Vitest + `@vitest/coverage-v8` (threshold **50%**)             |
| E2E             | Playwright (Chromium)                                          |
| Lint / format   | oxlint + oxfmt via `@mengtaoxin/oxc-config` (`stack("react")`) |
| Agent stages    | `@mengtaoxin/evolving` (`evolving.yml`)                        |

Use latest **stable** dependency versions at install time. Private `@mengtaoxin/*` packages come from GitHub Packages (`NODE_AUTH_TOKEN`).

## Product behavior (supported)

- **Configs**: JSON catalog of `videos` and `playlists`. Default URL `/configs.json`. Settings may override and persist the URL in Dexie. Duplicate ids within `videos` or within `playlists`: first wins. Unknown playlist video ids are skipped (`console.warn`). Same id across a video and a playlist is allowed. Playlist video ids are strings matching `video.id`.
- **Playback**: Now Playing uses Video.js. Subtitles are WebVTT text tracks; when `autoDisplaySubtitles` is on, pick the first `default: true`, else the first track (first wins if multiple defaults). Bullet comments load from JSON `{ "time", "text" }[]` and overlay in sync with playback time. Active playlists show a sidebar (index + switch item).
- **History**: At most one Dexie row per `(type, id)` (upsert latest). Progress is a **number of seconds**; UI formats as `mm:ss` or `hh:mm:ss`. Writes about every 5s while playing, and on pause/unload. Opening a video/list seeks; lists also restore `index`.
- **Chrome**: Top nav routes — Home (brand **tdvideo**, continue watching when history exists), Now Playing, Videos, Playlists, Settings, About, Language, Feedback (external GitHub new-issue link). Empty Now Playing shows a CTA to Videos/Playlists (no forced redirect).

## CORS and remote media

Cross-origin media (and subtitle / bullet-comment files) must be served with CORS headers that allow the tdvideo origin to fetch and play them. Hosts that omit CORS will fail in the browser for remote URLs; same-origin assets under `public/` do not need extra CORS setup.

## PWA and configs caching

The installable app precaches the shell and static assets. Responses for configs (default `/configs.json` and any configured configs URL) are cached for offline use with **negotiated HTTP caching** (respect validators / revalidation when online). After a successful first load, the shell and previously fetched configs remain available offline; online revisits revalidate per cache policy.

## Docs policy

English docs under `docs/`, each kept short (≤5000 characters). Describe supported behavior only; update the doc that owns a changed contract rather than duplicating lists across files.
