from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    api_token = Column(String, unique=True, nullable=True, index=True)
    reset_token = Column(String, unique=True, nullable=True, index=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="user")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # "credit" or "debit"
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="transactions")
