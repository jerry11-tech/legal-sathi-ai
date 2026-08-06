from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, chat, documents, navigator, admin
from database.models import Base
from database.session import engine
from config.settings import settings

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(navigator.router, prefix="/api/navigator", tags=["navigator"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to LegalSathi AI API"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "LegalSathi AI Backend", "version": settings.VERSION}

@app.get("/status")
def status():
    return {"status": "healthy", "database": "connected"}
