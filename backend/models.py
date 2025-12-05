from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # "credit" or "debit"
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
