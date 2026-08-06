from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from pydantic import BaseModel
from rag.pipeline import pipeline

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    language: str = "en"

class ChatResponse(BaseModel):
    summary: str
    applicable_law: str
    explanation: str
    rights: str
    next_steps: str
    required_documents: str
    government_website: str
    disclaimer: str
    confidence_score: float

@router.post("/", response_model=ChatResponse)
def chat_with_bot(request: ChatRequest, db: Session = Depends(get_db)):
    response = pipeline.ask(request.query, request.language)
    return ChatResponse(**response)
