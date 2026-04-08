#!/usr/bin/env python3
"""
初始化新的数据库
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.database import init_db
from app.models import (
    Case, Task, Dossier, Event, AIAssistLog, User
)

def main():
    """初始化数据库"""
    print("开始初始化新的数据库...")
    print("=" * 50)

    try:
        # 创建所有表
        init_db()

        print("=" * 50)
        print("✅ 数据库初始化成功！")
        print("\n创建的表包括:")
        print("  - cases_new (案件表)")
        print("  - tasks (待办事项表)")
        print("  - dossiers (电子卷宗表)")
        print("  - users_new (用户表)")
        print("  - events (日程安排表)")
        print("  - ai_assist_logs (AI辅助记录表)")
        print("\n数据库文件: lawyer_workbench_new.db")

    except Exception as e:
        print(f"❌ 数据库初始化失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())