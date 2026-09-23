from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import GeneratedDocument, AuditLog
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.document_generator import generate_document
from utils.auth_utils import get_current_user_from_token

router = APIRouter()

class DocumentRequest(BaseModel):
    doc_type: str
    details: Optional[Dict] = None

class DocumentResponse(BaseModel):
    id: int
    doc_type: str
    title: str
    category: str
    content: str
    created_at: str = ""

@router.post("/generate", response_model=DocumentResponse)
def generate_document_endpoint(
    request: DocumentRequest,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    result = generate_document(request.doc_type, request.details or {})

    user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user = get_current_user_from_token(token, db)

    doc = GeneratedDocument(
        user_id=user.id if user else None,
        doc_type=result["doc_type"],
        content=result["content"],
    )
    db.add(doc)
    if user:
        db.add(AuditLog(user_id=user.id, action="DOCUMENT_GENERATED"))
    db.commit()
    db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        doc_type=doc.doc_type,
        title=result["title"],
        category=result["category"],
        content=doc.content,
        created_at=doc.created_at.strftime("%Y-%m-%d %H:%M") if doc.created_at else "",
    )

@router.get("/saved", response_model=List[DocumentResponse])
def get_saved_documents(
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    user = get_current_user_from_token(token, db)

    docs = (
        db.query(GeneratedDocument)
        .filter(GeneratedDocument.user_id == user.id)
        .order_by(GeneratedDocument.created_at.desc())
        .all()
    )
    return [
        DocumentResponse(
            id=d.id,
            doc_type=d.doc_type,
            title=d.doc_type,
            category="",
            content=d.content,
            created_at=d.created_at.strftime("%Y-%m-%d %H:%M") if d.created_at else "",
        )
        for d in docs
    ]

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    user = get_current_user_from_token(token, db)

    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this document")

    return DocumentResponse(
        id=doc.id,
        doc_type=doc.doc_type,
        title=doc.doc_type,
        category="",
        content=doc.content,
        created_at=doc.created_at.strftime("%Y-%m-%d %H:%M") if doc.created_at else "",
    )

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    user = get_current_user_from_token(token, db)

    doc = db.query(GeneratedDocument).filter(GeneratedDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    db.delete(doc)
    db.commit()
    return {"status": "success", "message": "Document deleted"}