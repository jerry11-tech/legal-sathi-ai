from datetime import datetime, timedelta
import re
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User, VerificationToken, PasswordResetToken, UserSession, AuditLog, PhoneOtp
from pydantic import BaseModel, EmailStr
from typing import Optional
from utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_random_token,
    decode_token,
)
from utils.email_service import (
    send_verification_email,
    send_password_reset_email,
    send_welcome_email,
)
from utils.sms_service import generate_otp, send_otp_sms
from config.settings import settings

router = APIRouter()

class UserRegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    otp_code: Optional[str] = None
    password: str
    confirm_password: str
    preferred_language: str = "en"
    country: str = "India"
    state: str = "Delhi"
    agree_terms: bool
    agree_privacy: bool

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class SendOtpRequest(BaseModel):
    phone: str
    purpose: str = "register"

class VerifyOtpRequest(BaseModel):
    phone: str
    otp_code: str
    purpose: str = "register"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class AdminLoginRequest(BaseModel):
    admin_email: EmailStr
    password: str

def validate_password_strength(password: str):
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")


def _validate_phone(phone: str):
    if not re.fullmatch(r"\+?[0-9]{10,15}", phone):
        raise HTTPException(status_code=400, detail="Enter a valid mobile number")


@router.post("/send-otp")
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    _validate_phone(phone)
    now = datetime.utcnow()

    # A phone number can only be used for one account
    if req.purpose == "register":
        existing_user = db.query(User).filter(User.phone == phone).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="An account already exists with this mobile number")

    existing = (
        db.query(PhoneOtp)
        .filter(PhoneOtp.phone == phone)
        .order_by(PhoneOtp.id.desc())
        .first()
    )
    if existing and existing.resend_at and now < existing.resend_at:
        wait_secs = int((existing.resend_at - now).total_seconds()) + 1
        raise HTTPException(status_code=429, detail=f"Please wait {wait_secs} seconds before requesting a new OTP")

    code = generate_otp()
    for old in db.query(PhoneOtp).filter(PhoneOtp.phone == phone).all():
        db.delete(old)
    otp_entry = PhoneOtp(
        phone=phone,
        otp_code=code,
        purpose=req.purpose,
        expires_at=now + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        resend_at=now + timedelta(seconds=settings.OTP_RESEND_SECONDS),
    )
    db.add(otp_entry)
    db.commit()

    try:
        sent_via, dev_code = send_otp_sms(phone, code)
    except Exception:
        db.delete(otp_entry)
        db.commit()
        raise HTTPException(status_code=502, detail="Failed to send SMS. Please try again.")

    payload = {
        "status": "success",
        "message": "OTP sent to your mobile number.",
        "resend_after": settings.OTP_RESEND_SECONDS,
        "expires_in_minutes": settings.OTP_EXPIRY_MINUTES,
        "sent_via": sent_via,
    }
    if dev_code:
        payload["dev_code"] = dev_code
    return payload


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    _validate_phone(phone)
    now = datetime.utcnow()

    otp_entry = (
        db.query(PhoneOtp)
        .filter(PhoneOtp.phone == phone, PhoneOtp.used == False, PhoneOtp.purpose == req.purpose)
        .order_by(PhoneOtp.id.desc())
        .first()
    )
    if not otp_entry or otp_entry.expires_at < now:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if otp_entry.otp_code != req.otp_code.strip():
        otp_entry.attempts += 1
        if otp_entry.attempts >= 5:
            otp_entry.used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect OTP entered.")
    if otp_entry.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Request a new OTP.")

    return {"status": "success", "message": "Mobile number verified."}


