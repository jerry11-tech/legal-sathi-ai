import os
import sys

# Ensure backend directory is in Python path for all environments
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, chat, documents, navigator, admin, announcements
from database.models import Base, User
from database.session import engine, SessionLocal
from config.settings import settings
from utils.security import get_password_hash

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LegalSathi AI",
    description="AI-powered multilingual Legal Information and Guidance Platform",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@legalsathi.ai").first()
        if admin_user:
            admin_user.role = "admin"
            admin_user.hashed_password = get_password_hash("AdminSecure2026!")
            admin_user.is_verified = True
            admin_user.is_active = True
        else:
            admin_user = User(
                email="admin@legalsathi.ai",
                hashed_password=get_password_hash("AdminSecure2026!"),
                first_name="Admin",
                last_name="System",
                role="admin",
                is_verified=True,
                is_active=True,
            )
            db.add(admin_user)
        db.commit()
    except Exception as e:
        print("Startup admin seed error:", e)
    finally:
        db.close()

# CORS middleware
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/")
def read_root():
    return {"message": "Welcome to LegalSathi AI API"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "LegalSathi AI Backend", "version": settings.VERSION}

@app.get("/status")
def status():
    return {"status": "healthy", "database": "connected"}