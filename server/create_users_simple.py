#!/usr/bin/env python3
"""
创建测试用户脚本（使用bcrypt直接加密）
"""
import sys
import bcrypt
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings


def hash_password(password: str) -> str:
    """使用bcrypt加密密码"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_test_users():
    """创建测试用户"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 检查用户是否已存在
        result = conn.execute(text("SELECT COUNT(*) FROM users_new"))
        user_count = result.scalar()

        if user_count > 0:
            print("ℹ️ 用户表中已有数据，先清空再创建")
            conn.execute(text("DELETE FROM users_new"))
            conn.commit()
            print("✅ 已清空用户表")

        # 创建管理员用户
        admin_password = hash_password("admin123")
        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, role, department, is_active)
            VALUES ('admin', :password, '系统管理员', 'admin@example.com', 'admin', '管理部', 1)
        """), {"password": admin_password})
        print("✅ 创建管理员用户: admin / admin123")

        # 创建律师用户
        lawyer_password = hash_password("lawyer123")
        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, phone, role, department, is_active)
            VALUES ('lawyer', :password, '张律师', 'lawyer@example.com', '13800138000', 'lawyer', '诉讼部', 1)
        """), {"password": lawyer_password})
        print("✅ 创建律师用户: lawyer / lawyer123")

        # 创建助理用户
        assistant_password = hash_password("assistant123")
        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, phone, role, department, is_active)
            VALUES ('assistant', :password, '李助理', 'assistant@example.com', '13900139000', 'assistant', '诉讼部', 1)
        """), {"password": assistant_password})
        print("✅ 创建助理用户: assistant / assistant123")

        conn.commit()

        # 显示所有用户
        print("\n📋 当前用户列表:")
        result = conn.execute(text("SELECT username, full_name, role FROM users_new"))
        for row in result:
            print(f"  - {row[0]} ({row[1]}) - {row[2]}")

        print("\n🎉 测试用户创建完成！")


if __name__ == "__main__":
    try:
        print("🚀 开始创建测试用户...")
        create_test_users()
        print("\n✨ 现在可以使用以下账户登录:")
        print("  管理员: admin / admin123")
        print("  律师: lawyer / lawyer123")
        print("  助理: assistant / assistant123")
    except Exception as e:
        print(f"❌ 创建用户失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)