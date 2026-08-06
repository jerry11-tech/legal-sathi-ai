# LegalSathi AI

## Know Your Rights Before It's Too Late.
An AI-powered multilingual Legal Information and Guidance Platform built with Next.js, FastAPI, PostgreSQL, and AI.

> **Disclaimer**: This platform provides legal information, not legal advice. Always consult a licensed advocate for official legal representation.

---

## Architecture & Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript (Deployed on **Vercel Free**)
- **Backend**: FastAPI, Python 3.12, Gunicorn, Uvicorn, SQLAlchemy 2.0 (Deployed on **Render Free**)
- **Database**: PostgreSQL (Hosted on **Supabase Free** / **Neon Free** or SQLite for local dev)
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
2. Connect the GitHub repository: `buildwithdhiraj-afk/legal-sathi-ai`.
3. Set the Environment Variables:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL URL (or default SQLite)
   - `SECRET_KEY`: Random 32+ character string
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `ALLOWED_ORIGINS`: `https://<your-vercel-app>.vercel.app`
4. Deploy the backend service. Your backend API URL will be `https://<your-render-backend>.onrender.com`.

### Step 3: Frontend Deployment (Vercel Free)
1. Go to [Vercel](https://vercel.com/new) and import `buildwithdhiraj-afk/legal-sathi-ai`.
2. Set **Root Directory** to `frontend`.
3. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://<your-render-backend>.onrender.com`
4. Click **Deploy**.

---

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/buildwithdhiraj-afk/legal-sathi-ai.git
cd legal-sathi-ai

# Option A: Start Backend & Frontend via Batch Scripts (Windows)
start-backend.bat
start-frontend.bat

# Option B: Docker Compose
docker-compose up --build
```

---

## API Endpoints
- **Frontend App**: `http://localhost:3000`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **System Status**: `http://localhost:8000/status`
