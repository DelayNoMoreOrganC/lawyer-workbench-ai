"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Task {
  id: number;
  case_id: number;
  task_title: string;
  task_description: string;
  task_type: string;
  task_status: string;
  priority: number;
  due_date: string;
  created_at: string;
}

interface TaskFormData {
  task_title: string;
  task_description: string;
  task_type: string;
  priority: number;
  due_date: string;
  case_id?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    task_title: "",
    task_description: "",
    task_type: "一般任务",
    priority: 2,
    due_date: "",
    case_id: undefined,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v2/tasks/");
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("获取待办事项失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskFormData({
      task_title: "",
      task_description: "",
      task_type: "一般任务",
      priority: 2,
      due_date: "",
      case_id: undefined,
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      task_title: task.task_title,
      task_description: task.task_description || "",
      task_type: task.task_type || "一般任务",
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      case_id: task.case_id,
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskFormData.task_title.trim()) {
      alert("请输入任务标题");
      return;
    }

    try {
      const url = editingTask
        ? `http://localhost:5000/api/v2/tasks/${editingTask.id}`
        : "http://localhost:5000/api/v2/tasks/";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskFormData,
          task_status: editingTask ? editingTask.task_status : "pending",
        }),
      });

      if (response.ok) {
        alert(editingTask ? "任务更新成功！" : "任务创建成功！");
        setShowTaskModal(false);
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`保存失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("保存任务异常:", error);
      alert(`保存失败: ${error instanceof Error ? error.message : "网络错误"}`);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.task_status === "completed" ? "pending" : "completed";
    try {
      const response = await fetch(`http://localhost:5000/api/v2/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_status: newStatus }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        alert("状态更新失败");
      }
    } catch (error) {
      console.error("更新状态异常:", error);
      alert("状态更新失败");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v2/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("任务删除成功！");
        fetchTasks();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("删除任务异常:", error);
      alert("删除失败");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.task_status === filter;
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-800";
    if (priority >= 3) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">待办事项</h1>
            <p className="text-gray-600 mt-1">管理案件相关任务和提醒</p>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreateTask}>
              + 新建任务
            </Button>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            全部
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            待处理
          </Button>
          <Button
            variant={filter === "in_progress" ? "default" : "outline"}
            onClick={() => setFilter("in_progress")}
          >
            进行中
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
          >
            已完成
          </Button>
        </div>

        {/* 任务列表 */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-8 text-center text-gray-500">加载中...</Card>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              暂无待办事项，请点击上方按钮创建
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{task.task_title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        优先级 {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                          task.task_status
                        )}`}
                      >
                        {task.task_status === "pending"
                          ? "待处理"
                          : task.task_status === "in_progress"
                          ? "进行中"
                          : "已完成"}
                      </span>
                    </div>
                    {task.task_description && (
                      <p className="text-gray-600 mb-2">{task.task_description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.task_type && <span>类型: {task.task_type}</span>}
                      {task.due_date && (
                        <span>
                          截止: {new Date(task.due_date).toLocaleString("zh-CN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTaskStatus(task)}
                    >
                      {task.task_status === "completed" ? "重开" : "完成"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 text-sm text-gray-600">
          共 {filteredTasks.length} 个待办事项
        </div>

        {/* 任务创建/编辑模态框 */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingTask ? "编辑任务" : "新建任务"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务标题 *
                  </label>
                  <Input
                    value={taskFormData.task_title}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, task_title: e.target.value })
                    }
                    placeholder="请输入任务标题"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务描述
                  </label>
                  <Textarea
                    value={taskFormData.task_description}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, task_description: e.target.value })
                    }
                    placeholder="请输入任务描述"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      任务类型
                    </label>
                    <select
                      value={taskFormData.task_type}
                      onChange={(e) =>
                        setTaskFormData({ ...taskFormData, task_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option>一般任务</option>
                      <option>开庭准备</option>
                      <option>文书撰写</option>
                      <option>证据收集</option>
                      <option>当事人沟通</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      优先级
                    </label>
                    <select
                      value={taskFormData.priority}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">低</option>
                      <option value="2">中</option>
                      <option value="3">高</option>
                      <option value="4">紧急</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    截止日期
                  </label>
                  <Input
                    type="date"
                    value={taskFormData.due_date}
                    onChange={(e) =>
                      setTaskFormData({ ...taskFormData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveTask}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}