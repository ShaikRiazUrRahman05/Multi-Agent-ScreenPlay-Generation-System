# LangGraph Cinema Agent

AI-first toolchain that turns a one-line movie idea into a screenplay. A FastAPI service orchestrates a LangGraph pipeline (Plotter → Character → Dialogue → Editor) backed by OpenAI models, persistent vector memory, and a MongoDB-powered auth/profile layer. Two frontends are available: a minimal vanilla JS UI served from `static/` and a richer Vite + React experience in `frontend/`.

## Highlights
- **Multi-agent workflow**: Plotter builds the outline, Character enriches bios, Dialogue drafts scenes (supports targeted rewrites), Editor polishes the final script.
- **Semantic memory**: `memory/vector_memory.py` stores outlines, characters, and dialogues in a Chroma collection so partial rewrites can reuse and merge prior context.
- **Secure auth & settings**: JWT-based auth with hashed passwords; optional per-user OpenAI key is encrypted with `SECRET_KEY` before storage.
- **Flexible UIs**: Out-of-the-box static dashboard at `/` plus the ScriptAI React app with tabs, diffed scene rewrites, and PDF export.

## Project Layout
- `main.py` – FastAPI entrypoint, mounts `static/`, exposes `/api/run` and auth/profile routers.
- `workflow/` – LangGraph definition (`graph.py`, `states.py`) describing pipeline order and rewrite routing.
- `agents/` – LLM workers: `plotter.py`, `character.py`, `dialogue.py`, `editor.py`.
- `memory/` & `memory_store/` – Vector memory wrapper (Chroma + OpenAI embeddings) and persisted data.
- `db/`, `core/`, `schemas/`, `routers/` – Mongo client, security utilities, Pydantic models, and API routers.
- `static/` – Minimal HTML/JS/CSS UI served by FastAPI.
- `frontend/` – Vite/React frontend (shadcn UI, React Query, router, PDF export).

## Workflow
- `POST /api/run` accepts `{ user_input, user_action?, target_scene? }`.
  - `user_action`: `full_run` (default), `rewrite_scene` (+ `target_scene`), `rewrite_characters`, `rewrite_plot`.
  - The graph starts at Plotter unless a rewrite routes directly to Character or Dialogue.
  - Dialogue agent can merge rewritten scenes with prior dialogue via vector recall; Editor always produces the final screenplay.

## API Surface
- `POST /api/run` → `{ outline, characters, dialogues, final_script }`.
- `POST /api/auth/signup` / `POST /api/auth/login` → `{ access_token, token_type }` (JWT bearer).
- `GET /api/profile/me` / `PUT /api/profile/me` → profile fields.
- `PUT /api/profile/me/api-settings` → update `useOwnKey`, `openaiKey` (encrypted), `keyActive`.

## Environment
Create a `.env` beside `main.py`:

```
OPENAI_API_KEY="sk-..."    # required for all LLM + embedding calls
MONGO_URI="mongodb://localhost:27017"
MONGO_DB_NAME="cinema_agent"
SECRET_KEY="change-me"     # used for JWT + encryption
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Backend Setup & Run
1) Python 3.10+ recommended. Create a venv.
2) Install deps:
   ```bash
   pip install -r requirements.txt motor python-jose[cryptography] passlib cryptography
   ```
3) Start API:
   ```bash
   uvicorn main:api --reload --port 8000
   ```
   The static UI is at `http://localhost:8000/`; API lives under `/api/*`.

## Frontend Options
- **Static UI (default)**: already built in `static/` and served by FastAPI; no extra setup.
- **ScriptAI React app** (`frontend/`):
  1. `cd script-muse-ai-29`
  2. Edit `.env` (already present) or set `VITE_API_BASE=http://localhost:8000`
  3. `npm install` (or `bun install`)
  4. `npm run dev` → open the printed URL. Use `npm run build` for a production bundle.

## Data & Persistence
- Chroma store persists under `memory_store/`; delete the folder to start fresh.
- MongoDB holds users and encrypted per-user OpenAI keys. Passwords are hashed with PBKDF2 via passlib; JWTs use `SECRET_KEY` and `HS256`.

## Quick Test (cURL)
```bash
curl -X POST http://localhost:8000/api/run \
  -H "Content-Type: application/json" \
  -d '{"user_input":"Buddy-cop comedy in space", "user_action":"full_run"}'
```

## Notes
- The repo includes a pre-filled `memory_store/`; remove it if you don’t want previous runs influencing similarity recall.
- If you deploy the ScriptAI app separately, point `VITE_API_BASE` to your FastAPI host and serve the built `dist/` via any static host.
