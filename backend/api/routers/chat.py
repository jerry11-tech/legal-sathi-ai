from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import ChatHistory
from pydantic import BaseModel
from rag.pipeline import pipeline
from utils.auth_utils import get_current_user_from_token

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
def chat_with_bot(
    request: ChatRequest,
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    response = pipeline.ask(request.query, request.language)

    user = None
    if authorization and authorization.startswith("Bearer "):
        try:
            user = get_current_user_from_token(authorization.split(" ")[1], db)
        except Exception:
            user = None

    history = ChatHistory(
        user_id=user.id if user else None,
        query=request.query,
        response=response.get("summary", ""),
        domain=response.get("applicable_law") or None,
    )
    db.add(history)
    db.commit()

    return ChatResponse(**response)
