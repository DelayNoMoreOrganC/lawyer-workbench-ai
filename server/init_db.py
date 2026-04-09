#!/usr/bin/env python3
"""
数据库初始化脚本
运行此脚本来创建/更新数据库表结构
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.models.database import init_db, engine
from app.models import Base, Case, Task, Dossier, Event, AIAssistLog, User
from app.models.finance import Expense, AttorneyFee, Payment, Invoice
from app.models.customer import Customer, Communication, case_customer_association


def init_database():
    """初始化数据库，创建所有表"""
    print("=" * 60)
    print("开始初始化数据库...")
    print("=" * 60)

    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 数据库表创建成功！")

        # 显示创建的表
        print("\n📋 已创建的数据表:")
        for table_name in Base.metadata.tables.keys():
            print(f"  • {table_name}")

        print("\n" + "=" * 60)
        print("🎉 数据库初始化完成！")
        print("=" * 60)

    except Exception as e:
        print(f"❌ 数据库初始化失败: {str(e)}")
        sys.exit(1)


def check_tables():
    """检查数据库中的表"""
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        print("\n📊 数据库中的表:")
        if tables:
            for table in tables:
                print(f"  • {table}")
        else:
            print("  (暂无表，需要运行初始化)")

        return tables
    except Exception as e:
        print(f"❌ 检查数据库表失败: {str(e)}")
        return []


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="数据库管理工具")
    parser.add_argument("action", choices=["init", "check"], help="操作类型")
    args = parser.parse_args()

    if args.action == "init":
        init_database()
    elif args.action == "check":
        check_tables()
