from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
import secrets
from datetime import datetime, timedelta
from database import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

class Token(BaseModel):
    token: str
    user: dict

class MessageResponse(BaseModel):
    message: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user"""
    token = credentials.credentials
    user = db.query(User).filter(User.api_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    token = generate_token()
    
    new_user = User(
        username=user_data.username,
        password_hash=hashed_password,
        api_token=token
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "username": new_user.username
        }
    }

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate new token
    token = generate_token()
    user.api_token = token
    db.commit()
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username
        }
    }

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token for the user"""
    user = db.query(User).filter(User.username == request.username).first()
    
    # Always return success to prevent username enumeration
    if not user:
        return {"message": "If the username exists, a reset token has been generated. In production, this would be sent via email."}
    
    # Generate reset token (valid for 1 hour)
    reset_token = generate_token()
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    # In production, send this token via email
    # For now, we'll return it in the response (NOT SECURE for production!)
    return {
        "message": f"Password reset token: {reset_token} (valid for 1 hour). In production, this would be sent via email to the user."
    }

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the reset token"""
    user = db.query(User).filter(User.reset_token == request.reset_token).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.password_hash = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password has been reset successfully"}
