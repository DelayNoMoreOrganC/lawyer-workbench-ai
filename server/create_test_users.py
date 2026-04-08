#!/usr/bin/env python3
"""
创建测试用户脚本
"""
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from app.models.database import SessionLocal
from app.models.user_new import User
from app.core.security import get_password_hash


def create_test_users():
    """创建测试用户"""
    db = SessionLocal()

    try:
        # 检查用户是否已存在
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("管理员用户已存在，跳过创建")
        else:
            # 创建管理员用户
            admin_user = User(
                username="admin",
                password_hash=get_password_hash("admin123"),
                full_name="系统管理员",
                email="admin@example.com",
                role="admin",
                department="管理部",
                is_active=True
            )
            db.add(admin_user)
            print("✅ 创建管理员用户: admin / admin123")

        # 检查律师用户
        existing_lawyer = db.query(User).filter(User.username == "lawyer").first()
        if existing_lawyer:
            print("律师用户已存在，跳过创建")
        else:
            # 创建律师用户
            lawyer_user = User(
                username="lawyer",
                password_hash=get_password_hash("lawyer123"),
                full_name="张律师",
                email="lawyer@example.com",
                phone="13800138000",
                role="lawyer",
                department="诉讼部",
                is_active=True
            )
            db.add(lawyer_user)
            print("✅ 创建律师用户: lawyer / lawyer123")

        # 检查助理用户
        existing_assistant = db.query(User).filter(User.username == "assistant").first()
        if existing_assistant:
            print("助理用户已存在，跳过创建")
        else:
            # 创建助理用户
            assistant_user = User(
                username="assistant",
                password_hash=get_password_hash("assistant123"),
                full_name="李助理",
                email="assistant@example.com",
                phone="13900139000",
                role="assistant",
                department="诉讼部",
                is_active=True
            )
            db.add(assistant_user)
            print("✅ 创建助理用户: assistant / assistant123")

        db.commit()
        print("\n🎉 测试用户创建完成！")

        # 显示所有用户
        print("\n📋 当前用户列表:")
        users = db.query(User).all()
        for user in users:
            print(f"  - {user.username} ({user.full_name}) - {user.role}")

    except Exception as e:
        print(f"❌ 创建用户失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 开始创建测试用户...")
    create_test_users()