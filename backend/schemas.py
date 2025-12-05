from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    amount: float
    type: str
    category: Optional[str] = None
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True
