"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentUpload } from "@/components/document-upload";
import { MonthCalendarView } from "@/components/month-calendar-view";

interface Case {
  id: number;
  case_number: string;
  case_name: string;
  case_type: string;
  case_status: string;
  court_name: string;
  hearing_date: string;
}

interface Task {
  id: number;
  task_title: string;
  task_status: string;
  priority: number;
  due_date: string;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterType, setFilterType] = useState("全部");
  const [filterStatus, setFilterStatus] = useState("全部");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesRes, tasksRes] = await Promise.all([
        fetch("http://localhost:5000/api/v2/cases/"),
        fetch("http://localhost:5000/api/v2/tasks/"),
      ]);

      const casesData = await casesRes.json();
      const tasksData = await tasksRes.json();

      setCases(casesData.cases || []);
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  const handleExtractedData = async (extractedData: any) => {
    try {
      console.log("AI识别数据:", extractedData);

      const response = await fetch("http://localhost:5000/api/v2/cases/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedData),
      });

      console.log("创建案件响应状态:", response.status);

      if (response.ok) {
        const newCase = await response.json();
        console.log("创建的案件:", newCase);

        const shouldView = confirm(
          `AI识别成功！\\n\\n已自动创建案件：\\"${newCase.case_name}\\"\\n\\n是否立即查看案件详情？\\n\\n(点击"确定"查看详情，"取消"留在当前页面)`
        );

        if (shouldView) {
          window.location.href = `/cases/${newCase.id}`;
        } else {
          await fetchData();
          alert("案件已创建，可以继续上传更多文档");
        }
      } else {
        const errorData = await response.json();
        console.error("创建案件失败:", errorData);
        alert(`创建案件失败: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("创建案件异常:", error);
      alert(`创建案件失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    if (filterType !== "全部" && caseItem.case_type !== filterType)
      return false;
    if (filterStatus !== "全部" && caseItem.case_status !== filterStatus)
      return false;
    return true;
  });

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-50 text-red-700 border-red-200";
    if (priority >= 3) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                工作台
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                案件管理和日程安排
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                刷新数据
              </Button>
              <Button
                size="sm"
                onClick={() => (window.location.href = "/cases/new")}
              >
                新建案件
              </Button>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 左侧：月历视图 */}
          <Card className="lg:col-span-2 p-6 border-gray-200">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                日程安排
              </h2>
              <p className="text-xs text-gray-500">
                点击日期查看详细日程
              </p>
            </div>

            <div className="h-96">
              <MonthCalendarView
                tasks={tasks}
                cases={cases}
                onDateClick={(selectedDate) => {
                  console.log("选中日期:", selectedDate);
                }}
              />
            </div>
          </Card>

          {/* 右侧：待办事项 */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  待办事项
                </h2>
                <p className="text-xs text-gray-500">
                  今日任务 {tasks.filter(t => {
                    if (!t.due_date) return false;
                    const taskDate = new Date(t.due_date).toDateString();
                    const today = new Date().toDateString();
                    return taskDate === today;
                  }).length} 项
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-sm">
                  暂无待办事项
                </div>
              ) : (
                tasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {task.task_title}
                          </p>
                          <Badge
                            className={`text-xs ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            P{task.priority}
                          </Badge>
                        </div>
                        {task.due_date && (
                          <p className="text-xs text-gray-500">
                            {new Date(task.due_date).toLocaleDateString("zh-CN")}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`text-xs shrink-0 ${getTaskStatusColor(
                          task.task_status
                        )}`}
                      >
                        {task.task_status === "pending"
                          ? "待处理"
                          : task.task_status === "in_progress"
                          ? "进行中"
                          : "已完成"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {tasks.length > 6 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="w-full text-gray-600">
                  查看全部 {tasks.length} 个任务
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* AI文档识别区域 */}
        <Card className="mb-8 border border-blue-200 bg-blue-50/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  AI文档识别
                </h2>
                <p className="text-sm text-gray-600">
                  上传法律文书，自动创建案件
                </p>
              </div>
              <Badge className="bg-blue-600 text-white text-xs">
                新功能
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DocumentUpload onExtractedData={handleExtractedData} />
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        快速识别
                      </h3>
                      <p className="text-xs text-gray-600">
                        支持PDF、图片等格式
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        高准确率
                      </h3>
                      <p className="text-xs text-gray-600">
                        AI识别准确率95%+
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">📋</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        自动填充
                      </h3>
                      <p className="text-xs text-gray-600">
                        自动创建案件记录
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">💾</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        智能存储
                      </h3>
                      <p className="text-xs text-gray-600">
                        自动保存原始文档
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    支持的文档类型
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">起诉状</Badge>
                    <Badge variant="outline" className="text-xs">传票</Badge>
                    <Badge variant="outline" className="text-xs">判决书</Badge>
                    <Badge variant="outline" className="text-xs">调解书</Badge>
                    <Badge variant="outline" className="text-xs">裁定书</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 案件列表 */}
        <Card className="border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  案件列表
                </h2>
                <p className="text-xs text-gray-500">
                  共 {filteredCases.length} 个案件
                </p>
              </div>
              <div className="flex gap-3">
                <select
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option>全部类型</option>
                  <option>民事</option>
                  <option>刑事</option>
                  <option>行政</option>
                  <option>执行</option>
                </select>
                <select
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option>全部状态</option>
                  <option>待立案</option>
                  <option>一审</option>
                  <option>二审</option>
                  <option>执行</option>
                  <option>结案</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    案号
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    案件名称
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    类型
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    状态
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    法院
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    开庭时间
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                      暂无案件数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      onClick={() => (window.location.href = `/cases/${caseItem.id}`)}
                    >
                      <TableCell className="text-sm text-gray-900">
                        {caseItem.case_number || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 font-medium">
                        {caseItem.case_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300 text-gray-700"
                        >
                          {caseItem.case_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            caseItem.case_status === "结案"
                              ? "border-gray-300 text-gray-700"
                              : "border-green-300 text-green-700"
                          }`}
                        >
                          {caseItem.case_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {caseItem.court_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {caseItem.hearing_date
                          ? new Date(caseItem.hearing_date).toLocaleDateString(
                              "zh-CN"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}