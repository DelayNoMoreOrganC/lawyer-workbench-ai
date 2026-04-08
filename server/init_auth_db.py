#!/usr/bin/env python3
"""
初始化用户认证数据库
"""
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from app.models.database import engine
from app.models.user_new import Base
from app.models.database import SessionLocal
from app.core.security import get_password_hash


def init_user_database():
    """初始化用户数据库表"""
    print("🔧 创建用户表...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ 用户表创建成功！")
    except Exception as e:
        print(f"❌ 创建用户表失败: {e}")
        return False

    return True


def create_test_users():
    """创建测试用户"""
    db = SessionLocal()

    try:
        print("\n👥 开始创建测试用户...")

        # 检查用户是否已存在
        existing_admin = db.query(Base.metadata.tables['users_new']).count() > 0
        if existing_admin > 0:
            print("ℹ️ 用户表中已有数据，跳过创建")
            return True

        # 创建管理员用户
        admin_user = Base.metadata.tables['users_new'].insert().values(
            username="admin",
            password_hash=get_password_hash("admin123"),
            full_name="系统管理员",
            email="admin@example.com",
            role="admin",
            department="管理部",
            is_active=True
        )
        db.execute(admin_user)
        print("✅ 创建管理员用户: admin / admin123")

        # 创建律师用户
        lawyer_user = Base.metadata.tables['users_new'].insert().values(
            username="lawyer",
            password_hash=get_password_hash("lawyer123"),
            full_name="张律师",
            email="lawyer@example.com",
            phone="13800138000",
            role="lawyer",
            department="诉讼部",
            is_active=True
        )
        db.execute(lawyer_user)
        print("✅ 创建律师用户: lawyer / lawyer123")

        # 创建助理用户
        assistant_user = Base.metadata.tables['users_new'].insert().values(
            username="assistant",
            password_hash=get_password_hash("assistant123"),
            full_name="李助理",
            email="assistant@example.com",
            phone="13900139000",
            role="assistant",
            department="诉讼部",
            is_active=True
        )
        db.execute(assistant_user)
        print("✅ 创建助理用户: assistant / assistant123")

        db.commit()
        print("\n🎉 测试用户创建完成！")

        # 显示所有用户
        print("\n📋 当前用户列表:")
        users = db.query(Base.metadata.tables['users_new']).all()
        for user in users:
            print(f"  - {user.username} ({user.full_name}) - {user.role}")

        return True

    except Exception as e:
        print(f"❌ 创建用户失败: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 开始初始化用户认证数据库...")

    if init_user_database():
        create_test_users()
        print("\n✨ 用户认证系统初始化完成！")
    else:
        print("\n❌ 初始化失败")
        sys.exit(1)