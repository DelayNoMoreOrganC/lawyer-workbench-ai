from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.database import get_db
from app.models.user_new import User
from app.schemas.auth import (
    UserCreate, UserUpdate, UserResponse, UserLogin,
    Token, PasswordChange
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_active_user, require_admin
)

router = APIRouter()
security = HTTPBearer()


@router.post("/login-test")
async def login_test(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """测试登录端点 - 用于调试"""
    print(f"🔍 收到登录请求: {user_credentials.username}")

    # 查找用户
    user = db.query(User).filter(User.username == user_credentials.username).first()

    print(f"👤 用户查询结果: {user}")

    if not user:
        print("❌ 用户不存在")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    print(f"🔑 找到用户: {user.username}")
    print(f"🔐 密码哈希: {user.password_hash[:50]}...")

    # 验证密码
    try:
        is_valid = verify_password(user_credentials.password, user.password_hash)
        print(f"✅ 密码验证结果: {is_valid}")
    except Exception as e:
        print(f"❌ 密码验证异常: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    if not is_valid:
        print("❌ 密码错误")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    print(f"🎉 登录成功！用户: {user.username}")

    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.commit()

    # 生成访问令牌
    access_token_expires = timedelta(days=7)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "debug": "登录测试端点"
    }


# ... 其他端点保持不变