from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class CaseBase(BaseModel):
    """案件基础Schema"""
    case_number: Optional[str] = Field(None, description="案号")
    case_name: str = Field(..., description="案件名称")
    case_type: str = Field(..., description="案件类型")
    case_status: str = Field(..., description="案件状态")
    case_nature: Optional[str] = Field(None, description="案件性质")


class CaseCreate(CaseBase):
    """创建案件Schema"""
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    judge_contact: Optional[str] = None
    prosecutor: Optional[str] = None
    plaintiff: Optional[str] = None
    defendant: Optional[str] = None
    lawyer: Optional[str] = None
    case_amount: Optional[float] = None
    filing_date: Optional[date] = None
    hearing_date: Optional[date] = None
    closing_date: Optional[date] = None
    case_brief: Optional[str] = None
    case_notes: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)
    tags: Optional[str] = None


class CaseUpdate(BaseModel):
    """更新案件Schema"""
    case_number: Optional[str] = None
    case_name: Optional[str] = None
    case_type: Optional[str] = None
    case_status: Optional[str] = None
    case_nature: Optional[str] = None
    court_name: Optional[str] = None
    judge_name: Optional[str] = None
    judge_contact: Optional[str] = None
    prosecutor: Optional[str] = None
    plaintiff: Optional[str] = None
    defendant: Optional[str] = None
    lawyer: Optional[str] = None
    case_amount: Optional[float] = None
    filing_date: Optional[date] = None
    hearing_date: Optional[date] = None
    closing_date: Optional[date] = None
    case_brief: Optional[str] = None
    case_notes: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    tags: Optional[str] = None
    is_archived: Optional[bool] = None


class CaseInDB(CaseBase):
    """数据库中的案件Schema"""
    id: int
    court_name: Optional[str]
    judge_name: Optional[str]
    judge_contact: Optional[str]
    prosecutor: Optional[str]
    plaintiff: Optional[str]
    defendant: Optional[str]
    lawyer: Optional[str]
    case_amount: Optional[float]
    filing_date: Optional[date]
    hearing_date: Optional[date]
    closing_date: Optional[date]
    case_brief: Optional[str]
    case_notes: Optional[str]
    priority: int
    tags: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_archived: bool

    class Config:
        from_attributes = True


class CaseResponse(CaseInDB):
    """案件响应Schema"""
    pass


class CaseListResponse(BaseModel):
    """案件列表响应"""
    total: int
    cases: List[CaseInDB]
    page: int
    page_size: int