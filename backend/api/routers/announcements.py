from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database.session import get_db
from database.models import GovernmentAnnouncement
from services.law_sync import INITIAL_VERIFIED_ANNOUNCEMENTS, is_verified_government_domain

router = APIRouter()

class AnnouncementSchema(BaseModel):
    id: int
    gazette_notification_no: str
    title: str
    ministry: str
    publication_date: str
    effective_date: Optional[str] = None
    official_pdf_url: str
    pdf_sha256: str
    is_verified_source: bool
    act_affected: str
    summary_old_rule: Optional[str] = None
    summary_new_rule: str
    key_citizen_impact: str

@router.get("/latest", response_model=List[AnnouncementSchema])
def get_latest_announcements(db: Session = Depends(get_db)):
    """Returns all verified government law announcements and gazette updates."""
    try:
        announcements = db.query(GovernmentAnnouncement).order_by(GovernmentAnnouncement.id.desc()).all()
        if not announcements:
            return INITIAL_VERIFIED_ANNOUNCEMENTS
        return announcements
    except Exception:
        return INITIAL_VERIFIED_ANNOUNCEMENTS

@router.get("/verify")
def verify_document(url: str = Query(...)):
    """Verifies whether a given legal document link originates from an official Government portal."""
    is_valid = is_verified_government_domain(url)
    return {
        "url": url,
        "is_verified_government_source": is_valid,
        "status": "Verified Official Government Portal" if is_valid else "Third-Party / Unverified Link",
    }
