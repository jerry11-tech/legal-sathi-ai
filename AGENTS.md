# LegalSathi AI — Agent Deployment Workflow

One-command full-stack deployment. Services and auth are already configured; do not re-authenticate or recreate projects.

## Project layout

- `backend/` — FastAPI + Uvicorn app, entry `backend.main:app`
- `frontend/` — Next.js 14 app (deploys to Vercel, project `frontend`)

## Infrastructure (already set up — do not recreate)

| Service | Detail |
|---|---|
| GitHub | `jerry11-tech/legal-sathi-ai`, branch `main`, auth via `gh` |
| Vercel | project `frontend` (build dir `frontend`), auth via `vercel` CLI |
| Render | web service `legalsathi-backend` (`srv-dapltbo473hc73c6jhn0`), auth via `render` CLI |

## URLs

- Backend: `https://legalsathi-backend-owxr.onrender.com` (health: `/health`)
- Frontend: production env var `NEXT_PUBLIC_API_URL` = backend URL (already set on Vercel)

## The deployment command

User says: **"Deploy the application"**

OpenCode performs ALL of the following, in order:

1. Inspect repo: `git status` in `C:\Users\dhira\Downloads\legalsathiai`
2. Check for uncommitted changes; if any, commit them to `main` first (unless they are secrets/.env)
3. Build frontend: `npm install` then `npm run build` in `frontend/`
4. Sanity-check backend imports: `python -c "import backend.main"` (or pip install deps as needed)
5. Push to GitHub: `git push origin main` (verify `HEAD == origin/main` after)
6. Deploy backend to Render: `render deployments create --service-id srv-dapltbo473hc73c6jhn0` (or verify Git auto-sync deploy completed)
7. Deploy frontend to Vercel: `vercel --prod` run from `frontend/` (project already linked)
8. Wait for status: `render deployments list srv-dapltbo473hc73c6jhn0` and `vercel ls`
9. Verify deployed URLs:
   - Backend: `curl https://legalsathi-backend-owxr.onrender.com/health`
   - Frontend: fetch the production URL returned by `vercel ls`
10. Report final URLs to the user

## Safety rules (always)

- NEVER print, log, or commit secrets, tokens, API keys, or `.env` files.
- NEVER modify unrelated files; only touch what the task requires.
- If a build or deploy fails, STOP and report the error.
- If auth is expired, tell the user which service needs re-authentication.
- If an action is destructive (DB wipe, project deletion, force push), ask first.
- Do not recreate or duplicate existing projects/services.