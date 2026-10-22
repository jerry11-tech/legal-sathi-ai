# LegalSathi AI — Specialized Indian Legal Assistant

LegalSathi AI is an AI-powered legal assistant specialized in Indian statutory law, offering grounded RAG retrieval, structured legal explanations, official India Code citations, and safety guardrails.

## Architecture & Upgrade Summary
- **Corpus Pipeline (`ml/`)**: Reproducible ingestion of 17 authoritative Indian statutes (2,336 sections) from India Code (`indiacode.gov.in`) with BM25 indexing, dedup, and leakage-guarded splits.
- **Instruction Dataset (`ml/instruct.py`)**: 1,765 grounded instruction-tuning examples across 11 categories for QLoRA fine-tuning.
- **Real RAG (`backend/rag/real_rag.py`)**: BM25 retrieval engine delivering structured 9-field responses with official India Code citation handles.
- **Evaluation Harness (`tests/eval_harness.py`)**: 4-way evaluation suite against golden test cases.

---

## Architecture & Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript (Deployed on **Vercel Free**)
- **Backend**: FastAPI, Python 3.12, Gunicorn, Uvicorn, SQLAlchemy 2.0 (Deployed on **Render Free**)
- **Database**: PostgreSQL (Hosted on Supabase/Neon or SQLite for local dev)
- **AI Engine**: Gemini API, Sentence Transformers, RAG Pipeline
- **Authentication**: JWT Auth, Argon2/Bcrypt, Guest Chat Limit (5 chats max)

---

## Production Deployment (100% Free Stack)

### Step 1: Database Setup (Supabase / Neon)
1. Create a free account at [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Create a new PostgreSQL database.
3. Copy your database connection string: `postgresql://user:password@ep-xyz.neon.tech/legalsathi_db`.

### Step 2: Backend Deployment (Render Free)
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New +** -> **Blueprint**.
2. Connect the GitHub repository: `jerry11-tech/legal-sathi-ai`.
3. Set the Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL URL (or default SQLite)
   - `SECRET_KEY`: Random 32+ character string
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `ALLOWED_ORIGINS`: `https://<your-vercel-app>.vercel.app`
4. Deploy the backend service. Your backend API URL will be `https://legalsathi-backend-owxr.onrender.com`.

### Step 3: Frontend Deployment (Vercel Free)
1. Go to [Vercel](https://vercel.com/new) and import `jerry11-tech/legal-sathi-ai`.
2. Set **Root Directory** to `frontend`.
3. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://legalsathi-backend-owxr.onrender.com`
4. Click **Deploy**.

---

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/jerry11-tech/legal-sathi-ai.git
cd legal-sathi-ai
```

---

## API Endpoints & Getting Started
- **Frontend App**: `http://localhost:3000`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **System Status**: `http://localhost:8000/status`
- See [docs/UPGRADE_GUIDE.md](docs/UPGRADE_GUIDE.md) for full setup, dataset building, training, and deployment instructions.
