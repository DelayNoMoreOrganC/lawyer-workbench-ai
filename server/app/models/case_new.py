from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base


class Case(Base):
    """案件模型 - 重新设计版本"""
    __tablename__ = "cases_new"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, comment="案号")
    case_name = Column(String(200), nullable=False, index=True, comment="案件名称")
    case_type = Column(String(20), nullable=False, comment="案件类型: 民事/刑事/行政/执行等")
    case_status = Column(String(20), nullable=False, comment="案件状态: 待立案/一审/二审/执行/结案等")
    case_nature = Column(String(100), comment="案件性质")

    # 法院信息
    court_name = Column(String(200), comment="法院名称")
    judge_name = Column(String(50), comment="法官姓名")
    judge_contact = Column(String(20), comment="法官联系方式")
    prosecutor = Column(String(50), comment="检察官(刑事案件)")

    # 当事人信息 (JSON格式存储详细信息)
    plaintiff = Column(Text, comment="原告信息(JSON格式)")
    defendant = Column(Text, comment="被告信息(JSON格式)")
    lawyer = Column(Text, comment="律师信息(JSON格式)")

    # 案件金额
    case_amount = Column(Numeric(15, 2), comment="案件标的额")

    # 重要日期
    filing_date = Column(Date, comment="立案日期")
    hearing_date = Column(Date, comment="开庭日期")
    closing_date = Column(Date, comment="结案日期")

    # 案件详情
    case_brief = Column(Text, comment="案件简介")
    case_notes = Column(Text, comment="案件备注")

    # 优先级和标签
    priority = Column(Integer, default=1, comment="优先级(1-5)")
    tags = Column(String(500), comment="标签(逗号分隔)")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")
    is_archived = Column(Boolean, default=False, comment="是否归档")

    # 关系
    tasks = relationship("Task", back_populates="case", cascade="all, delete-orphan")
    dossiers = relationship("Dossier", back_populates="case", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="case", cascade="all, delete-orphan")
    ai_logs = relationship("AIAssistLog", back_populates="case", cascade="all, delete-orphan")