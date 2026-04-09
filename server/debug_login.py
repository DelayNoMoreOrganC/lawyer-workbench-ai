#!/usr/bin/env python3
"""
调试登录问题
"""
import sys
import bcrypt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings

def debug_login():
    """调试登录过程"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # 获取用户数据
        result = conn.execute(text("""
            SELECT id, username, password_hash, is_active
            FROM users_new
            WHERE username = 'admin'
        """))

        user = result.fetchone()
        if not user:
            print("❌ 用户不存在")
            return

        user_id, username, password_hash, is_active = user
        print(f"✅ 找到用户: {username}")
        print(f"   用户ID: {user_id}")
        print(f"   密码哈希: {password_hash[:60]}...")
        print(f"   是否激活: {is_active}")

        # 测试密码
        test_password = "admin123"
        try:
            is_valid = bcrypt.checkpw(test_password.encode('utf-8'), password_hash.encode('utf-8'))
            print(f"\n🔐 密码验证: {'✅ 正确' if is_valid else '❌ 错误'}")

            if is_valid:
                print("🎉 登录应该成功！")
            else:
                print("❌ 密码不匹配")

        except Exception as e:
            print(f"❌ 密码验证失败: {e}")

        # 检查用户状态
        if not is_active:
            print("⚠️ 用户未激活")

if __name__ == "__main__":
    debug_login()