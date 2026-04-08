from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.models.database import Base


class User(Base):
    """用户模型 - 重新设计版本"""
    __tablename__ = "users_new"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True, comment="用户名")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")

    # 基本信息
    full_name = Column(String(100), comment="姓名")
    email = Column(String(100), unique=True, comment="邮箱")
    phone = Column(String(20), comment="电话")

    # 角色和部门
    role = Column(String(20), default="lawyer", comment="角色: admin/lawyer/assistant")
    department = Column(String(100), comment="部门")

    # 状态
    is_active = Column(Boolean, default=True, comment="是否激活")

    # 元数据
    last_login = Column(DateTime, comment="最后登录时间")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")