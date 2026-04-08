from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base


class Dossier(Base):
    """电子卷宗模型"""
    __tablename__ = "dossiers"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases_new.id"), nullable=False, comment="关联案件ID")

    # 文件基本信息
    file_name = Column(String(255), nullable=False, comment="文件名")
    file_path = Column(String(500), nullable=False, comment="文件存储路径")
    file_type = Column(String(20), nullable=False, comment="文件类型分类: 起诉状/证据/判决书等")
    file_format = Column(String(20), comment="文件格式: pdf/docx/jpg等")
    file_size = Column(Integer, comment="文件大小(字节)")
    mime_type = Column(String(100), comment="MIME类型")

    # 文档信息
    document_date = Column(Date, comment="文书日期")
    source = Column(String(50), comment="来源: 法院/当事人/律师等")
    description = Column(Text, comment="文件描述")

    # 标签和权限
    tags = Column(String(500), comment="标签")
    is_confidential = Column(Boolean, default=False, comment="是否保密")

    # 版本控制
    version = Column(Integer, default=1, comment="版本号")

    # 上传信息
    upload_date = Column(DateTime, default=datetime.utcnow, comment="上传时间")
    uploaded_by = Column(String(50), comment="上传者")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

    # 关系
    case = relationship("Case", back_populates="dossiers")