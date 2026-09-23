from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "LegalSathi AI"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "sqlite:///./legalsathi.db"
    
    # JWT Auth
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Initial admin bootstrap (created at startup when set)
    ADMIN_EMAIL: str = ""
    ADMIN_FIRST_NAME: str = "Admin"
    ADMIN_LAST_NAME: str = "System"
    ADMIN_PASSWORD: str = ""
    ADMIN_PHONE: str = ""
    ADMIN_COUNTRY: str = ""
    ADMIN_STATE: str = ""
    
    # Supabase (Optional fallback)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://frontend-ivory-theta-s5ihbgbldt.vercel.app"
    ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    
    # AI APIs
    GEMINI_API_KEY: str = ""
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"

    # Frontend base URL (used in email links)
    FRONTEND_URL: str = "http://localhost:3000"

    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@legalsathi.ai"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
