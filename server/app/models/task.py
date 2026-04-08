from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base


class Task(Base):
    """待办事项模型"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, comment="关联案件ID")

    # 任务基本信息
    task_title = Column(String(200), nullable=False, comment="任务标题")
    task_description = Column(Text, comment="任务描述")
    task_type = Column(String(20), comment="任务类型: 开庭/举证/质证/文书等")
    task_status = Column(String(20), default="pending", comment="任务状态: pending/in_progress/completed")

    # 优先级和时间
    priority = Column(Integer, default=1, comment="优先级(1-5)")
    due_date = Column(DateTime, comment="截止时间")
    reminder_time = Column(DateTime, comment="提醒时间")
    reminder_sent = Column(Boolean, default=False, comment="提醒是否已发送")

    # 完成信息
    completion_date = Column(DateTime, comment="完成时间")
    completed_at = Column(DateTime, comment="完成时间戳")

    # 分配信息
    assigned_to = Column(String(50), comment="分配给谁")
    task_notes = Column(Text, comment="任务备注")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关系
    case = relationship("Case", back_populates="tasks")