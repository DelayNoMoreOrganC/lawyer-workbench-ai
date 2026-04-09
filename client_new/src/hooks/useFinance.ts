import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Expense,
  AttorneyFee,
  Payment,
  Invoice,
  Reimbursement,
  CaseFinanceSummary,
} from "@/types/finance";

interface UseFinanceResult {
  expenses: Expense[];
  attorneyFees: AttorneyFee[];
  payments: Payment[];
  invoices: Invoice[];
  reimbursements: Reimbursement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFinance(caseId?: number): UseFinanceResult {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attorneyFees, setAttorneyFees] = useState<AttorneyFee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, feesData, paymentsData, invoicesData, reimburseData] =
        await Promise.all([
          apiClient.getExpenses(caseId),
          apiClient.getAttorneyFees(caseId),
          apiClient.getPayments(caseId),
          apiClient.getInvoices(caseId),
          apiClient.getReimbursements(caseId),
        ]);

      setExpenses(expensesData);
      setAttorneyFees(feesData);
      setPayments(paymentsData);
      setInvoices(invoicesData);
      setReimbursements(reimburseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取财务数据失败");
      console.error("获取财务数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  return {
    expenses,
    attorneyFees,
    payments,
    invoices,
    reimbursements,
    loading,
    error,
    refetch: fetchFinanceData,
  };
}

// 获取案件财务统计的Hook
export function useCaseFinanceSummary(caseId: number) {
  const [summary, setSummary] = useState<CaseFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getCaseFinanceSummary(caseId);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取财务统计失败");
        console.error("获取财务统计失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [caseId]);

  return { summary, loading, error };
}

// 创建费用的Hook
export function useCreateExpense() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = useCallback(
    async (data: {
      case_id: number;
      expense_type: string;
      amount: number;
      description: string;
      receipt?: string;
      notes?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient.createExpense(data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "创建费用失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createExpense, loading, error };
}

// 创建律师费的Hook
export function useCreateAttorneyFee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAttorneyFee = useCallback(
    async (data: {
      case_id: number;
      total_amount: number;
      billing_type: string;
      contingency_percentage?: number;
      hourly_rate?: number;
      billable_hours?: number;
      contract_date?: string;
      notes?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient.createAttorneyFee(data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "创建律师费失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createAttorneyFee, loading, error };
}

// 创建收款记录的Hook
export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(
    async (data: {
      case_id: number;
      attorney_fee_id: number;
      amount: number;
      payment_date: string;
      payment_method: string;
      payer: string;
      receipt_number?: string;
      invoice_number?: string;
      notes?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient.createPayment(data);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "创建收款记录失败";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createPayment, loading, error };
}