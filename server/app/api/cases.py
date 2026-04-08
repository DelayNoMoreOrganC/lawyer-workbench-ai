from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.case import Case, Project
from app.utils.excel_utils import ExcelHandler
import os

router = APIRouter()


@router.get("/")
async def get_cases(
    skip: int = 0,
    limit: int = 100,
    stage: Optional[str] = None,
    project_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取案件列表"""
    query = db.query(Case).filter(Case.status == "active")

    if stage:
        query = query.filter(Case.stage == stage)
    if project_id:
        query = query.filter(Case.project_id == project_id)
    if search:
        query = query.filter(Case.debtor_name.contains(search))

    cases = query.order_by(Case.updated_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    # 转换为字典格式
    cases_data = []
    for case in cases:
        cases_data.append({
            "id": case.id,
            "case_number": case.case_number,
            "debtor_name": case.debtor_name,
            "stage": case.stage,
            "sub_stage": case.sub_stage,
            "trial_case_number": case.trial_case_number,
            "execution_case_number": case.execution_case_number,
            "litigation_filing_date": case.litigation_filing_date.isoformat() if case.litigation_filing_date else None,
            "judgment_date": case.judgment_date.isoformat() if case.judgment_date else None,
            "created_at": case.created_at.isoformat() if case.created_at else None,
            "updated_at": case.updated_at.isoformat() if case.updated_at else None,
        })

    return {
        "cases": cases_data,
        "total": total
    }


@router.get("/{case_id}")
async def get_case(case_id: int, db: Session = Depends(get_db)):
    """获取案件详情"""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="案件不存在"
        )

    return {
        "id": case.id,
        "case_number": case.case_number,
        "debtor_name": case.debtor_name,
        "project_id": case.project_id,
        "stage": case.stage,
        "sub_stage": case.sub_stage,
        "litigation_filing_date": case.litigation_filing_date.isoformat() if case.litigation_filing_date else None,
        "trial_case_number": case.trial_case_number,
        "judge_info": case.judge_info,
        "judgment_date": case.judgment_date.isoformat() if case.judgment_date else None,
        "litigation_progress": case.litigation_progress,
        "execution_filing_date": case.execution_filing_date.isoformat() if case.execution_filing_date else None,
        "execution_case_number": case.execution_case_number,
        "execution_status": case.execution_status,
        "execution_progress": case.execution_progress,
        "execution_judge_info": case.execution_judge_info,
        "base_attorney_fee": float(case.base_attorney_fee) if case.base_attorney_fee else None,
        "collection_amount": float(case.collection_amount) if case.collection_amount else None,
        "risk_attorney_fee": float(case.risk_attorney_fee) if case.risk_attorney_fee else None,
        "seizure_info": case.seizure_info,
        "seizure_expiry_date": case.seizure_expiry_date.isoformat() if case.seizure_expiry_date else None,
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "updated_at": case.updated_at.isoformat() if case.updated_at else None,
    }


@router.post("/")
async def create_case(case_data: dict, db: Session = Depends(get_db), created_by: int = 1):
    """创建案件"""
    try:
        # 生成案件编号
        case_number = f"CASE{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # 创建案件对象
        case = Case(
            case_number=case_number,
            debtor_name=case_data.get("debtor_name"),
            project_id=case_data.get("project_id"),
            stage=case_data.get("stage", "litigation"),
            sub_stage=case_data.get("sub_stage"),
            trial_case_number=case_data.get("trial_case_number"),
            judge_info=case_data.get("judge_info"),
            litigation_progress=case_data.get("litigation_progress"),
            execution_case_number=case_data.get("execution_case_number"),
            execution_status=case_data.get("execution_status"),
            execution_progress=case_data.get("execution_progress"),
            execution_judge_info=case_data.get("execution_judge_info"),
            seizure_info=case_data.get("seizure_info"),
            created_by=created_by
        )

        # 处理日期字段
        if case_data.get("litigation_filing_date"):
            case.litigation_filing_date = datetime.fromisoformat(case_data["litigation_filing_date"].replace('Z', '+00:00'))
        if case_data.get("judgment_date"):
            case.judgment_date = datetime.fromisoformat(case_data["judgment_date"].replace('Z', '+00:00'))
        if case_data.get("execution_filing_date"):
            case.execution_filing_date = datetime.fromisoformat(case_data["execution_filing_date"].replace('Z', '+00:00'))
        if case_data.get("seizure_expiry_date"):
            case.seizure_expiry_date = datetime.fromisoformat(case_data["seizure_expiry_date"].replace('Z', '+00:00'))

        # 处理数字字段
        if case_data.get("base_attorney_fee"):
            case.base_attorney_fee = case_data["base_attorney_fee"]
        if case_data.get("collection_amount"):
            case.collection_amount = case_data["collection_amount"]
        if case_data.get("risk_attorney_fee"):
            case.risk_attorney_fee = case_data["risk_attorney_fee"]

        db.add(case)
        db.commit()
        db.refresh(case)

        return {"message": "案件创建成功", "case_id": case.id, "case_number": case.case_number}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"案件创建失败: {str(e)}"
        )


@router.put("/{case_id}")
async def update_case(case_id: int, case_data: dict, db: Session = Depends(get_db)):
    """更新案件"""
    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="案件不存在"
            )

        # 更新字段
        if "debtor_name" in case_data:
            case.debtor_name = case_data["debtor_name"]
        if "project_id" in case_data:
            case.project_id = case_data["project_id"]
        if "stage" in case_data:
            case.stage = case_data["stage"]
        if "sub_stage" in case_data:
            case.sub_stage = case_data["sub_stage"]
        if "trial_case_number" in case_data:
            case.trial_case_number = case_data["trial_case_number"]
        if "judge_info" in case_data:
            case.judge_info = case_data["judge_info"]
        if "litigation_progress" in case_data:
            case.litigation_progress = case_data["litigation_progress"]
        if "execution_case_number" in case_data:
            case.execution_case_number = case_data["execution_case_number"]
        if "execution_status" in case_data:
            case.execution_status = case_data["execution_status"]
        if "execution_progress" in case_data:
            case.execution_progress = case_data["execution_progress"]
        if "execution_judge_info" in case_data:
            case.execution_judge_info = case_data["execution_judge_info"]
        if "seizure_info" in case_data:
            case.seizure_info = case_data["seizure_info"]

        # 处理日期字段
        for date_field in ["litigation_filing_date", "judgment_date", "execution_filing_date", "seizure_expiry_date"]:
            if date_field in case_data and case_data[date_field]:
                setattr(case, date_field, datetime.fromisoformat(case_data[date_field].replace('Z', '+00:00')))

        # 处理数字字段
        for money_field in ["base_attorney_fee", "collection_amount", "risk_attorney_fee"]:
            if money_field in case_data and case_data[money_field] is not None:
                setattr(case, money_field, case_data[money_field])

        db.commit()
        db.refresh(case)

        return {"message": "案件更新成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"案件更新失败: {str(e)}"
        )


@router.delete("/{case_id}")
async def delete_case(case_id: int, db: Session = Depends(get_db)):
    """删除案件（软删除）"""
    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="案件不存在"
            )

        # 软删除
        case.status = "archived"
        db.commit()

        return {"message": "案件删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"案件删除失败: {str(e)}"
        )


@router.post("/search")
async def search_cases(request: dict, db: Session = Depends(get_db)):
    """智能搜索案件"""
    query = request.get("query", "")
    if not query:
        return {"results": []}

    # 简单搜索（TODO: 后续集成AI语义搜索）
    cases = db.query(Case).filter(
        Case.status == "active",
        db.or_(
            Case.debtor_name.contains(query),
            Case.trial_case_number.contains(query),
            Case.execution_case_number.contains(query)
        )
    ).limit(20).all()

    results = []
    for case in cases:
        results.append({
            "id": case.id,
            "debtor_name": case.debtor_name,
            "stage": case.stage,
            "trial_case_number": case.trial_case_number,
            "execution_case_number": case.execution_case_number
        })

    return {"results": results}


@router.get("/projects/list")
async def get_projects(db: Session = Depends(get_db)):
    """获取项目列表"""
    projects = db.query(Project).all()
    project_list = []
    for project in projects:
        project_list.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "client_name": project.client_name,
            "created_at": project.created_at.isoformat() if project.created_at else None
        })
    return {"projects": project_list}


@router.post("/projects")
async def create_project(project_data: dict, db: Session = Depends(get_db), created_by: int = 1):
    """创建项目"""
    try:
        project = Project(
            name=project_data.get("name"),
            description=project_data.get("description"),
            client_name=project_data.get("client_name"),
            created_by=created_by
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        return {"message": "项目创建成功", "project_id": project.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"项目创建失败: {str(e)}"
        )
