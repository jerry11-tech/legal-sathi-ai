from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database.session import get_db
from database.models import User, GeneratedDocument, ChatHistory, LegalCase, AuditLog, SystemSetting, LegalTemplate, KnowledgeFile

router = APIRouter()

class ResetUserPasswordRequest(BaseModel):
    user_id: int
    new_password: str

class TemplateCreateRequest(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    fields_json: str

class KnowledgeUploadRequest(BaseModel):
    filename: str
    category: str
    file_path: str
    file_size: Optional[str] = "1.2 MB"


@router.post("/users/reset-password")
def admin_reset_user_password(req: ResetUserPasswordRequest, token: str = Query(...), db: Session = Depends(get_db)):
    admin = verify_admin_access(token, db)
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.add(AuditLog(user_id=admin.id, action=f"ADMIN_RESET_USER_{user.id}_PASSWORD"))
    db.commit()
    return {"status": "success", "message": f"Password reset for user {user.email}"}


@router.get("/documents")
def get_all_documents(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)
    docs = db.query(GeneratedDocument).order_by(GeneratedDocument.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "doc_type": d.doc_type,
            "content": d.content[:200] + "...",
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M") if d.created_at else "",
        }
        for d in docs
    ]


@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    admin = verify_admin_access(token, db)
    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.add(AuditLog(user_id=admin.id, action=f"ADMIN_DELETED_DOC_{doc_id}"))
    db.commit()
    return {"status": "success", "message": f"Document {doc_id} deleted."}


@router.get("/templates")
def get_templates(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)
    templates = db.query(LegalTemplate).all()
    if not templates:
        # Return default master templates
        return [
            {"id": 1, "name": "FIR Complaint Draft", "category": "Police Complaints", "description": "Standard Indian Police FIR Registration Template"},
            {"id": 2, "name": "RTI Application Form", "category": "RTI Applications", "description": "Right to Information Act Section 6(1) Format"},
            {"id": 3, "name": "Rental Dispute Notice", "category": "Rental Laws", "description": "Notice for Security Deposit Recovery / Lease Breach"},
            {"id": 4, "name": "Consumer Rights Complaint", "category": "Consumer Protection", "description": "Notice under Consumer Protection Act 2019"},
            {"id": 5, "name": "Cyber Crime Complaint", "category": "Cyber Fraud", "description": "National Cyber Crime Reporting Portal Draft"},
            {"id": 6, "name": "Legal Notice for Non-Payment", "category": "Legal Notice", "description": "Formal Advocate Notice for Recovery of Dues"},
            {"id": 7, "name": "Self-Affidavit Draft", "category": "Affidavit", "description": "General General Purpose Indian Sworn Affidavit"},
            {"id": 8, "name": "POSH Workplace Complaint", "category": "Women's Rights", "description": "Sexual Harassment at Workplace (POSH) ICC Draft"},
        ]
    return templates


@router.get("/knowledge")
def get_knowledge_files(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)
    files = db.query(KnowledgeFile).all()
    if not files:
        return [
            {"id": 1, "filename": "Bharatiya_Nyaya_Sanhita_2023.pdf", "category": "Acts", "file_size": "4.2 MB", "uploaded_at": "2026-01-10"},
            {"id": 2, "filename": "Bharatiya_Nagarik_Suraksha_Sanhita_2023.pdf", "category": "Acts", "file_size": "5.1 MB", "uploaded_at": "2026-01-12"},
            {"id": 3, "filename": "IT_Act_2000_Section66D_Guidelines.pdf", "category": "Government Notifications", "file_size": "1.8 MB", "uploaded_at": "2026-02-01"},
            {"id": 4, "filename": "Supreme_Court_Arnesh_Kumar_Landmark_Judgement.pdf", "category": "Court Judgements", "file_size": "2.4 MB", "uploaded_at": "2026-02-15"},
        ]
    return files
from pydantic import BaseModel
from typing import Optional, List
import json
from datetime import datetime
from utils.security import get_password_hash, decode_token

router = APIRouter()

class UserActionRequest(BaseModel):
    user_id: int
    action: str # 'suspend', 'activate', 'delete', 'make_admin', 'make_user'

class SettingUpdateRequest(BaseModel):
    key: str
    value: str

def verify_admin_access(token: str, db: Session):
    payload = decode_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if not email or role != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    user = db.query(User).filter(User.email == email, User.role == "admin").first()
    if not user:
        raise HTTPException(status_code=403, detail="Administrator access required")
    return user


@router.get("/stats")
def get_admin_stats(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    verified_users = db.query(User).filter(User.is_verified == True).count()
    total_chats = db.query(ChatHistory).count()
    total_documents = db.query(GeneratedDocument).count()
    total_cases = db.query(LegalCase).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "verified_users": verified_users,
        "chats_today": total_chats,
        "generated_documents": total_documents,
        "saved_cases": total_cases,
        "api_usage": "Normal (99.9% uptime)",
        "most_used_category": "Rental Disputes & Women's Rights",
        "average_response_time": "0.45s",
        "storage_used": "14.2 MB",
    }


@router.get("/users")
def get_all_users(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)
    users = db.query(User).order_by(User.created_at.desc()).all()
    res = []
    for u in users:
        res.append({
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "preferred_language": u.preferred_language,
            "country": u.country,
            "state": u.state,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else "",
        })
    return res


@router.post("/users/action")
def user_action(req: UserActionRequest, token: str = Query(...), db: Session = Depends(get_db)):
    admin = verify_admin_access(token, db)
    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own active admin account")

    if req.action == "suspend":
        target_user.is_active = False
        action_text = "USER_SUSPENDED"
    elif req.action == "activate":
        target_user.is_active = True
        action_text = "USER_ACTIVATED"
    elif req.action == "delete":
        db.delete(target_user)
        db.commit()
        return {"status": "success", "message": f"User ID {req.user_id} deleted."}
    elif req.action == "make_admin":
        target_user.role = "admin"
        action_text = "ROLE_CHANGED_TO_ADMIN"
    elif req.action == "make_user":
        target_user.role = "user"
        action_text = "ROLE_CHANGED_TO_USER"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.add(AuditLog(user_id=admin.id, action=action_text))
    db.commit()
    return {"status": "success", "message": f"User ID {req.user_id} updated: {req.action}"}


@router.get("/settings")
def get_system_settings(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_access(token, db)
    settings = db.query(SystemSetting).all()
    res = {s.setting_key: s.setting_value for s in settings}
    # Defaults
    res.setdefault("maintenance_mode", "false")
    res.setdefault("smtp_host", "smtp.gmail.com")
    res.setdefault("smtp_port", "587")
    res.setdefault("default_language", "en")
    res.setdefault("rag_chunk_size", "500")
    return res


@router.post("/settings")
def update_system_setting(req: SettingUpdateRequest, token: str = Query(...), db: Session = Depends(get_db)):
    admin = verify_admin_access(token, db)
    setting = db.query(SystemSetting).filter(SystemSetting.setting_key == req.key).first()
    if setting:
        setting.setting_value = req.value
    else:
        db.add(SystemSetting(setting_key=req.key, setting_value=req.value))

    db.add(AuditLog(user_id=admin.id, action=f"SETTING_UPDATED_{req.key}"))
    db.commit()
    return {"status": "success", "key": req.key, "value": req.value}
