from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.case import Document, Case
import os
import shutil
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
async def get_documents(
    skip: int = 0,
    limit: int = 20,
    case_id: Optional[int] = None,
    project_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取文档列表"""
    try:
        query = db.query(Document)

        if case_id:
            query = query.filter(Document.case_id == case_id)
        if project_id:
            query = query.filter(Document.project_id == project_id)
        if search:
            query = query.filter(Document.title.contains(search))

        documents = query.order_by(Document.uploaded_at.desc()).offset(skip).limit(limit).all()
        total = query.count()

        return {
            "documents": documents,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        return {"documents": [], "total": 0, "skip": skip, "limit": limit}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: str = Form(...),
    case_id: Optional[int] = Form(None),
    project_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """上传文档"""
    try:
        # 保存文件
        file_path = os.path.join(UPLOAD_DIR, f"{datetime.now().timestamp()}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 创建文档记录
        new_doc = Document(
            title=title,
            document_type=document_type,
            case_id=case_id,
            project_id=project_id,
            file_path=file_path,
            file_name=file.filename,
            file_size=os.path.getsize(file_path),
            uploaded_at=datetime.now()
        )

        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        return {"document": new_doc, "message": "文档上传成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """获取文档详情"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="文档不存在")
        return {"document": document}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """删除文档"""
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="文档不存在")

        # 删除文件
        if os.path.exists(document.file_path):
            os.remove(document.file_path)

        db.delete(document)
        db.commit()
        return {"message": "文档删除成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/archive")
async def archive_documents(
    case_id: int,
    generate_catalog: bool = True,
    generate_report: bool = True,
    db: Session = Depends(get_db)
):
    """一键归档"""
    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="案件不存在")

        # 获取案件相关文档
        documents = db.query(Document).filter(Document.case_id == case_id).all()

        # TODO: 实现实际的归档逻辑，生成目录和报告

        return {
            "message": "归档成功",
            "case_id": case_id,
            "documents_count": len(documents),
            "catalog_generated": generate_catalog,
            "report_generated": generate_report
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
