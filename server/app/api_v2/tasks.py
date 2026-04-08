from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskInDB

router = APIRouter()


@router.get("/")
def get_tasks(
    case_id: Optional[int] = Query(None, description="案件ID"),
    task_status: Optional[str] = Query(None, description="任务状态"),
    db: Session = Depends(get_db)
):
    """获取待办事项列表"""
    query = db.query(Task)

    if case_id:
        query = query.filter(Task.case_id == case_id)
    if task_status:
        query = query.filter(Task.task_status == task_status)

    tasks = query.order_by(Task.due_date.asc()).all()
    return {"tasks": tasks, "total": len(tasks)}


@router.get("/{task_id}", response_model=TaskInDB)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """获取单个待办事项"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="待办事项不存在")
    return task


@router.post("/", response_model=TaskInDB)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """创建待办事项"""
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/{task_id}", response_model=TaskInDB)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """更新待办事项"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="待办事项不存在")

    for field, value in task.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """删除待办事项"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="待办事项不存在")

    db.delete(db_task)
    db.commit()
    return {"message": "待办事项已删除"}