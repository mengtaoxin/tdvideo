# File structure

High-level layout. Use this when adding or moving files; do not mirror the whole tree into README.

```
tdvideo/
├── AGENTS.md              # Agent entry (essentials + evolving pointer)
├── evolving.yml           # Progressive stages for @mengtaoxin/evolving
├── package.json           # Scripts, engines (Node >=24), dependencies
├── vite.config.ts         # Vite + React + PWA; alias `@` → `src/`
├── vitest.config.ts       # Unit tests + coverage
├── playwright.config.ts   # E2E (Chromium); tests under `e2e/`
├── oxlint.config.ts       # Lint via @mengtaoxin/oxc-config stack("react")
├── oxfmt.config.ts        # Format via oxc-config
├── index.html             # SPA shell
├── public/                # Static assets (default configs, fixtures)
├── e2e/                   # Playwright tests
├── docs/                  # Project docs (this folder)
└── src/
    ├── main.tsx           # Bootstrap
    ├── App.tsx            # Root tree (theme / providers)
    ├── routes/            # TanStack Router file-based routes
    ├── components/        # Shared UI (shell, configs, player/)
    ├── lib/               # Pure helpers (configs/, history/, playback/)
    ├── db/                # Dexie (settings, history)
    ├── stores/            # Zustand stores
    ├── locales/           # i18next dictionaries (en, zh)
    └── __tests__/         # Vitest setup and unit tests
```

## Placement

| Concern                                    | Where                                                           |
| ------------------------------------------ | --------------------------------------------------------------- |
| New page / route                           | `src/routes/` (file-based; do not hand-edit `routeTree.gen.ts`) |
| Home configs.json sample UI                | `src/components/ConfigJsonSample.tsx`                           |
| Player UI                                  | `src/components/player/`                                        |
| Catalog parse / fetch / cache              | `src/lib/configs/`                                              |
| History types / formatting                 | `src/lib/history/`                                              |
| Playback helpers (resolve, bullets, media) | `src/lib/playback/`                                             |
| IndexedDB access                           | `src/db/`                                                       |
| Client state                               | `src/stores/`                                                   |
| Default catalog & sample media             | `public/` (`configs.json`, `fixtures/`)                         |
| Unit tests                                 | `src/__tests__/` (or co-located `*.test.ts(x)`)                 |
| E2E                                        | `e2e/`                                                          |

Product contracts (catalog shape, playback, history, PWA): see [tech-stack.md](./tech-stack.md).
Testing layout and commands: see [testing.md](./testing.md).
