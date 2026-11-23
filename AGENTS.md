# AGENTS

## What this project is

Frontend-only browser video player (Vite + React + TypeScript). No backend in this repo; persistence is Dexie in the browser.

## Core rules

- Before almost any task—and before editing—run `npx evolving explain`. Do not explore or change first and catch up later.
- After code edits: `npx evolving prepare`, then `npx evolving verify`. Prefer prepare / printed `fix` argv over hand-editing format/lint.
- Do not invent one-off scripts for gates already in `evolving.yml`. Do not head/tail/tee evolving stdout; read the full JSON.
- Node **>=24**. Install needs `NODE_AUTH_TOKEN` for GitHub Packages (`@mengtaoxin/*`).
- Do not commit unless the user explicitly asks.

## Core file routing

- `evolving.yml` — progressive stages (see also `docs/commands.md`)
- `docs/file-structure.md` — layout before adding/moving files
- `docs/tech-stack.md` — stack and product contracts
- `docs/commands.md` — npm scripts and evolving entry
- `docs/testing.md` — unit, coverage, e2e, verify

## When you need to

- Change behavior → TDD per `docs/testing.md`; finish with evolving prepare → verify.
- Failed or lost evolving run → `npx evolving status`.
- Unclear stage/topic → `npx evolving explain <topic>`.
- Guidance steps are agent-evaluated (`skip_when`); `finish` runs `kind: run` only after guidance is handled.
- Add/move files → `docs/file-structure.md` first.
- Update contracts → the owning doc under `docs/` (English, supported behavior only).
