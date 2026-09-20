from fastapi import HTTPException
from sqlalchemy.orm import Session
from database.models import User
from utils.security import decode_token

def get_current_user_from_token(token: str, db: Session) -> User:
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
