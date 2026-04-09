// 客户管理相关类型定义

// 客户身份类型
export enum CustomerType {
  INDIVIDUAL = "个人",
  ENTERPRISE = "企业",
  OTHER = "其他",
}

// 客户来源
export enum CustomerSource {
  ONLINE = "网络推广",
  REFERRAL = "客户推荐",
  ADVERTISEMENT = "广告投放",
  EVENT = "线下活动",
  PARTNERSHIP = "合作伙伴",
  OTHER = "其他",
}

// 客户状态
export enum CustomerStatus {
  ACTIVE = "活跃",
  INACTIVE = "非活跃",
  POTENTIAL = "潜在客户",
  ARCHIVED = "已归档",
}

// 客户标签
export enum CustomerTag {
  VIP = "VIP",
  KEY_FOLLOW = "重点跟进",
  POTENTIAL = "潜在客户",
  COMPLETED = "已完结",
  HIGH_VALUE = "高价值",
  GOVERNMENT = "政府机关",
  LISTED_COMPANY = "上市公司",
  SME = "中小企业",
}

// 客户信息
export interface Customer {
  id: number;
  name: string; // 个人姓名或企业名称
  customer_type: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string; // 身份证号或统一社会信用代码
  industry?: string;
  source: CustomerSource;
  status: CustomerStatus;
  tags: CustomerTag[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 沟通记录
export interface Communication {
  id: number;
  customer_id: number;
  case_id?: number;
  communication_type: "面谈" | "电话" | "微信" | "邮件" | "短信" | "其他";
  communication_date: string;
  duration_minutes?: number;
  content: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  staff_id: number;
  staff_name?: string;
  created_at: string;
  updated_at: string;
}

// 沟通记录创建请求
export interface CommunicationCreateRequest {
  customer_id: number;
  case_id?: number;
  communication_type: "面谈" | "电话" | "微信" | "邮件" | "短信" | "其他";
  communication_date: string;
  duration_minutes?: number;
  content: string;
  follow_up_required: boolean;
  follow_up_date?: string;
}

// 客户案件统计
export interface CustomerCaseStatistics {
  customer_id: number;
  customer_name: string;
  total_cases: number;
  active_cases: number;
  completed_cases: number;
  total_attorney_fees: number;
  total_paid_fees: number;
  case_types: Record<string, number>; // 案件类型分布
  recent_cases: Array<{
    id: number;
    case_name: string;
    case_type: string;
    case_status: string;
    created_at: string;
  }>;
}

// 客户搜索筛选
export interface CustomerFilterParams {
  search?: string; // 搜索关键词（姓名、电话、公司名）
  customer_type?: CustomerType;
  status?: CustomerStatus;
  source?: CustomerSource;
  tags?: CustomerTag[];
  start_date?: string; // 创建日期范围
  end_date?: string;
}

// 冲突检测结果
export interface ConflictCheckResult {
  has_conflict: boolean;
  conflicting_cases: Array<{
    case_id: number;
    case_name: string;
    case_type: string;
    opposing_parties: string[]; // 对方当事人
    current_lawyers: string[]; // 当前主办律师
    case_status: string;
  }>;
  conflict_details: {
    direct_conflict: boolean; // 直接利益冲突
    potential_conflict: boolean; // 潜在利益冲突
    conflict_reason: string;
  };
}

// 客户创建请求
export interface CustomerCreateRequest {
  name: string;
  customer_type: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string;
  industry?: string;
  source: CustomerSource;
  status?: CustomerStatus;
  tags?: CustomerTag[];
  notes?: string;
}

// 客户更新请求
export interface CustomerUpdateRequest {
  name?: string;
  customer_type?: CustomerType;
  phone?: string;
  email?: string;
  address?: string;
  id_number?: string;
  industry?: string;
  source?: CustomerSource;
  status?: CustomerStatus;
  tags?: CustomerTag[];
  notes?: string;
}