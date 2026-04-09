from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from app.models.database import get_db
from app.models.finance import Expense, AttorneyFee, Payment, Invoice, ExpenseType, ExpenseStatus, BillingType
from app.models.case_new import Case
from app.models.user_new import User


router = APIRouter()

# ========== 费用管理接口 ==========

@router.get("/expenses", response_model=List[dict])
def get_expenses(
    case_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取费用列表"""
    query = db.query(Expense)

    if case_id:
        query = query.filter(Expense.case_id == case_id)

    expenses = query.order_by(Expense.created_at.desc()).all()

    return [
        {
            "id": exp.id,
            "case_id": exp.case_id,
            "expense_type": exp.expense_type.value if exp.expense_type else None,
            "amount": float(exp.amount) if exp.amount else 0,
            "description": exp.description,
            "status": exp.status.value if exp.status else None,
            "apply_date": exp.apply_date.isoformat() if exp.apply_date else None,
            "created_at": exp.created_at.isoformat() if exp.created_at else None
        }
        for exp in expenses
    ]


@router.post("/expenses", response_model=dict)
def create_expense(
    expense_data: dict,
    db: Session = Depends(get_db)
):
    """创建费用记录"""
    try:
        new_expense = Expense(
            case_id=expense_data.get("case_id"),
            expense_type=ExpenseType(expense_data.get("expense_type")),
            amount=expense_data.get("amount"),
            description=expense_data.get("description"),
            receipt=expense_data.get("receipt"),
            notes=expense_data.get("notes")
        )

        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)

        return {
            "id": new_expense.id,
            "message": "费用记录创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========== 律师费管理接口 ==========

@router.get("/attorney-fees", response_model=List[dict])
def get_attorney_fees(
    case_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取律师费列表"""
    query = db.query(AttorneyFee)

    if case_id:
        query = query.filter(AttorneyFee.case_id == case_id)

    fees = query.order_by(AttorneyFee.created_at.desc()).all()

    return [
        {
            "id": fee.id,
            "case_id": fee.case_id,
            "total_amount": float(fee.total_amount) if fee.total_amount else 0,
            "billing_type": fee.billing_type.value if fee.billing_type else None,
            "status": fee.status,
            "paid_amount": float(fee.paid_amount) if fee.paid_amount else 0,
            "created_at": fee.created_at.isoformat() if fee.created_at else None
        }
        for fee in fees
    ]


@router.post("/attorney-fees", response_model=dict)
def create_attorney_fee(
    fee_data: dict,
    db: Session = Depends(get_db)
):
    """创建律师费记录"""
    try:
        new_fee = AttorneyFee(
            case_id=fee_data.get("case_id"),
            total_amount=fee_data.get("total_amount"),
            billing_type=BillingType(fee_data.get("billing_type")),
            contingency_percentage=fee_data.get("contingency_percentage"),
            hourly_rate=fee_data.get("hourly_rate"),
            billable_hours=fee_data.get("billable_hours"),
            contract_date=fee_data.get("contract_date"),
            notes=fee_data.get("notes")
        )

        db.add(new_fee)
        db.commit()
        db.refresh(new_fee)

        return {
            "id": new_fee.id,
            "message": "律师费记录创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========== 收款记录接口 ==========

@router.get("/payments", response_model=List[dict])
def get_payments(
    case_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取收款列表"""
    query = db.query(Payment)

    if case_id:
        query = query.filter(Payment.case_id == case_id)

    payments = query.order_by(Payment.payment_date.desc()).all()

    return [
        {
            "id": payment.id,
            "case_id": payment.case_id,
            "attorney_fee_id": payment.attorney_fee_id,
            "amount": float(payment.amount) if payment.amount else 0,
            "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
            "payment_method": payment.payment_method,
            "payer": payment.payer,
            "receipt_number": payment.receipt_number,
            "invoice_number": payment.invoice_number,
            "created_at": payment.created_at.isoformat() if payment.created_at else None
        }
        for payment in payments
    ]


@router.post("/payments", response_model=dict)
def create_payment(
    payment_data: dict,
    db: Session = Depends(get_db)
):
    """创建收款记录"""
    try:
        new_payment = Payment(
            case_id=payment_data.get("case_id"),
            attorney_fee_id=payment_data.get("attorney_fee_id"),
            amount=payment_data.get("amount"),
            payment_date=datetime.fromisoformat(payment_data.get("payment_date")) if payment_data.get("payment_date") else datetime.utcnow(),
            payment_method=payment_data.get("payment_method"),
            payer=payment_data.get("payer"),
            receipt_number=payment_data.get("receipt_number"),
            invoice_number=payment_data.get("invoice_number"),
            notes=payment_data.get("notes")
        )

        # 更新律师费的已收金额
        attorney_fee = db.query(AttorneyFee).filter(
            AttorneyFee.id == payment_data.get("attorney_fee_id")
        ).first()

        if attorney_fee:
            attorney_fee.paid_amount = (attorney_fee.paid_amount or 0) + payment_data.get("amount", 0)
            if attorney_fee.paid_amount >= attorney_fee.total_amount:
                attorney_fee.status = "paid"
            elif attorney_fee.paid_amount > 0:
                attorney_fee.status = "partial"

        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)

        return {
            "id": new_payment.id,
            "message": "收款记录创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========== 财务统计接口 ==========

@router.get("/cases/{case_id}/summary", response_model=dict)
def get_case_finance_summary(
    case_id: int,
    db: Session = Depends(get_db)
):
    """获取案件财务统计"""
    try:
        # 获取案件信息
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="案件不存在")

        # 计算总支出
        expenses = db.query(Expense).filter(Expense.case_id == case_id).all()
        total_expenses = sum(float(exp.amount or 0) for exp in expenses)

        # 获取律师费信息
        attorney_fees = db.query(AttorneyFee).filter(AttorneyFee.case_id == case_id).all()
        total_attorney_fees = sum(float(fee.total_amount or 0) for fee in attorney_fees)
        paid_attorney_fees = sum(float(fee.paid_amount or 0) for fee in attorney_fees)

        # 计算利润
        profit = paid_attorney_fees - total_expenses
        profit_margin = (profit / paid_attorney_fees * 100) if paid_attorney_fees > 0 else 0

        # 费用分类统计
        expense_breakdown = {}
        for exp in expenses:
            exp_type = exp.expense_type.value if exp.expense_type else "其他"
            if exp_type not in expense_breakdown:
                expense_breakdown[exp_type] = 0
            expense_breakdown[exp_type] += float(exp.amount or 0)

        return {
            "case_id": case_id,
            "case_name": case.case_name,
            "total_expenses": total_expenses,
            "total_attorney_fees": total_attorney_fees,
            "paid_attorney_fees": paid_attorney_fees,
            "pending_attorney_fees": total_attorney_fees - paid_attorney_fees,
            "profit": profit,
            "profit_margin": profit_margin,
            "expense_breakdown": expense_breakdown
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))