import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Customer,
  Communication,
  CustomerCaseStatistics,
  CustomerFilterParams,
  ConflictCheckResult,
  CustomerCreateRequest,
  CommunicationCreateRequest,
} from "@/types/customer";

interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCustomer: (data: CustomerCreateRequest) => Promise<Customer>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
}

export function useCustomers(filters?: CustomerFilterParams): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCustomers(filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取客户列表失败");
      console.error("获取客户列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createCustomer = useCallback(async (data: CustomerCreateRequest) => {
    try {
      const newCustomer = await apiClient.createCustomer(data);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建客户失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateCustomer = useCallback(async (id: number, data: Partial<Customer>) => {
    try {
      const updatedCustomer = await apiClient.updateCustomer(id, data);
      setCustomers(prev =>
        prev.map(c => (c.id === id ? updatedCustomer : c))
      );
      return updatedCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新客户失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number) => {
    try {
      await apiClient.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除客户失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

// 获取客户详情的Hook
export function useCustomer(customerId: number) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getCustomer(customerId);
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取客户详情失败");
        console.error("获取客户详情失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  return { customer, loading, error };
}

// 获取客户案件统计的Hook
export function useCustomerCaseStatistics(customerId: number) {
  const [statistics, setStatistics] = useState<CustomerCaseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getCustomerCaseStatistics(customerId);
        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取客户案件统计失败");
        console.error("获取客户案件统计失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [customerId]);

  return { statistics, loading, error };
}

// 获取客户沟通记录的Hook
export function useCommunications(customerId?: number) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getCommunications(customerId);
      setCommunications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取沟通记录失败");
      console.error("获取沟通记录失败:", err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const createCommunication = useCallback(async (data: CommunicationCreateRequest) => {
    try {
      const newCommunication = await apiClient.createCommunication(data);
      setCommunications(prev => [...prev, newCommunication]);
      return newCommunication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建沟通记录失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  return {
    communications,
    loading,
    error,
    refetch: fetchCommunications,
    createCommunication,
  };
}

// 冲突检测的Hook
export function useConflictCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConflict = useCallback(async (customerName: string, customerId?: number) => {
    setChecking(true);
    setError(null);
    try {
      const result = await apiClient.checkConflict(customerName, customerId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "冲突检测失败";
      setError(errorMessage);
      throw err;
    } finally {
      setChecking(false);
    }
  }, []);

  return { checkConflict, checking, error };
}

// 客户搜索的Hook
export function useCustomerSearch() {
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    setError(null);
    try {
      const data = await apiClient.searchCustomers(keyword);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "客户搜索失败";
      setError(errorMessage);
      console.error("客户搜索失败:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, searching, error, searchCustomers, clearResults };
}