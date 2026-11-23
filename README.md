# tdvideo

Frontend-only online video player (Vite + React + TypeScript). No backend in this repo.

## Requirements

- **Node >=24**
- **`NODE_AUTH_TOKEN`** — GitHub Packages auth for `@mengtaoxin/*` (see `.npmrc`)

## Quick start

```bash
export NODE_AUTH_TOKEN=<github-pat-with-read:packages>
npm install
npm run dev
```

| Command          | Purpose                         |
| ---------------- | ------------------------------- |
| `npm run build`  | Type-check + production build   |
| `npm run verify` | Lint, type-check, coverage, e2e |

Full command list, stack, testing, and layout: see [`docs/`](./docs/) (`commands.md`, `tech-stack.md`, `testing.md`, `file-structure.md`).

Agents: start with `npx evolving explain` (see [`AGENTS.md`](./AGENTS.md)).

## Repository

https://github.com/mengtaoxin/tdvideo
