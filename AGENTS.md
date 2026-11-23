# AGENTS

Essentials for automated agents working in **tdvideo**.

## Project

- Frontend-only video player (Vite + React + TypeScript). No backend in this repo.
- Node **>=24**. Install needs `NODE_AUTH_TOKEN` for GitHub Packages (`@mengtaoxin/*`).
- Product and toolchain contracts: `docs/tech-stack.md`, `docs/file-structure.md`, `docs/commands.md`, `docs/testing.md`.

## Before changing code

```bash
npx evolving explain
```

Follow the stages shown there. Do not invent a parallel workflow.

## Habits

- Prefer TDD for behavior (configs, history, formatting helpers).
- Keep docs English and DRY; describe supported behavior only.
- Do not commit unless the user explicitly asks.
