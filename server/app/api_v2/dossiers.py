from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime

from app.models.database import get_db
from app.models.dossier import Dossier

router = APIRouter()

# 文件上传目录
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
def get_dossiers(case_id: int = None, db: Session = Depends(get_db)):
    """获取电子卷宗列表"""
    query = db.query(Dossier)
    if case_id:
        query = query.filter(Dossier.case_id == case_id)
    dossiers = query.order_by(Dossier.upload_date.desc()).all()
    return {"dossiers": dossiers, "total": len(dossiers)}


@router.get("/{dossier_id}")
def get_dossier(dossier_id: int, db: Session = Depends(get_db)):
    """获取电子卷宗详情"""
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="电子卷宗不存在")
    return dossier


@router.post("/upload")
async def upload_dossier(
    file: UploadFile = File(...),
    case_id: int = None,
    file_type: str = "其他",
    db: Session = Depends(get_db)
):
    """上传文件到电子卷宗"""

    # 验证文件类型
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".doc", ".docx", ".txt"}
    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式。支持的格式: {', '.join(allowed_extensions)}"
        )

    # 生成唯一文件名
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # 获取文件大小
        file_size = os.path.getsize(file_path)

        # 保存到数据库
        dossier = Dossier(
            case_id=case_id,
            file_name=file.filename,
            file_type=file_type,
            file_format=file_extension[1:],  # 去掉点号
            file_path=file_path,
            file_size=file_size,
            upload_date=datetime.now()
        )

        db.add(dossier)
        db.commit()
        db.refresh(dossier)

        return {
            "message": "文件上传成功",
            "dossier": dossier
        }

    except Exception as e:
        # 如果保存失败，删除已上传的文件
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")


@router.delete("/{dossier_id}")
def delete_dossier(dossier_id: int, db: Session = Depends(get_db)):
    """删除电子卷宗"""
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="电子卷宗不存在")

    # 删除物理文件
    if dossier.file_path and os.path.exists(dossier.file_path):
        try:
            os.remove(dossier.file_path)
        except Exception as e:
            print(f"删除文件失败: {e}")

    # 删除数据库记录
    db.delete(dossier)
    db.commit()

    return {"message": "电子卷宗已删除"}