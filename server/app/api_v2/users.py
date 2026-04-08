from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.user_new import User

router = APIRouter()


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    """获取用户列表"""
    users = db.query(User).filter(User.is_active == True).all()
    return {"users": users, "total": len(users)}


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    """获取用户详情"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user