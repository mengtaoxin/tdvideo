# Commands

Node **>=24**. Private `@mengtaoxin/*` packages need `NODE_AUTH_TOKEN` before `npm install` (see `.npmrc`).

## Install

```bash
npm install
```

## Develop and build

| Command              | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Vite dev server (default port **5173**)  |
| `npm run build`      | Type-check + production build to `dist/` |
| `npm run build-only` | Vite build without type-check            |
| `npm run preview`    | Serve the production build locally       |
| `npm run type-check` | `tsc -b`                                 |

## Lint and format

| Command                | Purpose                          |
| ---------------------- | -------------------------------- |
| `npm run lint`         | Oxlint                           |
| `npm run lint:fix`     | Oxlint with autofix              |
| `npm run format`       | Oxfmt write                      |
| `npm run format:check` | Oxfmt check only                 |
| `npm run check`        | format:check + lint + type-check |

## Test and verify

Unit, coverage, and e2e: see [testing.md](./testing.md).

| Command          | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `npm run verify` | Full gate: `check` + coverage + e2e (same pieces as evolving verify) |

## Deploy

Production hosting on Vercel via GitHub Actions: see [deployment.md](./deployment.md).

## Agent workflow

```bash
npx evolving explain
```

Progressive stages live in `evolving.yml` (orient → edit → prepare → verify). After edits: `npx evolving run prepare`, then `npx evolving run verify`. On failure or a truncated view: `npx evolving status`.
