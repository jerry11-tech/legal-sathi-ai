import os
import sys

# Ensure backend directory is in Python path for all environments
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, chat, documents, navigator, admin, announcements, vault
from database.models import Base, User
from database.session import engine, SessionLocal
from config.settings import settings
from utils.security import get_password_hash

# Ensure database tables exist
Base.metadata.create_all(bind=engine)


def _bootstrap_admin():
    email = (settings.ADMIN_EMAIL or "").strip().lower()
    password = settings.ADMIN_PASSWORD or ""
    if not email or not password:
        return
    with SessionLocal() as db:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return
        admin_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            first_name=settings.ADMIN_FIRST_NAME,
            last_name=settings.ADMIN_LAST_NAME,
            role="admin",
            is_verified=True,
            is_active=True,
            phone=settings.ADMIN_PHONE,
            country=settings.ADMIN_COUNTRY,
            state=settings.ADMIN_STATE,
        )
        db.add(admin_user)
        db.commit()


_bootstrap_admin()

app = FastAPI(
    title="LegalSathi AI",
    description="AI-powered multilingual Legal Information and Guidance Platform",
    version="1.0.0"
)

# CORS middleware
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(navigator.router, prefix="/api/navigator", tags=["navigator"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(announcements.router, prefix="/api/announcements", tags=["announcements"])
app.include_router(vault.router, prefix="/api/vault", tags=["vault"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LegalSathi AI API"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "LegalSathi AI Backend", "version": settings.VERSION}

@app.get("/status")
def status():
    return {"status": "healthy", "database": "connected"}


@app.get("/debug/env")
def debug_env():
    return {
        "admin_email_set": bool(settings.ADMIN_EMAIL),
        "admin_password_set": bool(settings.ADMIN_PASSWORD),
        "gemini_api_key_set": bool(settings.GEMINI_API_KEY),
        "root_dotenv_exists": os.path.exists(".env"),
        "secrets_dotenv_exists": os.path.exists("/etc/secrets/.env"),
        "secrets_dir_exists": os.path.isdir("/etc/secrets"),
    }
