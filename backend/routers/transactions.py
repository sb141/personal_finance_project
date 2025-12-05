from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import func
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/transactions/", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_transaction = models.Transaction(
        **transaction.dict(),
        user_id=current_user.id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/transactions/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int, 
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for key, value in transaction.dict().items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions/", response_model=List[schemas.TransactionResponse])
def read_transactions(
    skip: int = 0, 
    limit: int = 100, 
    year: int = None,
    month: int = None,
    date: str = None, # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    
    if date:
        # Filter by specific date
        query = query.filter(func.date(models.Transaction.date) == date)
    elif year and month:
        # Filter by month and year
        from calendar import monthrange
        first_day = datetime(year, month, 1)
        last_day_num = monthrange(year, month)[1]
        last_day = datetime(year, month, last_day_num, 23, 59, 59)
        query = query.filter(models.Transaction.date >= first_day, models.Transaction.date <= last_day)
    
    # Sort by date desc (newest first)
    transactions = query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.get("/reports/weekly")
def get_weekly_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Simple weekly report: Last 7 days aggregation
    today = datetime.utcnow()
    seven_days_ago = today - timedelta(days=7)
    
    # Query for credits and debits in the last 7 days
    results = db.query(
        models.Transaction.date,
        models.Transaction.type,
        models.Transaction.amount
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.date >= seven_days_ago
    ).all()

    # Process data for frontend
    report_data = {}
    
    for date, type, amount in results:
        day_str = date.strftime("%Y-%m-%d")
        if day_str not in report_data:
            report_data[day_str] = {"date": day_str, "credit": 0, "debit": 0}
        
        if type == "credit":
            report_data[day_str]["credit"] += amount
        elif type == "debit":
            report_data[day_str]["debit"] += amount
            
    return list(report_data.values())

@router.get("/reports/monthly")
def get_monthly_report(
    year: int = None, 
    month: int = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # If no year/month provided, use current month
    if year is None or month is None:
        today = datetime.utcnow()
        year = today.year
        month = today.month
    
    # Get first and last day of the month
    from calendar import monthrange
    first_day = datetime(year, month, 1)
    last_day_num = monthrange(year, month)[1]
    last_day = datetime(year, month, last_day_num, 23, 59, 59)
    
    # Query for all transactions in the month
    results = db.query(
        models.Transaction.date,
        models.Transaction.type,
        models.Transaction.amount
    ).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.date >= first_day,
        models.Transaction.date <= last_day
    ).all()
    
    # Process data for frontend
    report_data = {}
    
    for date, type, amount in results:
        day_str = date.strftime("%Y-%m-%d")
        if day_str not in report_data:
            report_data[day_str] = {"date": day_str, "credit": 0, "debit": 0}
        
        if type == "credit":
            report_data[day_str]["credit"] += amount
        elif type == "debit":
            report_data[day_str]["debit"] += amount
            
    return list(report_data.values())

@router.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    transaction = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == current_user.id
    ).first()
    
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully", "id": transaction_id}
