from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import LegalCase
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
from rag.case_navigator import nav_engine
from utils.auth_utils import get_current_user_from_token

router = APIRouter()

class CaseAnalyzeRequest(BaseModel):
    query: str
    answers: Optional[Dict[str, str]] = None
    case_code: Optional[str] = None

class DraftRequest(BaseModel):
    draft_type: str
    case_summary: str
    details: Optional[dict] = None

class SaveCaseRequest(BaseModel):
    case_code: str
    title: str
    category: str
    urgency: str
    progress: int
    data_json: dict

@router.post("/analyze")
def analyze_case(req: CaseAnalyzeRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    analysis = nav_engine.analyze_case(req.query, req.answers, req.case_code)
    return analysis

@router.post("/draft")
def generate_draft(req: DraftRequest):
    draft = nav_engine.generate_draft_document(req.draft_type, req.case_summary, req.details)
    return draft

@router.get("/cases")
def list_saved_cases(db: Session = Depends(get_db), authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    user = get_current_user_from_token(token, db)
    
    cases = db.query(LegalCase).filter(LegalCase.user_id == user.id).order_by(LegalCase.updated_at.desc()).all()
    result = []
    for c in cases:
        try:
            parsed_data = json.loads(c.data_json)
        except Exception:
            parsed_data = {}
        result.append({
            "id": c.id,
            "case_code": c.case_code,
            "title": c.title,
            "category": c.category,
            "urgency": c.urgency,
            "status": c.status,
            "progress": c.progress,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else "",
            "updated_at": c.updated_at.strftime("%Y-%m-%d %H:%M") if c.updated_at else "",
            "data": parsed_data
        })
    return result

@router.post("/cases/save")
def save_case(req: SaveCaseRequest, db: Session = Depends(get_db), authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    user = get_current_user_from_token(token, db)

    existing = db.query(LegalCase).filter(LegalCase.case_code == req.case_code, LegalCase.user_id == user.id).first()
    data_str = json.dumps(req.data_json)
    
    if existing:
        existing.title = req.title
        existing.category = req.category
        existing.urgency = req.urgency
        existing.progress = req.progress
        existing.data_json = data_str
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "case_code": existing.case_code}
    else:
        new_case = LegalCase(
            user_id=user.id,
            case_code=req.case_code,
            title=req.title,
            category=req.category,
            urgency=req.urgency,
            status="In Progress",
            progress=req.progress,
            data_json=data_str
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        return {"status": "created", "case_code": new_case.case_code}