@router.post("/register")
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    if not req.agree_terms or not req.agree_privacy:
        raise HTTPException(status_code=400, detail="You must agree to the Terms & Conditions and Privacy Policy")

    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Password and Confirm Password do not match")

    validate_password_strength(req.password)

    phone = req.phone.strip()
    _validate_phone(phone)

    if not req.otp_code:
        raise HTTPException(status_code=400, detail="OTP is required. Verify your mobile number first.")

    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists")

    existing_phone = db.query(User).filter(User.phone == phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="An account already exists with this mobile number")

    now = datetime.utcnow()
    otp_entry = (
        db.query(PhoneOtp)
        .filter(PhoneOtp.phone == phone, PhoneOtp.used == False, PhoneOtp.purpose == "register")
        .order_by(PhoneOtp.id.desc())
        .first()
    )
    if not otp_entry or otp_entry.expires_at < now:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if otp_entry.otp_code != req.otp_code.strip():
        otp_entry.attempts += 1
        if otp_entry.attempts >= 5:
            otp_entry.used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Incorrect OTP entered.")
    if otp_entry.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Request a new OTP.")

    hashed_pwd = get_password_hash(req.password)

    new_user = User(
        email=req.email.lower(),
        hashed_password=hashed_pwd,
        first_name=req.first_name,
        last_name=req.last_name,
        phone=phone,
        preferred_language=req.preferred_language,
        country=req.country,
        state=req.state,
        role="user",
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Mark OTP as consumed
    otp_entry.used = True
    db.add(AuditLog(user_id=new_user.id, action="USER_REGISTERED"))
    db.commit()

    return {
        "status": "success",
        "message": "Registration successful. You can log in now.",
        "email": new_user.email,
    }


@router.get("/verify-email")
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    token_record = db.query(VerificationToken).filter(VerificationToken.token == token).first()
    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification link is invalid or has expired")

    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.delete(token_record)
    db.add(AuditLog(user_id=user.id, action="EMAIL_VERIFIED"))
    db.commit()

    send_welcome_email(user.email, user.first_name)

    return {
        "status": "success",
        "message": "Email verified successfully!",
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        },
    }


@router.post("/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been suspended. Please contact support.")

    # Check account lock
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(status_code=429, detail="Account locked due to multiple failed login attempts. Try again later.")

    if not verify_password(req.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None

    if not user.is_verified:
        # Auto-verify on first successful login (email delivery is optional in this deployment)
        user.is_verified = True
        db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "id": user.id})

    # Save session
    db.add(UserSession(user_id=user.id, refresh_token=refresh_token, expires_at=datetime.utcnow() + timedelta(days=30)))
    db.add(AuditLog(user_id=user.id, action="USER_LOGIN"))
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "preferred_language": user.preferred_language,
            "country": user.country,
            "state": user.state,
        },
    }


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Return success to prevent user enumeration security risk
        return {"status": "success", "message": "If an account exists, a password reset email has been sent."}

    token_str = generate_random_token()
    db.add(PasswordResetToken(user_id=user.id, token=token_str, expires_at=datetime.utcnow() + timedelta(minutes=30)))
    db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET_REQUESTED"))
    db.commit()

    send_password_reset_email(user.email, token_str)

    return {
        "status": "success",
        "message": "Password reset instructions sent to your email.",
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    validate_password_strength(req.new_password)

    token_record = db.query(PasswordResetToken).filter(PasswordResetToken.token == req.token).first()
    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link is invalid or has expired")

    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    db.delete(token_record)
    db.add(AuditLog(user_id=user.id, action="PASSWORD_RESET_COMPLETED"))
    db.commit()

    return {"status": "success", "message": "Password updated successfully. You can now log in."}


@router.get("/me")
def get_current_user_info(token: str = Query(...), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role,
        "is_verified": user.is_verified,
        "preferred_language": user.preferred_language,
        "country": user.country,
        "state": user.state,
    }


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    theme: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh_access_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account inactive or non-existent")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/profile/update")
def update_profile(req: ProfileUpdateRequest, token: str = Query(...), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.first_name: user.first_name = req.first_name
    if req.last_name: user.last_name = req.last_name
    if req.phone is not None: user.phone = req.phone
    if req.preferred_language: user.preferred_language = req.preferred_language
    if req.theme: user.theme = req.theme
    if req.country: user.country = req.country
    if req.state: user.state = req.state

    db.add(AuditLog(user_id=user.id, action="PROFILE_UPDATED"))
    db.commit()

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "preferred_language": user.preferred_language,
            "theme": user.theme,
            "country": user.country,
            "state": user.state,
        }
    }


@router.post("/profile/change-password")
def change_password(req: ChangePasswordRequest, token: str = Query(...), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(req.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")

    validate_password_strength(req.new_password)

    user.hashed_password = get_password_hash(req.new_password)
    db.add(AuditLog(user_id=user.id, action="PASSWORD_CHANGED"))
    db.commit()

    return {"status": "success", "message": "Password changed successfully"}


@router.delete("/profile/delete")
def delete_account(token: str = Query(...), db: Session = Depends(get_db)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"status": "success", "message": "Your account has been deleted"}


@router.post("/admin/login")
def admin_login(req: AdminLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.admin_email.lower(), User.role == "admin").first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid administrator credentials")

    access_token = create_access_token(data={"sub": user.email, "role": "admin", "id": user.id})
    db.add(AuditLog(user_id=user.id, action="ADMIN_LOGIN"))
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        },
    }
