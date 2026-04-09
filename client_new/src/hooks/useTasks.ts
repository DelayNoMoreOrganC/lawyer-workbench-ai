import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { Task, PaginationParams } from "@/types";

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (data: {
    task_title: string;
    task_description?: string;
    priority: number;
    due_date?: string;
    case_id?: number;
  }) => Promise<Task>;
  updateTask: (
    id: number,
    data: {
      task_title?: string;
      task_description?: string;
      task_status?: string;
      priority?: number;
      due_date?: string;
    }
  ) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
}

export function useTasks(pagination?: PaginationParams): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getTasks(pagination);
      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取任务列表失败");
      console.error("获取任务列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination]);

  const createTask = useCallback(async (data: {
    task_title: string;
    task_description?: string;
    priority: number;
    due_date?: string;
    case_id?: number;
  }) => {
    try {
      const newTask = await apiClient.createTask(data);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建任务失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (
    id: number,
    data: {
      task_title?: string;
      task_description?: string;
      task_status?: string;
      priority?: number;
      due_date?: string;
    }
  ) => {
    try {
      const updatedTask = await apiClient.updateTask(id, data);
      setTasks(prev =>
        prev.map(t => (t.id === id ? updatedTask : t))
      );
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新任务失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await apiClient.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除任务失败";
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}