from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Numeric, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base
import enum


class ExpenseType(str, enum.Enum):
    """费用类型枚举"""
    LITIGATION = "诉讼费"
    PRESERVATION = "保全费"
    NOTARY = "公证费"
    AUTHENTICATION = "鉴定费"
    TRAVEL = "差旅费"
    POSTAGE = "快递费"
    PRINTING = "打印费"
    OTHER = "其他费用"


class ExpenseStatus(str, enum.Enum):
    """费用状态枚举"""
    PENDING = "待审批"
    APPROVED = "已批准"
    REJECTED = "已拒绝"
    PAID = "已支付"


class BillingType(str, enum.Enum):
    """收费方式枚举"""
    FIXED = "固定收费"
    CONTINGENCY = "风险代理"
    HOURLY = "计时收费"
    HYBRID = "混合收费"


class Expense(Base):
    """费用记录表"""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, index=True)
    expense_type = Column(SQLEnum(ExpenseType), nullable=False, comment="费用类型")
    amount = Column(Numeric(15, 2), nullable=False, comment="金额")
    description = Column(String(500), comment="费用说明")
    status = Column(SQLEnum(ExpenseStatus), default=ExpenseStatus.PENDING, comment="状态")
    applicant_id = Column(Integer, ForeignKey("users_new.id"), comment="申请人ID")
    approver_id = Column(Integer, ForeignKey("users_new.id"), comment="审批人ID")
    apply_date = Column(DateTime, default=datetime.utcnow, comment="申请日期")
    approve_date = Column(DateTime, comment="审批日期")
    payment_date = Column(DateTime, comment="支付日期")
    receipt = Column(String(255), comment="收据URL")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    case = relationship("Case", backref="expenses")


class AttorneyFee(Base):
    """律师费记录表"""
    __tablename__ = "attorney_fees"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, index=True)
    total_amount = Column(Numeric(15, 2), nullable=False, comment="总金额")
    billing_type = Column(SQLEnum(BillingType), nullable=False, comment="收费方式")
    contingency_percentage = Column(Numeric(5, 2), comment="风险代理比例(%)")
    hourly_rate = Column(Numeric(10, 2), comment="计时费率(元/小时)")
    billable_hours = Column(Numeric(10, 2), comment="计费工时")
    status = Column(String(20), default="unpaid", comment="状态: unpaid/partial/paid")
    paid_amount = Column(Numeric(15, 2), default=0, comment="已收金额")
    contract_date = Column(Date, comment="合同日期")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    case = relationship("Case", backref="attorney_fees")
    payments = relationship("Payment", back_populates="attorney_fee", cascade="all, delete-orphan")


class Payment(Base):
    """收款记录表"""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, index=True)
    attorney_fee_id = Column(Integer, ForeignKey("attorney_fees.id"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False, comment="收款金额")
    payment_date = Column(DateTime, nullable=False, comment="收款日期")
    payment_method = Column(String(20), nullable=False, comment="收款方式: 现金/转账/支票/其他")
    payer = Column(String(100), comment="付款人")
    receipt_number = Column(String(100), comment="收据编号")
    invoice_number = Column(String(100), comment="发票编号")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    case = relationship("Case", backref="payments")
    attorney_fee = relationship("AttorneyFee", back_populates="payments")


class Invoice(Base):
    """发票记录表"""
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, comment="发票号码")
    amount = Column(Numeric(15, 2), nullable=False, comment="开票金额")
    invoice_type = Column(String(20), nullable=False, comment="发票类型")
    invoice_date = Column(DateTime, nullable=False, comment="开票日期")
    customer_name = Column(String(200), nullable=False, comment="客户名称")
    customer_tax_number = Column(String(50), comment="客户税号")
    status = Column(String(20), default="未开具", comment="状态: 未开具/已开具/已作废")
    file_url = Column(String(255), comment="发票文件URL")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    case = relationship("Case", backref="invoices")