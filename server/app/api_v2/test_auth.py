from fastapi import APIRouter

router = APIRouter()

@router.get("/test-auth")
async def test_auth():
    """测试认证端点"""
    import sys
    sys.path.insert(0, ".")

    from app.models.database import SessionLocal
    from app.models.user_new import User
    from app.core.security import verify_password

    db = SessionLocal()
    user = db.query(User).filter(User.username == "admin").first()

    if user:
        is_valid = verify_password("admin123", user.password_hash)
        return {
            "status": "success",
            "user_found": True,
            "password_valid": is_valid,
            "user_active": user.is_active,
            "username": user.username
        }
    else:
        return {"status": "error", "user_found": False}

@router.post("/test-login")
async def test_login(data: dict):
    """测试登录端点"""
    import sys
    sys.path.insert(0, ".")

    from app.models.database import SessionLocal
    from app.models.user_new import User
    from app.core.security import verify_password, create_access_token
    from datetime import timedelta

    db = SessionLocal()
    user = db.query(User).filter(User.username == data.get("username")).first()

    if not user:
        return {"error": "用户不存在"}

    is_valid = verify_password(data.get("password"), user.password_hash)
    if not is_valid:
        return {"error": "密码错误"}

    if not user.is_active:
        return {"error": "用户未激活"}

    # 生成令牌
    access_token = create_access_token({
        "sub": user.username,
        "user_id": user.id,
        "role": user.role
    }, timedelta(days=7))

    return {
        "success": True,
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/users-list")
async def list_users():
    """列出所有用户"""
    import sys
    sys.path.insert(0, ".")

    from app.models.database import SessionLocal
    from app.models.user_new import User

    db = SessionLocal()
    users = db.query(User).all()

    return {
        "total": len(users),
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role,
                "email": u.email,
                "is_active": u.is_active
            }
            for u in users
        ]
    }