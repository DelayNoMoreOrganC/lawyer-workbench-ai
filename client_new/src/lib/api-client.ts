import {
  ApiResponse,
  CasesListResponse,
  Case,
  CaseFormData,
  TasksListResponse,
  Task,
  AuthResponse,
  User,
  ApiError,
  PaginationParams,
  FilterParams,
} from "@/types";
import {
  Expense,
  AttorneyFee,
  Payment,
  Invoice,
  Reimbursement,
  CaseFinanceSummary,
  FinanceFilterParams,
  ExpenseApprovalRequest,
  ReimbursementCreateRequest,
} from "@/types/finance";
import {
  Customer,
  Communication,
  CustomerCaseStatistics,
  CustomerFilterParams,
  ConflictCheckResult,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  CommunicationCreateRequest,
} from "@/types/customer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v2";

class ApiError extends Error {
  constructor(
    public detail: string,
    public status_code: number,
    public error_code?: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30秒默认超时

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): Record<string, string> {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new ApiError(
          errorData.detail || "请求失败",
          response.status,
          errorData.error_code
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError("请求超时，请稍后重试", 408);
        }
        throw new ApiError(error.message, 500);
      }
      throw new ApiError("未知错误", 500);
    }
  }

  // 认证相关API
  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async register(userData: {
    username: string;
    password: string;
    email: string;
    full_name: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // 案件相关API
  async getCases(
    pagination?: PaginationParams,
    filters?: FilterParams
  ): Promise<CasesListResponse> {
    const params = new URLSearchParams();

    if (pagination) {
      params.append("page", pagination.page.toString());
      params.append("page_size", pagination.page_size.toString());
      if (pagination.sort_by) {
        params.append("sort_by", pagination.sort_by);
        params.append("order", pagination.order || "asc");
      }
    }

    if (filters) {
      if (filters.search) params.append("search", filters.search);
      if (filters.case_type) params.append("case_type", filters.case_type);
      if (filters.case_status) params.append("case_status", filters.case_status);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
    }

    const queryString = params.toString();
    return this.request<CasesListResponse>(
      `/cases/${queryString ? `?${queryString}` : ""}`
    );
  }

  async getCase(id: number): Promise<Case> {
    return this.request<Case>(`/cases/${id}`);
  }

  async createCase(data: CaseFormData): Promise<Case> {
    return this.request<Case>("/cases/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCase(id: number, data: Partial<CaseFormData>): Promise<Case> {
    return this.request<Case>(`/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCase(id: number): Promise<void> {
    return this.request<void>(`/cases/${id}`, {
      method: "DELETE",
    });
  }

  // 任务相关API
  async getTasks(
    pagination?: PaginationParams
  ): Promise<TasksListResponse> {
    const params = new URLSearchParams();

    if (pagination) {
      params.append("page", pagination.page.toString());
      params.append("page_size", pagination.page_size.toString());
    }

    const queryString = params.toString();
    return this.request<TasksListResponse>(
      `/tasks/${queryString ? `?${queryString}` : ""}`
    );
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(data: {
    task_title: string;
    task_description?: string;
    priority: number;
    due_date?: string;
    case_id?: number;
  }): Promise<Task> {
    return this.request<Task>("/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: number,
    data: {
      task_title?: string;
      task_description?: string;
      task_status?: string;
      priority?: number;
      due_date?: string;
    }
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // AI文档识别API
  async analyzeDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

    try {
      const response = await fetch(`${this.baseURL}/ai/analyze-document`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new ApiError(
          errorData.detail || "文档分析失败",
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("文档分析失败", 500);
    }
  }

  // ========== 财务管理 API ==========

  // 获取案件费用列表
  async getExpenses(caseId?: number): Promise<Expense[]> {
    const url = caseId ? `/finance/expenses?case_id=${caseId}` : "/finance/expenses";
    return this.request<Expense[]>(url);
  }

  // 创建费用记录
  async createExpense(data: {
    case_id: number;
    expense_type: string;
    amount: number;
    description: string;
    receipt?: string;
    notes?: string;
  }): Promise<Expense> {
    return this.request<Expense>("/finance/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新费用记录
  async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
    return this.request<Expense>(`/finance/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 删除费用记录
  async deleteExpense(id: number): Promise<void> {
    return this.request<void>(`/finance/expenses/${id}`, {
      method: "DELETE",
    });
  }

  // 审批费用
  async approveExpense(request: ExpenseApprovalRequest): Promise<Expense> {
    return this.request<Expense>(`/finance/expenses/${request.expense_id}/approve`, {
      method: "POST",
      body: JSON.stringify({
        action: request.action,
        notes: request.notes,
      }),
    });
  }

  // 获取律师费记录
  async getAttorneyFees(caseId?: number): Promise<AttorneyFee[]> {
    const url = caseId ? `/finance/attorney-fees?case_id=${caseId}` : "/finance/attorney-fees";
    return this.request<AttorneyFee[]>(url);
  }

  // 创建律师费记录
  async createAttorneyFee(data: {
    case_id: number;
    total_amount: number;
    billing_type: string;
    contingency_percentage?: number;
    hourly_rate?: number;
    billable_hours?: number;
    contract_date?: string;
    notes?: string;
  }): Promise<AttorneyFee> {
    return this.request<AttorneyFee>("/finance/attorney-fees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新律师费记录
  async updateAttorneyFee(id: number, data: Partial<AttorneyFee>): Promise<AttorneyFee> {
    return this.request<AttorneyFee>(`/finance/attorney-fees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 获取收款记录
  async getPayments(caseId?: number): Promise<Payment[]> {
    const url = caseId ? `/finance/payments?case_id=${caseId}` : "/finance/payments";
    return this.request<Payment[]>(url);
  }

  // 创建收款记录
  async createPayment(data: {
    case_id: number;
    attorney_fee_id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    payer: string;
    receipt_number?: string;
    invoice_number?: string;
    notes?: string;
  }): Promise<Payment> {
    return this.request<Payment>("/finance/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新收款记录
  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
    return this.request<Payment>(`/finance/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 获取发票记录
  async getInvoices(caseId?: number): Promise<Invoice[]> {
    const url = caseId ? `/finance/invoices?case_id=${caseId}` : "/finance/invoices";
    return this.request<Invoice[]>(url);
  }

  // 创建发票记录
  async createInvoice(data: {
    case_id: number;
    invoice_number: string;
    amount: number;
    invoice_type: string;
    invoice_date: string;
    customer_name: string;
    customer_tax_number?: string;
    notes?: string;
  }): Promise<Invoice> {
    return this.request<Invoice>("/finance/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新发票记录
  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
    return this.request<Invoice>(`/finance/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 获取报销记录
  async getReimbursements(caseId?: number): Promise<Reimbursement[]> {
    const url = caseId ? `/finance/reimbursements?case_id=${caseId}` : "/finance/reimbursements";
    return this.request<Reimbursement[]>(url);
  }

  // 创建报销申请
  async createReimbursement(data: ReimbursementCreateRequest): Promise<Reimbursement> {
    return this.request<Reimbursement>("/finance/reimbursements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 审批报销申请
  async approveReimbursement(
    reimbursementId: number,
    request: { action: "approve" | "reject"; notes?: string }
  ): Promise<Reimbursement> {
    return this.request<Reimbursement>(`/finance/reimbursements/${reimbursementId}/approve`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // 获取案件财务统计
  async getCaseFinanceSummary(caseId: number): Promise<CaseFinanceSummary> {
    return this.request<CaseFinanceSummary>(`/finance/cases/${caseId}/summary`);
  }

  // 获取整体财务统计
  async getFinanceStatistics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    total_income: number;
    total_expenses: number;
    total_profit: number;
    pending_payments: number;
    case_count: number;
    monthly_breakdown: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
  }> {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return this.request<{ total_income: number; total_expenses: number; total_profit: number; pending_payments: number; case_count: number; monthly_breakdown: Array<{ month: string; income: number; expenses: number; profit: number }> }>(
      `/finance/statistics${queryString}`
    );
  }

  // ========== 客户管理 API ==========

  // 获取客户列表
  async getCustomers(params?: CustomerFilterParams): Promise<Customer[]> {
    const queryString = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    return this.request<Customer[]>(`/customers${queryString}`);
  }

  // 获取单个客户
  async getCustomer(id: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  // 创建客户
  async createCustomer(data: CustomerCreateRequest): Promise<Customer> {
    return this.request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新客户
  async updateCustomer(id: number, data: CustomerUpdateRequest): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 删除客户
  async deleteCustomer(id: number): Promise<void> {
    return this.request<void>(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  // 获取客户的案件统计
  async getCustomerCaseStatistics(customerId: number): Promise<CustomerCaseStatistics> {
    return this.request<CustomerCaseStatistics>(`/customers/${customerId}/case-statistics`);
  }

  // 获取客户的沟通记录
  async getCommunications(customerId?: number): Promise<Communication[]> {
    const url = customerId ? `/customers/${customerId}/communications` : "/communications";
    return this.request<Communication[]>(url);
  }

  // 创建沟通记录
  async createCommunication(data: CommunicationCreateRequest): Promise<Communication> {
    return this.request<Communication>("/communications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新沟通记录
  async updateCommunication(
    id: number,
    data: Partial<Communication>
  ): Promise<Communication> {
    return this.request<Communication>(`/communications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 删除沟通记录
  async deleteCommunication(id: number): Promise<void> {
    return this.request<void>(`/communications/${id}`, {
      method: "DELETE",
    });
  }

  // 冲突检测
  async checkConflict(
    customerName: string,
    customerId?: number
  ): Promise<ConflictCheckResult> {
    const params = new URLSearchParams({
      customer_name: customerName,
    });

    if (customerId) {
      params.append("customer_id", customerId.toString());
    }

    return this.request<ConflictCheckResult>(`/customers/conflict-check?${params.toString()}`);
  }

  // 搜索客户
  async searchCustomers(keyword: string): Promise<Customer[]> {
    return this.request<Customer[]>(`/customers/search?keyword=${encodeURIComponent(keyword)}`);
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

// 导出类型
export { ApiError };
