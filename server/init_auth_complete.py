#!/usr/bin/env python3
"""
完整的用户认证系统初始化脚本
"""
import sys
import bcrypt
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings
from app.models.user_new import Base


def hash_password(password: str) -> str:
    """使用bcrypt加密密码"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def init_auth_system():
    """初始化完整的认证系统"""
    engine = create_engine(settings.DATABASE_URL)

    try:
        # 创建用户表
        print("🔧 创建用户表...")
        Base.metadata.create_all(bind=engine)
        print("✅ 用户表创建成功！")

        # 创建测试用户
        print("\n👥 开始创建测试用户...")

        with engine.connect() as conn:
            # 检查用户是否已存在
            result = conn.execute(text("SELECT COUNT(*) FROM users_new"))
            user_count = result.scalar()

            if user_count > 0:
                print(f"ℹ️ 用户表中已有 {user_count} 个用户，先清空再创建")
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
            result = conn.execute(text("SELECT username, full_name, role, email FROM users_new"))
            for row in result:
                print(f"  - {row[0]} ({row[1]}) - {row[2]} - {row[3]}")

        print("\n🎉 用户认证系统初始化完成！")
        print("\n✨ 现在可以使用以下账户登录:")
        print("  🔑 管理员: admin / admin123")
        print("  ⚖️  律师: lawyer / lawyer123")
        print("  📋 助理: assistant / assistant123")

        return True

    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 开始初始化用户认证系统...")
    if init_auth_system():
        print("\n✅ 可以启动后端服务了: python -m uvicorn app.main:app --reload")
    else:
        print("\n❌ 初始化失败")
        sys.exit(1)