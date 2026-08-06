from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from pydantic import BaseModel
from typing import List

router = APIRouter()

class DocumentRequest(BaseModel):
    doc_type: str
    details: dict

class DocumentResponse(BaseModel):
    id: int
    doc_type: str
    content: str

@router.post("/generate", response_model=DocumentResponse)
def generate_document(request: DocumentRequest, db: Session = Depends(get_db)):
    # TODO: Integrate AI for document generation based on templates
    generated_content = f"Generated {request.doc_type} based on provided details."
    
    return DocumentResponse(
        id=1,
        doc_type=request.doc_type,
        content=generated_content
    )

@router.get("/saved", response_model=List[DocumentResponse])
def get_saved_documents(db: Session = Depends(get_db)):
    return []
