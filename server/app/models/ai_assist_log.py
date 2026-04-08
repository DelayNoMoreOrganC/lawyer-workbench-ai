from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base


class AIAssistLog(Base):
    """AI辅助记录模型 - 记录AI使用历史"""
    __tablename__ = "ai_assist_logs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), comment="关联案件ID")
    user_id = Column(Integer, ForeignKey("users_new.id"), comment="用户ID")

    # AI交互信息
    query_type = Column(String(50), comment="查询类型: 文书生成/法律咨询/案例分析等")
    query_content = Column(Text, comment="查询内容")
    ai_response = Column(Text, comment="AI回复内容")

    # 技术信息
    model_used = Column(String(50), comment="使用的AI模型")
    tokens_used = Column(Integer, comment="使用的token数量")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")

    # 关系
    case = relationship("Case", back_populates="ai_logs")