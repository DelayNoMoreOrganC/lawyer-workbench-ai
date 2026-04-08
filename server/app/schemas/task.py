from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    """待办事项基础Schema"""
    task_title: str = Field(..., description="任务标题")
    task_description: Optional[str] = Field(None, description="任务描述")
    task_type: Optional[str] = Field(None, description="任务类型")
    priority: int = Field(default=1, ge=1, le=5, description="优先级")


class TaskCreate(TaskBase):
    """创建待办事项Schema"""
    case_id: int = Field(..., description="关联案件ID")
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    assigned_to: Optional[str] = None
    task_notes: Optional[str] = None


class TaskUpdate(BaseModel):
    """更新待办事项Schema"""
    task_title: Optional[str] = None
    task_description: Optional[str] = None
    task_type: Optional[str] = None
    task_status: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    assigned_to: Optional[str] = None
    task_notes: Optional[str] = None


class TaskInDB(TaskBase):
    """数据库中的待办事项Schema"""
    id: int
    case_id: int
    task_status: str
    due_date: Optional[datetime]
    reminder_time: Optional[datetime]
    reminder_sent: bool
    completion_date: Optional[datetime]
    completed_at: Optional[datetime]
    assigned_to: Optional[str]
    task_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True