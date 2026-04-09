// 财务管理相关类型定义

// 费用类型枚举
export enum ExpenseType {
  LITIGATION = "诉讼费",
  PRESERVATION = "保全费",
  NOTARY = "公证费",
  AUTHENTICATION = "鉴定费",
  TRAVEL = "差旅费",
  POSTAGE = "快递费",
  PRINTING = "打印费",
  OTHER = "其他费用",
}

// 收费方式枚举
export enum BillingType {
  FIXED = "固定收费",
  CONTINGENCY = "风险代理",
  HOURLY = "计时收费",
  HYBRID = "混合收费",
}

// 费用状态枚举
export enum ExpenseStatus {
  PENDING = "待审批",
  APPROVED = "已批准",
  REJECTED = "已拒绝",
  PAID = "已支付",
}

// 律师费状态枚举
export enum AttorneyFeeStatus {
  UNPAID = "未收款",
  PARTIAL = "部分收款",
  PAID = "已收款",
}

// 费用记录
export interface Expense {
  id: number;
  case_id: number;
  expense_type: ExpenseType;
  amount: number;
  description: string;
  status: ExpenseStatus;
  applicant_id: number;
  approver_id?: number;
  apply_date: string;
  approve_date?: string;
  payment_date?: string;
  receipt?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 律师费记录
export interface AttorneyFee {
  id: number;
  case_id: number;
  total_amount: number;
  billing_type: BillingType;
  contingency_percentage?: number; // 风险代理比例
  hourly_rate?: number; // 计费费率
  billable_hours?: number; // 计费工时
  status: AttorneyFeeStatus;
  paid_amount: number;
  contract_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 收款记录
export interface Payment {
  id: number;
  case_id: number;
  attorney_fee_id: number;
  amount: number;
  payment_date: string;
  payment_method: "现金" | "转账" | "支票" | "其他";
  payer: string;
  receipt_number?: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
}

// 发票记录
export interface Invoice {
  id: number;
  case_id: number;
  invoice_number: string;
  amount: number;
  invoice_type: "增值税专用发票" | "增值税普通发票" | "电子发票";
  invoice_date: string;
  customer_name: string;
  customer_tax_number?: string;
  status: "未开具" | "已开具" | "已作废";
  file_url?: string;
  notes?: string;
  created_at: string;
}

// 报销申请
export interface Reimbursement {
  id: number;
  case_id: number;
  applicant_id: number;
  amount: number;
  title: string;
  description: string;
  expense_type: ExpenseType;
  status: ExpenseStatus;
  approver_id?: number;
  apply_date: string;
  approve_date?: string;
  payment_date?: string;
  receipts?: string[]; // 收据文件URL
  notes?: string;
  created_at: string;
}

// 案件财务统计
export interface CaseFinanceSummary {
  case_id: number;
  case_name: string;
  total_expenses: number; // 总支出
  total_attorney_fees: number; // 律师费总额
  paid_attorney_fees: number; // 已收律师费
  pending_attorney_fees: number; // 待收律师费
  profit: number; // 利润
  profit_margin: number; // 利润率
  expense_breakdown: Record<ExpenseType, number>; // 费用分类统计
}

// 财务筛选参数
export interface FinanceFilterParams {
  case_id?: number;
  start_date?: string;
  end_date?: string;
  status?: ExpenseStatus | AttorneyFeeStatus;
  expense_type?: ExpenseType;
}

// 费用审批请求
export interface ExpenseApprovalRequest {
  expense_id: number;
  action: "approve" | "reject";
  notes?: string;
}

// 报销申请创建请求
export interface ReimbursementCreateRequest {
  case_id: number;
  amount: number;
  title: string;
  description: string;
  expense_type: ExpenseType;
  receipts?: string[];
  notes?: string;
}