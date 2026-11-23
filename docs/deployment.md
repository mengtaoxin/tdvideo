# Deployment (Vercel + GitHub Actions)

Production is published only from GitHub Actions (Vercel CLI). The app is a **static Vite SPA**; there are no Vercel Functions or server runtime.

| Setting        | Value                                     |
| -------------- | ----------------------------------------- |
| Framework      | Vite                                      |
| Install        | `npm ci` (Node **>=24**)                  |
| Build          | `npm run build` → `dist/`                 |
| Hosting        | Static files + SPA fallback (Vite preset) |
| Production URL | `https://tdvideo.smt.sh` (Vercel + DNS)   |

Repo config: [`vercel.json`](../vercel.json) (framework, build/output paths, Git auto-deploy off). Workflow: [`.github/workflows/vercel-production.yml`](../.github/workflows/vercel-production.yml) (`push` to `main`, `workflow_dispatch`).

## GitHub secrets

Add these in the repository **Settings → Secrets and variables → Actions** (never commit values).

| Secret              | Purpose                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel personal or team token with deploy access                                                           |
| `VERCEL_ORG_ID`     | Team or user ID from Vercel                                                                                |
| `VERCEL_PROJECT_ID` | Linked project ID                                                                                          |
| `NODE_AUTH_TOKEN`   | GitHub PAT (or `GITHUB_TOKEN` with `read:packages`) for `@mengtaoxin/*` on GitHub Packages during `npm ci` |

Read IDs after linking locally: `npx vercel link`, then copy `orgId` and `projectId` from `.vercel/project.json` (do not commit that folder).

## Vercel project setup (one-time)

1. Create or import a project for this repo; framework preset **Vite**, root `.`, build `npm run build`, output `dist/`.
2. **Production custom domain**: add `tdvideo.smt.sh` on the project; point DNS (CNAME or A per Vercel) at the values Vercel shows.
3. **CLI-only publishing**: either skip connecting the GitHub repo in Vercel, or leave it connected and rely on `"git.deploymentEnabled": false` in `vercel.json` so Vercel does not auto-deploy on git pushes.
4. Optional: add `NODE_AUTH_TOKEN` as a Vercel **environment variable** on the project if you build on Vercel elsewhere; the GitHub workflow passes it into `vercel build` for `npm ci`.

## Workflow behavior

On each run: checkout → `vercel pull` (production) → `vercel build --prod` → `vercel deploy --prebuilt --prod`. Concurrency group `vercel-production` does **not** cancel an in-flight production deploy.

No workflow runs on pull requests, so Vercel/GitHub production secrets are not exposed to untrusted PRs.
