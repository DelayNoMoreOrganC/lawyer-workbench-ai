from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base


class Event(Base):
    """日程安排模型 - 开庭、调解等重要日期"""
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, comment="关联案件ID")

    # 事件基本信息
    event_title = Column(String(200), nullable=False, comment="事件标题")
    event_type = Column(String(20), comment="事件类型: 开庭/调解/证据交换等")
    event_date = Column(Date, nullable=False, comment="事件日期")
    event_time = Column(Time, comment="事件时间")

    # 地点和人员
    location = Column(String(200), comment="地点")
    judge = Column(String(50), comment="法官")

    # 详细信息
    description = Column(Text, comment="事件描述")
    reminder_sent = Column(Boolean, default=False, comment="提醒是否已发送")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关系
    case = relationship("Case", back_populates="events")