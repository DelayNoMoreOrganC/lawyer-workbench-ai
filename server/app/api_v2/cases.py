from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.models.database import get_db
from app.models.case_new import Case
from app.models.user_new import User
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseListResponse
from app.core.security import get_current_active_user

router = APIRouter()


@router.get("/", response_model=CaseListResponse)
def get_cases(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    case_type: Optional[str] = Query(None, description="案件类型筛选"),
    case_status: Optional[str] = Query(None, description="案件状态筛选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取案件列表"""
    query = db.query(Case).filter(Case.is_archived == False)

    # 筛选条件
    if case_type:
        query = query.filter(Case.case_type == case_type)
    if case_status:
        query = query.filter(Case.case_status == case_status)
    if search:
        query = query.filter(
            (Case.case_name.contains(search)) |
            (Case.case_number.contains(search))
        )

    # 总数
    total = query.count()

    # 分页
    cases = query.order_by(Case.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "cases": cases,
        "page": page,
        "page_size": page_size
    }


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取单个案件详情"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="案件不存在")
    return case


@router.post("/", response_model=CaseResponse)
def create_case(
    case: CaseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建新案件"""
    # 检查案号是否已存在
    if case.case_number:
        existing_case = db.query(Case).filter(Case.case_number == case.case_number).first()
        if existing_case:
            raise HTTPException(status_code=400, detail="案号已存在")

    # 创建案件
    db_case = Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)

    return db_case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: int,
    case: CaseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新案件信息"""
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案件不存在")

    # 更新字段
    for field, value in case.model_dump(exclude_unset=True).items():
        setattr(db_case, field, value)

    db.commit()
    db.refresh(db_case)

    return db_case


@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除案件（软删除）"""
    db_case = db.query(Case).filter(Case.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="案件不存在")

    # 软删除
    db_case.is_archived = True
    db.commit()

    return {"message": "案件已删除"}


@router.get("/types/list")
def get_case_types():
    """获取案件类型列表"""
    return {
        "case_types": [
            "民事", "刑事", "行政", "执行", "国家赔偿", "申诉"
        ]
    }


@router.get("/statuses/list")
def get_case_statuses():
    """获取案件状态列表"""
    return {
        "case_statuses": [
            {"key": "draft", "label": "起草中", "description": "案件信息录入"},
            {"key": "pending_filing", "label": "待立案", "description": "准备立案材料"},
            {"key": "submitted", "label": "已立案", "description": "法院已受理"},
            {"key": "first_trial", "label": "一审审理中", "description": "开庭审理"},
            {"key": "waiting_judgment", "label": "待判决", "description": "等待法院判决"},
            {"key": "judged", "label": "已判决", "description": "法院已作出判决"},
            {"key": "pending_appeal", "label": "待上诉", "description": "上诉期限内"},
            {"key": "second_trial", "label": "二审审理中", "description": "上诉审理"},
            {"key": "final_judgment", "label": "终审判决", "description": "判决生效"},
            {"key": "execution", "label": "执行中", "description": "申请执行"},
            {"key": "completed", "label": "已结案", "description": "案件结束"}
        ]
    }


@router.get("/statistics/overview")
def get_case_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取案件统计概览"""
    total_cases = db.query(Case).filter(Case.is_archived == False).count()

    # 按状态统计
    status_stats = {}
    for status in ["draft", "pending_filing", "submitted", "first_trial", "waiting_judgment",
                   "judged", "pending_appeal", "second_trial", "final_judgment", "execution", "completed"]:
        count = db.query(Case).filter(
            Case.is_archived == False,
            Case.case_status == status
        ).count()
        status_stats[status] = count

    # 按类型统计
    type_stats = {}
    for case_type in ["民事", "刑事", "行政", "执行"]:
        count = db.query(Case).filter(
            Case.is_archived == False,
            Case.case_type == case_type
        ).count()
        type_stats[case_type] = count

    # 最近案件
    recent_cases = db.query(Case).filter(
        Case.is_archived == False
    ).order_by(Case.created_at.desc()).limit(5).all()

    return {
        "total": total_cases,
        "by_status": status_stats,
        "by_type": type_stats,
        "recent_cases": recent_cases
    }