from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Boolean, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base
import enum


class CustomerType(str, enum.Enum):
    """客户类型枚举"""
    INDIVIDUAL = "个人"
    ENTERPRISE = "企业"
    OTHER = "其他"


class CustomerSource(str, enum.Enum):
    """客户来源枚举"""
    ONLINE = "网络推广"
    REFERRAL = "客户推荐"
    ADVERTISEMENT = "广告投放"
    EVENT = "线下活动"
    PARTNERSHIP = "合作伙伴"
    OTHER = "其他"


class CustomerStatus(str, enum.Enum):
    """客户状态枚举"""
    ACTIVE = "活跃"
    INACTIVE = "非活跃"
    POTENTIAL = "潜在客户"
    ARCHIVED = "已归档"


class Customer(Base):
    """客户表"""
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True, comment="客户姓名/企业名称")
    customer_type = Column(SQLEnum(CustomerType), nullable=False, comment="客户类型")
    phone = Column(String(20), index=True, comment="联系电话")
    email = Column(String(100), comment="邮箱")
    address = Column(String(500), comment="地址")
    id_number = Column(String(50), comment="身份证号/统一社会信用代码")
    industry = Column(String(100), comment="行业")
    source = Column(SQLEnum(CustomerSource), default=CustomerSource.OTHER, comment="客户来源")
    status = Column(SQLEnum(CustomerStatus), default=CustomerStatus.POTENTIAL, comment="客户状态")
    tags = Column(Text, comment="标签(JSON数组格式)")
    notes = Column(Text, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    communications = relationship("Communication", back_populates="customer", cascade="all, delete-orphan")


# 案件客户关联表
case_customer_association = Table(
    'case_customers',
    Base.metadata,
    Column('case_id', Integer, ForeignKey('cases_new.id'), primary_key=True),
    Column('customer_id', Integer, ForeignKey('customers.id'), primary_key=True),
    Column('relation_type', String(20), comment="关系类型: 原告/被告/第三人")
)


class Communication(Base):
    """沟通记录表"""
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), index=True)
    communication_type = Column(String(20), nullable=False, comment="沟通类型: 面谈/电话/微信/邮件/短信/其他")
    communication_date = Column(DateTime, nullable=False, comment="沟通日期")
    duration_minutes = Column(Integer, comment="沟通时长(分钟)")
    content = Column(Text, nullable=False, comment="沟通内容")
    follow_up_required = Column(Boolean, default=False, comment="是否需要后续跟进")
    follow_up_date = Column(Date, comment="跟进日期")
    staff_id = Column(Integer, ForeignKey("users_new.id"), comment="沟通人员ID")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    customer = relationship("Customer", back_populates="communications")
    case = relationship("Case", backref="communications")