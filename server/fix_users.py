#!/usr/bin/env python3
"""
修复并重新创建用户
"""
import sys
import bcrypt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings


def hash_password_bcrypt(password: str) -> str:
    """使用bcrypt正确加密密码"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password_bcrypt(password: str, hashed: str) -> bool:
    """验证bcrypt密码"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"密码验证失败: {e}")
        return False


def recreate_users():
    """重新创建用户"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 清空用户表
        conn.execute(text("DELETE FROM users_new"))
        conn.commit()
        print("✅ 已清空用户表")

        # 创建管理员用户
        admin_password = hash_password_bcrypt("admin123")
        print(f"管理员密码哈希: {admin_password[:50]}...")

        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, role, department, is_active)
            VALUES ('admin', :password, '系统管理员', 'admin@example.com', 'admin', '管理部', 1)
        """), {"password": admin_password})

        # 创建律师用户
        lawyer_password = hash_password_bcrypt("lawyer123")
        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, phone, role, department, is_active)
            VALUES ('lawyer', :password, '张律师', 'lawyer@example.com', '13800138000', 'lawyer', '诉讼部', 1)
        """), {"password": lawyer_password})

        # 创建助理用户
        assistant_password = hash_password_bcrypt("assistant123")
        conn.execute(text("""
            INSERT INTO users_new (username, password_hash, full_name, email, phone, role, department, is_active)
            VALUES ('assistant', :password, '李助理', 'assistant@example.com', '13900139000', 'assistant', '诉讼部', 1)
        """), {"password": assistant_password})

        conn.commit()
        print("✅ 用户创建完成")

        # 验证密码
        print("\n🔐 验证密码:")
        result = conn.execute(text("SELECT username, password_hash FROM users_new WHERE username='admin'"))
        for row in result:
            username, stored_hash = row
            is_valid = verify_password_bcrypt("admin123", stored_hash)
            print(f"  {username} / admin123: {'✅ 正确' if is_valid else '❌ 错误'}")

        print("\n📋 当前用户列表:")
        result = conn.execute(text("SELECT username, full_name, role FROM users_new"))
        for row in result:
            print(f"  - {row[0]} ({row[1]}) - {row[2]}")


if __name__ == "__main__":
    try:
        print("🚀 重新创建用户...")
        recreate_users()
        print("\n✅ 用户创建完成，可以测试登录了！")
    except Exception as e:
        print(f"❌ 创建失败: {e}")
        import traceback
        traceback.print_exc()