import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Case, CaseFormData, PaginationParams, FilterParams } from "@/types";

interface UseCasesResult {
  cases: Case[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCase: (data: CaseFormData) => Promise<Case>;
  updateCase: (id: number, data: Partial<CaseFormData>) => Promise<Case>;
  deleteCase: (id: number) => Promise<void>;
}

export function useCases(
  pagination?: PaginationParams,
  filters?: FilterParams
): UseCasesResult {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getCases(pagination, filters);
      setCases(response.cases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取案件列表失败");
      console.error("获取案件列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination, filters]);

  const createCase = useCallback(async (data: CaseFormData) => {
    try {
      const newCase = await apiClient.createCase(data);
      setCases(prev => [...prev, newCase]);
      return newCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建案件失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateCase = useCallback(async (id: number, data: Partial<CaseFormData>) => {
    try {
      const updatedCase = await apiClient.updateCase(id, data);
      setCases(prev =>
        prev.map(c => (c.id === id ? updatedCase : c))
      );
      return updatedCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新案件失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteCase = useCallback(async (id: number) => {
    try {
      await apiClient.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除案件失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
    createCase,
    updateCase,
    deleteCase,
  };
}