// 行政OA相关类型定义

// 用印类型
export enum SealType {
  COMPANY = "公章",
  LAWYER = "律师章",
  CONTRACT = "合同专用章",
  FINANCE = "财务专用章",
}

// 用印申请状态
export enum SealApplicationStatus {
  PENDING = "待审批",
  APPROVED = "已批准",
  REJECTED = "已拒绝",
  COMPLETED = "已完成",
  CANCELLED = "已撤销",
}

// 用印申请
export interface SealApplication {
  id: number;
  applicant_id: number;
  applicant_name?: string;
  seal_type: SealType;
  document_name: string;
  document_count: number;
  purpose: string;
  case_id?: number;
  file_urls: string[]; // 上传的文件URL
  status: SealApplicationStatus;
  approver_id?: number;
  approver_name?: string;
  approval_notes?: string;
  approval_date?: string;
  usage_date?: string;
  usage_notes?: string;
  created_at: string;
  updated_at: string;
}

// 公告类型
export enum AnnouncementType {
  GENERAL = "全员通知",
  DEPARTMENT = "部门通知",
  IMPORTANT = "重要通知",
  SYSTEM = "系统公告",
}

// 公告状态
export enum AnnouncementStatus {
  DRAFT = "草稿",
  PUBLISHED = "已发布",
  ARCHIVED = "已归档",
}

// 公告
export interface Announcement {
  id: number;
  title: string;
  content: string;
  announcement_type: AnnouncementType;
  status: AnnouncementStatus;
  priority: "low" | "medium" | "high";
  target_roles?: string[]; // 目标角色
  target_users?: number[]; // 目标用户ID
  publisher_id: number;
  publisher_name?: string;
  publish_date?: string;
  expiry_date?: string;
  attachment_urls?: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

// 工作汇报类型
export enum ReportType {
  WEEKLY = "周报",
  MONTHLY = "月报",
  QUARTERLY = "季报",
  PROJECT = "项目汇报",
}

// 工作汇报
export interface WorkReport {
  id: number;
  reporter_id: number;
  reporter_name?: string;
  report_type: ReportType;
  report_period_start: string;
  report_period_end: string;
  content: {
    completed_work: string[]; // 已完成工作
    ongoing_work: string[]; // 进行中工作
    next_plan: string[]; // 下一步计划
    problems: string[]; // 存在问题
    suggestions: string[]; // 意见建议
  };
  case_statistics?: {
    new_cases: number;
    active_cases: number;
    completed_cases: number;
    total_fees: number;
  };
  status: "draft" | "submitted";
  submit_date?: string;
  reviewer_id?: number;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

// 知识库文档类型
export enum KnowledgeDocType {
  TEMPLATE = "文书模板",
  REGULATION = "规章制度",
  TRAINING = "培训资料",
  PRECEDENT = "典型案例",
  GUIDE = "操作指南",
  OTHER = "其他",
}

// 知识库文档
export interface KnowledgeDocument {
  id: number;
  title: string;
  content: string;
  doc_type: KnowledgeDocType;
  category: string;
  tags: string[];
  file_urls?: string[];
  author_id: number;
  author_name?: string;
  version: number;
  is_public: boolean;
  allowed_roles?: string[];
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// 费用报销状态
export enum ReimbursementStatus {
  PENDING = "待审批",
  APPROVED = "已批准",
  REJECTED = "已拒绝",
  PAID = "已支付",
}

// 报销申请（已在财务类型中定义，这里扩展）
export interface ExpenseReimbursement {
  id: number;
  applicant_id: number;
  applicant_name?: string;
  case_id?: number;
  case_name?: string;
  amount: number;
  title: string;
  description: string;
  expense_type: string;
  status: ReimbursementStatus;
  approver_id?: number;
  approver_name?: string;
  approval_notes?: string;
  approval_date?: string;
  payment_date?: string;
  receipt_urls: string[];
  created_at: string;
  updated_at: string;
}

// 用印申请创建请求
export interface SealApplicationCreateRequest {
  seal_type: SealType;
  document_name: string;
  document_count: number;
  purpose: string;
  case_id?: number;
  file_urls: string[];
}

// 公告创建请求
export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  announcement_type: AnnouncementType;
  priority: "low" | "medium" | "high";
  target_roles?: string[];
  target_users?: number[];
  expiry_date?: string;
  attachment_urls?: string[];
}

// 工作汇报创建请求
export interface WorkReportCreateRequest {
  report_type: ReportType;
  report_period_start: string;
  report_period_end: string;
  content: {
    completed_work: string[];
    ongoing_work: string[];
    next_plan: string[];
    problems: string[];
    suggestions: string[];
  };
  case_statistics?: {
    new_cases: number;
    active_cases: number;
    completed_cases: number;
    total_fees: number;
  };
}

// 知识库文档创建请求
export interface KnowledgeDocumentCreateRequest {
  title: string;
  content: string;
  doc_type: KnowledgeDocType;
  category: string;
  tags: string[];
  file_urls?: string[];
  is_public: boolean;
  allowed_roles?: string[];
}