# File structure

High-level layout for the **tdvideo** frontend. Prefer this map when adding or moving files.

```
tdvideo/
├── AGENTS.md                 # Agent entry: essentials + evolving pointer
├── evolving.yml              # Local progressive stages for @mengtaoxin/evolving
├── package.json              # Scripts, engines (Node >=24), dependencies
├── vite.config.ts            # Vite + React + PWA; alias `@` → `src/`
├── vitest.config.ts          # Unit tests + coverage thresholds
├── playwright.config.ts      # E2E (Chromium); tests under `e2e/`
├── oxlint.config.ts          # Lint via @mengtaoxin/oxc-config stack("react")
├── oxfmt.config.ts           # Format via oxc-config
├── index.html                # SPA shell
├── public/                   # Static assets served as-is
│   └── configs.json          # Default configs catalog (sample media)
├── e2e/                      # Playwright smoke tests
├── docs/                     # English project docs (this folder)
└── src/
    ├── main.tsx              # App bootstrap
    ├── App.tsx               # Root React tree (theme / providers)
    ├── index.css             # Global styles
    ├── routes/               # TanStack Router file-based routes
    ├── components/           # Shared UI (layout, player, lists)
    ├── lib/                  # Pure helpers (configs, history, time)
    ├── db/                   # Dexie schema (history, settings)
    ├── stores/               # Zustand stores
    ├── locales/              # i18next dictionaries (en, zh)
    └── __tests__/            # Vitest setup and co-located unit tests
```

## Conventions

- **Configs**: Default load path is `/configs.json` from `public/configs.json`. Settings may override the URL; overrides live in Dexie.
- **Routes**: File-based TanStack Router under `src/routes/` (generated route tree is not hand-edited).
- **Persistence**: Dexie only — playback history and Settings (including configs URL). No backend.
- **Fixtures**: Sample media, WebVTT, and bullet-comment JSON URLs referenced from `public/configs.json` (or sibling static files under `public/`).
- **Docs**: Contract docs live under `docs/`. Do not mirror source trees into README; keep README short and point here.
