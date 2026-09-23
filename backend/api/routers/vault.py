import os
import uuid
import hashlib
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import EvidenceFile, AuditLog
from utils.auth_utils import get_current_user_from_token

def _fmt_size(byte_count) -> str:
    byte_count = byte_count or 0
    if byte_count < 1024:
        return f"{byte_count} B"
    kb = byte_count / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    return f"{kb / 1024:.2f} MB"


router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "evidence")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx",
    ".txt", ".xls", ".xlsx", ".csv",
}
MAX_FILE_SIZE_MB = 10


def _get_user(authorization: str, db: Session):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    return get_current_user_from_token(token, db)


@router.post("/upload")
def upload_evidence(
    db: Session = Depends(get_db),
    authorization: str = Header(None),
    file: UploadFile = File(...),
    category: str = Form("Document Evidence"),
):
    user = _get_user(authorization, db)

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = file.file.read()
    file_size = len(contents)
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_FILE_SIZE_MB} MB limit")

    sha256 = hashlib.sha256(contents).hexdigest()

    stored_name = f"{uuid.uuid4().hex}{ext}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(stored_path, "wb") as out:
        out.write(contents)

    record = EvidenceFile(
        user_id=user.id,
        filename=file.filename,
        stored_name=stored_name,
        category=category,
        file_type=ext.lstrip(".").upper() or "FILE",
        file_size=file_size,
        sha256=sha256,
    )
    db.add(record)
    db.add(AuditLog(user_id=user.id, action="EVIDENCE_UPLOADED"))
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "id": record.id,
        "name": record.filename,
        "size": _fmt_size(record.file_size),
        "category": record.category,
        "type": record.file_type,
        "uploadedAt": record.created_at.strftime("%d %b %Y, %I:%M %p") if record.created_at else "",
        "sha256": record.sha256,
    }


@router.get("/files")
def list_evidence(
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    user = _get_user(authorization, db)
    records = (
        db.query(EvidenceFile)
        .filter(EvidenceFile.user_id == user.id)
        .order_by(EvidenceFile.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.filename,
            "size": _fmt_size(r.file_size),
            "category": r.category or "Document Evidence",
            "type": r.file_type or "FILE",
            "uploadedAt": r.created_at.strftime("%d %b %Y, %I:%M %p") if r.created_at else "",
            "sha256": r.sha256,
        }
        for r in records
    ]


@router.get("/download/{doc_id}")
def download_evidence(
    doc_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    user = _get_user(authorization, db)
    record = db.query(EvidenceFile).filter(EvidenceFile.id == doc_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    if record.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this file")

    stored_path = os.path.join(UPLOAD_DIR, record.stored_name)
    if not os.path.exists(stored_path):
        raise HTTPException(status_code=404, detail="File content missing on server")

    db.add(AuditLog(user_id=user.id, action="EVIDENCE_DOWNLOADED"))
    db.commit()
    return FileResponse(stored_path, filename=record.filename)


@router.delete("/{doc_id}")
def delete_evidence(
    doc_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    user = _get_user(authorization, db)
    record = db.query(EvidenceFile).filter(EvidenceFile.id == doc_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    if record.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    stored_path = os.path.join(UPLOAD_DIR, record.stored_name)
    if os.path.exists(stored_path):
        try:
            os.remove(stored_path)
        except OSError:
            pass

    db.delete(record)
    db.add(AuditLog(user_id=user.id, action="EVIDENCE_DELETED"))
    db.commit()
    return {"status": "success", "message": "File deleted"}