import { useState, useCallback } from "react";
import { ApiError } from "@/lib/api-client";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    onSuccess,
    onError,
    retryCount = 2,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await apiFunction(...args);
          setData(result);
          onSuccess?.(result);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("未知错误");

          // 如果是认证错误或404错误，不重试
          if (
            err instanceof ApiError &&
            (err.status_code === 401 || err.status_code === 404)
          ) {
            break;
          }

          // 如果还有重试机会，等待后重试
          if (attempt < retryCount) {
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * (attempt + 1))
            );
          }
        }
      }

      const errorMessage = lastError?.message || "请求失败";
      setError(errorMessage);
      onError?.(errorMessage);
      throw lastError;
    },
    [apiFunction, retryCount, retryDelay, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// 用于表单提交的hook
export function useFormSubmit<T>(
  submitFunction: (data: any) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (data: any): Promise<T | null> => {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await submitFunction(data);
        setSuccess(true);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "提交失败";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [submitFunction, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submit,
    submitting,
    error,
    success,
    reset,
  };
}