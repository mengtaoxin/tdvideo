# Testing

**Vitest** (jsdom) for unit tests; **Playwright** (Chromium) for e2e. Coverage via `@vitest/coverage-v8` with a **50%** floor on lines, branches, functions, and statements.

## Unit (Vitest)

| Command                 | Purpose                                |
| ----------------------- | -------------------------------------- |
| `npm test`              | Run unit tests once                    |
| `npm run test:watch`    | Watch mode                             |
| `npm run test:coverage` | Unit tests + coverage; fails under 50% |

- Setup: `src/__tests__/setup.ts`.
- Tests live under `src/__tests__/` (co-located `*.test.ts(x)` also work).
- Coverage includes `src/**/*.{ts,tsx}`; excludes `__tests__`, `main.tsx`, `routeTree.gen.ts`, and `locales/`.
- `e2e/` is excluded from Vitest.

Prefer unit tests for pure helpers under `src/lib/` (configs, history, playback).

## E2E (Playwright)

| Command            | Purpose                     |
| ------------------ | --------------------------- |
| `npm run test:e2e` | Chromium tests under `e2e/` |

- Local: starts or reuses Vite on **5173**.
- CI: builds against `preview` on **4173**.

## Full verify

```bash
npm run verify
```

Runs format check, lint, type-check, unit coverage, and e2e. Prefer this (or `npx evolving run verify`) before handing off.

## Manual checks

Useful when UI is involved but not yet covered by e2e:

- Language switch updates chrome (en / zh).
- Feedback opens the GitHub new-issue URL only after confirm.
- After a first online load, shell and previously fetched configs remain usable offline (PWA).
