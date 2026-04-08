from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, comment="用户名")
    email = Column(String(100), unique=True, comment="邮箱")
    hashed_password = Column(String(200), comment="密码哈希")

    # 用户信息
    full_name = Column(String(100), comment="姓名")
    role = Column(String(20), comment="角色: admin/lawyer/assistant")
    phone = Column(String(20), comment="电话")
    avatar = Column(String(500), comment="头像URL")

    # 状态
    is_active = Column(Boolean, default=True, comment="是否激活")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    last_login = Column(DateTime, comment="最后登录时间")
