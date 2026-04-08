from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Case(Base):
    """案件模型"""
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, comment="案件编号")
    debtor_name = Column(String(100), index=True, comment="债务人名称")
    project_id = Column(Integer, ForeignKey("projects.id"), comment="所属项目ID")

    # 阶段信息
    stage = Column(String(20), comment="阶段: litigation/executing/terminated/closed/mediation")
    sub_stage = Column(String(50), comment="子阶段")

    # 诉讼信息
    litigation_filing_date = Column(Date, comment="一审立案时间")
    trial_case_number = Column(String(100), comment="审判案号")
    judge_info = Column(Text, comment="承办法官、书记员联系方式")
    judgment_date = Column(Date, comment="判决/调解时间")
    litigation_progress = Column(Text, comment="诉讼进展")

    # 执行信息
    execution_filing_date = Column(Date, comment="执行立案时间")
    execution_case_number = Column(String(100), comment="执行案号")
    execution_status = Column(String(50), comment="执行状态")
    execution_progress = Column(Text, comment="执行进展")
    execution_judge_info = Column(Text, comment="执行法官联系方式")

    # 财务信息
    base_attorney_fee = Column(Numeric(10, 2), comment="基础律师费")
    collection_amount = Column(Numeric(10, 2), comment="清收金额")
    risk_attorney_fee = Column(Numeric(10, 2), comment="风险代理费")

    # 查封信息
    seizure_info = Column(Text, comment="查封情况")
    seizure_expiry_date = Column(Date, comment="查封到期日")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")
    created_by = Column(Integer, ForeignKey("users.id"), comment="创建人ID")
    status = Column(String(20), default="active", comment="状态: active/archived")

    # 关系
    project = relationship("Project", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    calendar_events = relationship("CalendarEvent", back_populates="case")
    collaborators = relationship("CaseCollaborator", back_populates="case")


class Project(Base):
    """项目模型"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, comment="项目名称")
    description = Column(Text, comment="项目描述")
    client_name = Column(String(100), comment="客户名称")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")
    created_by = Column(Integer, ForeignKey("users.id"), comment="创建人ID")

    # 关系
    cases = relationship("Case", back_populates="project")


class Document(Base):
    """文档模型"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), comment="案件ID")

    # 文档信息
    document_type = Column(String(50), comment="文档类型: summons/judgment/evidence等")
    title = Column(String(200), comment="文档标题")
    file_path = Column(String(500), comment="文件存储路径")
    file_size = Column(Integer, comment="文件大小")
    mime_type = Column(String(100), comment="MIME类型")

    # 归档信息
    archive_order = Column(Integer, comment="电子卷宗顺序")
    is_archived = Column(Boolean, default=False, comment="是否已归档")

    # OCR识别结果
    ocr_result = Column(Text, comment="OCR识别的JSON数据")
    extracted_data = Column(Text, comment="提取的结构化数据")

    # 元数据
    uploaded_at = Column(DateTime, default=datetime.utcnow, comment="上传时间")
    uploaded_by = Column(Integer, ForeignKey("users.id"), comment="上传人ID")

    # 关系
    case = relationship("Case", back_populates="documents")


class CalendarEvent(Base):
    """日历事件模型"""
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), comment="案件ID")

    # 事件信息
    event_type = Column(String(50), comment="事件类型: court/mediation/execution等")
    title = Column(String(200), comment="事件标题")
    description = Column(Text, comment="事件描述")

    # 时间信息
    start_time = Column(DateTime, comment="开始时间")
    end_time = Column(DateTime, comment="结束时间")
    reminder_time = Column(DateTime, comment="提醒时间")

    # 地点和联系人
    location = Column(String(200), comment="开庭地点")
    contact_info = Column(Text, comment="法官/书记员联系方式")

    # 完成状态
    is_completed = Column(Boolean, default=False, comment="是否完成")

    # AI预测
    is_ai_predicted = Column(Boolean, default=False, comment="是否AI预测")

    # 元数据
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    created_by = Column(Integer, ForeignKey("users.id"), comment="创建人ID")

    # 关系
    case = relationship("Case", back_populates="calendar_events")


class CaseCollaborator(Base):
    """案件协作者模型"""
    __tablename__ = "case_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), comment="案件ID")
    user_id = Column(Integer, ForeignKey("users.id"), comment="用户ID")

    # 权限
    permission = Column(String(20), comment="权限: read/write/admin")

    # 协作状态
    is_editing = Column(Boolean, default=False, comment="是否正在编辑")
    last_viewed_at = Column(DateTime, comment="最后查看时间")

    # 元数据
    added_at = Column(DateTime, default=datetime.utcnow, comment="添加时间")
    added_by = Column(Integer, ForeignKey("users.id"), comment="添加人ID")

    # 关系
    case = relationship("Case", back_populates="collaborators")
