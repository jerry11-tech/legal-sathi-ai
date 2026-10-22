from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User, ChatHistory
from pydantic import BaseModel
from rag.pipeline import pipeline
from utils.security import decode_token

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
def chat_with_bot(request: ChatRequest, db: Session = Depends(get_db), token: str = Query(None)):
    # Decode token to get current user (if authenticated)
    user = None
    if token:
        try:
            payload = decode_token(token)
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email).first()
        except Exception:
            user = None

    # Run the RAG pipeline
    response = pipeline.ask(request.query, request.language)

    # Save to chat history if user is authenticated
    if user:
        db_chat = ChatHistory(
            user_id=user.id,
            query=request.query,
            response=str(response),
            domain=pipeline.engine.detect_domain(request.query)[0].get("name") if hasattr(pipeline.engine, 'detect_domain') else None,
            timestamp=None,
        )
        db.add(db_chat)
        db.commit()

    return ChatResponse(**response)