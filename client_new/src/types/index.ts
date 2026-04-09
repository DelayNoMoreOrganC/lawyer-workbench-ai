// 案件状态枚举
export enum CaseStatus {
  DRAFT = "draft",
  PENDING_FILING = "pending_filing",
  SUBMITTED = "submitted",
  FIRST_TRIAL = "first_trial",
  WAITING_JUDGMENT = "waiting_judgment",
  JUDGED = "judged",
  PENDING_APPEAL = "pending_appeal",
  SECOND_TRIAL = "second_trial",
  FINAL_JUDGMENT = "final_judgment",
  EXECUTION = "execution",
  COMPLETED = "completed",
}

// 案件类型枚举
export enum CaseType {
  CIVIL = "民事",
  CRIMINAL = "刑事",
  ADMINISTRATIVE = "行政",
  EXECUTION = "执行",
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

// 用户角色枚举
export enum UserRole {
  ADMIN = "admin",
  LAWYER = "lawyer",
  ASSISTANT = "assistant",
}

// 基础案件接口
export interface Case {
  id: number;
  case_number: string;
  case_name: string;
  case_type: CaseType;
  case_status: CaseStatus;
  court_name: string;
  judge_name: string;
  plaintiff: string;
  defendant: string;
  case_amount: number;
  filing_date: string;
  hearing_date: string;
  case_brief: string;
  created_at: string;
  updated_at: string;
}

// 案件表单数据接口
export interface CaseFormData {
  case_name: string;
  case_type: CaseType;
  case_status: CaseStatus;
  court_name: string;
  judge_name: string;
  plaintiff: string;
  defendant: string;
  case_amount: string;
  filing_date: string;
  hearing_date: string;
  case_brief: string;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 案件列表响应
export interface CasesListResponse {
  cases: Case[];
  total: number;
  page: number;
  page_size: number;
}

// 任务接口
export interface Task {
  id: number;
  task_title: string;
  task_description: string;
  task_status: TaskStatus;
  priority: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  case_id?: number;
}

// 任务列表响应
export interface TasksListResponse {
  tasks: Task[];
  total: number;
}

// 用户接口
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// 认证响应
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// 文档接口
export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  case_id?: number;
  uploaded_by: number;
}

// AI识别结果
export interface AIExtractionResult {
  case_name: string;
  case_type: CaseType;
  court_name: string;
  plaintiff: string;
  defendant: string;
  case_brief: string;
  case_number?: string;
  confidence?: number;
}

// 案件模板
export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  case_type: CaseType;
  defaultData: Partial<CaseFormData>;
}

// API错误响应
export interface ApiError {
  detail: string;
  status_code: number;
  error_code?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  page_size: number;
  sort_by?: string;
  order?: "asc" | "desc";
}

// 筛选参数
export interface FilterParams {
  search?: string;
  case_type?: CaseType;
  case_status?: CaseStatus;
  start_date?: string;
  end_date?: string;
}