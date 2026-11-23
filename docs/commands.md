# Commands

Node **>=24**. Private packages (`@mengtaoxin/*`) install via GitHub Packages; set `NODE_AUTH_TOKEN` before `npm install` (see `.npmrc`).

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

Testing commands (unit, coverage, e2e) and how to use them: see [testing.md](./testing.md).

| Command          | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `npm run verify` | Full gate: `check` + coverage + e2e (same pieces as evolving verify) |

## Agent workflow

```bash
npx evolving explain
```

Shows the progressive stages defined in `evolving.yml` (orient → edit → prepare → verify → docs).
