#!/usr/bin/env python3
"""
数据库初始化脚本
"""
from app.core.database import engine, Base
from app.models.user import User
from app.models.case import Case, Project, Document, CalendarEvent, CaseCollaborator
from app.config import settings
from passlib.context import CryptContext
from sqlalchemy.orm import Session

def init_database():
    """初始化数据库"""
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")
    
    # 创建会话
    db = Session(bind=engine)
    
    try:
        # 检查是否已有用户
        existing_user = db.query(User).filter(User.username == "001").first()
        
        if not existing_user:
            print("正在创建测试用户...")
            # 创建测试用户
            pwd_context = CryptContext(schemes=["bcrypt"])
            hashed_password = pwd_context.hash("001")
            
            user = User(
                username="001",
                email="test@example.com",
                hashed_password=hashed_password,
                full_name="测试用户",
                role="admin"
            )
            db.add(user)
            db.commit()
            print("✅ 测试用户创建完成 (用户名: 001, 密码: 001)")
        
        # 检查是否已有项目
        existing_projects = db.query(Project).count()
        
        if existing_projects == 0:
            print("正在创建测试项目...")
            # 创建测试项目
            project1 = Project(
                name="工商银行案件组",
                description="工商银行信用卡纠纷案件组"
            )
            project2 = Project(
                name="建设银行案件组",
                description="建设银行贷款纠纷案件组"
            )
            db.add(project1)
            db.add(project2)
            db.commit()
            print("✅ 测试项目创建完成")
            
            # 创建测试案件
            existing_cases = db.query(Case).count()
            
            if existing_cases == 0:
                print("正在创建测试案件...")
                test_cases = [
                    Case(
                        case_number="001",
                        debtor_name="张三",
                        stage="litigation",
                        sub_stage="已判决",
                        trial_case_number="(2025)粤0604民初3231号",
                        project_id=1
                    ),
                    Case(
                        case_number="002",
                        debtor_name="李四",
                        stage="executing",
                        sub_stage="执行中",
                        execution_case_number="(2025)粤0604执1234号",
                        project_id=1
                    ),
                    Case(
                        case_number="003",
                        debtor_name="王五",
                        stage="litigation",
                        sub_stage="诉前联调",
                        trial_case_number="(2024)粤0604诉前调确1716号",
                        project_id=2
                    ),
                    Case(
                        case_number="004",
                        debtor_name="赵六",
                        stage="litigation",
                        sub_stage="审理中",
                        trial_case_number="(2025)粤0604民初3233号",
                        project_id=2
                    ),
                    Case(
                        case_number="005",
                        debtor_name="孙七",
                        stage="terminated",
                        sub_stage="终本",
                        execution_case_number="(2024)粤0604执2000号",
                        project_id=1
                    )
                ]
                
                for case in test_cases:
                    db.add(case)
                
                db.commit()
                print("✅ 测试案件创建完成")
            
            # 创建测试日历事件
            existing_events = db.query(CalendarEvent).count()
            
            if existing_events == 0:
                print("正在创建测试日历事件...")
                from datetime import datetime, timedelta
                
                test_events = [
                    CalendarEvent(
                        title="张三案开庭",
                        event_type="court",
                        start_time=datetime.now() + timedelta(days=7),
                        end_time=datetime.now() + timedelta(days=7, hours=2),
                        case_id=1,
                        location="佛山市禅城区人民法院 第3审判庭"
                    ),
                    CalendarEvent(
                        title="李四案执行听证",
                        event_type="hearing",
                        start_time=datetime.now() + timedelta(days=14),
                        end_time=datetime.now() + timedelta(days=14, hours=1),
                        case_id=2,
                        location="佛山市禅城区人民法院 执行局"
                    ),
                    CalendarEvent(
                        title="王五案调解会议",
                        event_type="mediation",
                        start_time=datetime.now() + timedelta(days=3),
                        end_time=datetime.now() + timedelta(days=3, hours=1, minutes=30),
                        case_id=3,
                        location="佛山市禅城区人民法院 调解室"
                    ),
                ]
                
                for event in test_events:
                    db.add(event)
                
                db.commit()
                print("✅ 测试日历事件创建完成")
        
        print("\n" + "="*60)
        print("🎉 数据库初始化完成!")
        print("="*60)
        print("\n测试数据:")
        print("  - 用户: 001 / 001 (管理员)")
        print("  - 项目: 2个 (工商银行、建设银行)")
        print("  - 案件: 5个")
        print("  - 日历事件: 3个")
        
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
