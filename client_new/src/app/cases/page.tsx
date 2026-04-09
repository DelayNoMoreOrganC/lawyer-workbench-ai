"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Case {
  id: number;
  case_number: string;
  case_name: string;
  case_type: string;
  case_status: string;
  court_name: string;
  filing_date: string;
  created_at: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 优化统计计算
  const stats = useMemo(() => ({
    total: cases.length,
    pendingFiling: cases.filter(c => c.case_status === "draft" || c.case_status === "pending_filing").length,
    inTrial: cases.filter(c => c.case_status === "first_trial" || c.case_status === "second_trial").length,
    completed: cases.filter(c => c.case_status === "completed").length
  }), [cases]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:5000/api/v2/cases/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error("获取案件列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredCases = useMemo(() =>
    cases.filter(
      (caseItem) =>
        (caseItem.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterType === "" || caseItem.case_type === filterType) &&
        (filterStatus === "" || caseItem.case_status === filterStatus)
    ),
    [cases, searchTerm, filterType, filterStatus]
  );

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "draft": "起草中",
      "pending_filing": "待立案",
      "submitted": "已立案",
      "first_trial": "一审审理中",
      "waiting_judgment": "待判决",
      "judged": "已判决",
      "pending_appeal": "待上诉",
      "second_trial": "二审审理中",
      "final_judgment": "终审判决",
      "execution": "执行中",
      "completed": "已结案",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      "draft": "bg-gray-100 text-gray-800",
      "pending_filing": "bg-yellow-100 text-yellow-800",
      "submitted": "bg-blue-100 text-blue-800",
      "first_trial": "bg-indigo-100 text-indigo-800",
      "waiting_judgment": "bg-purple-100 text-purple-800",
      "judged": "bg-green-100 text-green-800",
      "pending_appeal": "bg-orange-100 text-orange-800",
      "second_trial": "bg-indigo-100 text-indigo-800",
      "final_judgment": "bg-green-100 text-green-800",
      "execution": "bg-teal-100 text-teal-800",
      "completed": "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const handleDuplicateCase = async (caseItem: Case) => {
    if (!confirm(`确定要复制案件 "${caseItem.case_name}" 吗？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:5000/api/v2/cases/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...caseItem,
          case_name: `${caseItem.case_name} (副本)`,
          case_number: undefined, // 清除案号
          case_status: "draft",   // 重置状态为草稿
          id: undefined           // 清除ID
        }),
      });

      if (response.ok) {
        alert("案件复制成功！");
        fetchCases(); // 重新加载案件列表
      } else {
        const errorData = await response.json();
        alert(`复制失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("复制案件异常:", error);
      alert(`复制失败: ${error instanceof Error ? error.message : "网络错误"}`);
    }
  };

  const handleDeleteCase = async (caseId: number) => {
    if (!confirm("确定要删除此案件吗？此操作不可恢复！")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:5000/api/v2/cases/${caseId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("案件删除成功！");
        fetchCases(); // 重新加载案件列表
      } else {
        const errorData = await response.json();
        alert(`删除失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("删除案件异常:", error);
      alert(`删除失败: ${error instanceof Error ? error.message : "网络错误"}`);
    }
  };

  const handleExportCSV = useCallback(() => {
    // 导出CSV格式
    const headers = ["案号", "案件名称", "类型", "状态", "法院", "立案日期"];
    const csvContent = [
      headers.join(","),
      ...filteredCases.map(c => [
        c.case_number || "",
        c.case_name,
        c.case_type,
        getStatusLabel(c.case_status),
        c.court_name || "",
        c.filing_date ? new Date(c.filing_date).toLocaleDateString("zh-CN") : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `案件列表_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredCases]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">案件管理</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/cases/new">
              <Button className="bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                新建案件
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 text-sm"
            >
              导出数据
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card className="p-3 mb-6 border border-gray-200">
          <div className="flex gap-3">
            <Input
              placeholder="搜索案件名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 h-9 text-sm"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm h-9"
            >
              <option value="">全部类型</option>
              <option value="民事">民事</option>
              <option value="刑事">刑事</option>
              <option value="行政">行政</option>
              <option value="执行">执行</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm h-9"
            >
              <option value="">全部状态</option>
              <option value="draft">起草中</option>
              <option value="pending_filing">待立案</option>
              <option value="first_trial">一审审理中</option>
              <option value="second_trial">二审审理中</option>
              <option value="completed">已结案</option>
            </select>
          </div>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">全部案件</div>
          </Card>
          <Card className="p-3 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">
              {stats.pendingFiling}
            </div>
            <div className="text-xs text-gray-500">待立案</div>
          </Card>
          <Card className="p-3 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">
              {stats.inTrial}
            </div>
            <div className="text-xs text-gray-500">审理中</div>
          </Card>
          <Card className="p-3 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500">已结案</div>
          </Card>
        </div>

        {/* 案件列表 */}
        <Card className="border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">加载中...</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {searchTerm ? "未找到匹配的案件" : "暂无案件，请点击上方按钮创建"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">案件名称</TableHead>
                  <TableHead className="text-xs font-medium">类型</TableHead>
                  <TableHead className="text-xs font-medium">状态</TableHead>
                  <TableHead className="text-xs font-medium">法院</TableHead>
                  <TableHead className="text-xs font-medium">立案日期</TableHead>
                  <TableHead className="text-xs font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">
                      {caseItem.case_name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {caseItem.case_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(caseItem.case_status)}`}>
                        {getStatusLabel(caseItem.case_status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {caseItem.court_name || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {caseItem.filing_date
                        ? new Date(caseItem.filing_date).toLocaleDateString("zh-CN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Link href={`/cases/${caseItem.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            编辑
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateCase(caseItem)}
                          className="h-7 text-xs"
                        >
                          复制
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCase(caseItem.id)}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* 统计信息 */}
        <div className="mt-4 text-xs text-gray-500">
          共 {filteredCases.length} 个案件
        </div>
      </div>
    </div>
  );
}