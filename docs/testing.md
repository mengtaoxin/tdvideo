# Testing

tdvideo uses **Vitest** for unit tests and **Playwright** for end-to-end smoke. Coverage is enforced at **50%** (lines, branches, functions, statements) via `@vitest/coverage-v8`.

## Unit (Vitest)

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `npm test`              | Run unit tests once                           |
| `npm run test:watch`    | Watch mode                                    |
| `npm run test:coverage` | Unit tests + coverage report; fails under 50% |

- Environment: **jsdom**; setup file `src/__tests__/setup.ts`.
- Prefer tests next to code under `src/**/__tests__/` or `*.test.ts(x)`.
- Coverage includes `src/**/*.{ts,tsx}`; excludes test folders, `main.tsx`, generated route tree, and locale JSON/dictionaries.
- E2E folder `e2e/` is excluded from Vitest.

Focus unit tests on pure behavior: configs parse/dedupe, playlist ref skipping, subtitle default selection, history upsert, progress time formatting (`mm:ss` / `hh:mm:ss`).

## E2E (Playwright)

| Command            | Purpose                           |
| ------------------ | --------------------------------- |
| `npm run test:e2e` | Chromium smoke tests under `e2e/` |

- Locally the config starts (or reuses) the Vite dev server on **5173**.
- In CI it builds against `preview` on **4173**.
- Typical smoke: navigate routes, change Settings configs URL, open Now Playing from Videos/Playlists with fixtures.

## Full verify

```bash
npm run verify
```

Runs format check, lint, type-check, unit coverage, and e2e. Prefer this before handing off.

## Manual checks

Useful when UI is involved but not yet covered by e2e:

- Language switch updates chrome (en / zh).
- Feedback opens `https://github.com/mengtaoxin/tdvideo/issues/new`.
- After first online load, app shell and previously fetched configs remain usable offline (PWA).
