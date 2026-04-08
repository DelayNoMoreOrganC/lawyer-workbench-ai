"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v2/cases/");
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error("获取案件列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">案件管理</h1>
            <p className="text-gray-600 mt-1">统一管理所有案件信息</p>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              + 新建案件
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="搜索案件名称或案号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select className="border rounded-lg px-4 py-2">
              <option value="">全部类型</option>
              <option value="民事">民事</option>
              <option value="刑事">刑事</option>
              <option value="行政">行政</option>
            </select>
            <select className="border rounded-lg px-4 py-2">
              <option value="">全部状态</option>
              <option value="待立案">待立案</option>
              <option value="一审">一审</option>
              <option value="二审">二审</option>
              <option value="结案">结案</option>
            </select>
          </div>
        </Card>

        {/* 案件列表 */}
        <Card>
          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : filteredCases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "未找到匹配的案件" : "暂无案件，请点击上方按钮创建"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案号</TableHead>
                  <TableHead>案件名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>法院</TableHead>
                  <TableHead>立案日期</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">
                      {caseItem.case_number || "-"}
                    </TableCell>
                    <TableCell>{caseItem.case_name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {caseItem.case_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {caseItem.case_status}
                      </span>
                    </TableCell>
                    <TableCell>{caseItem.court_name || "-"}</TableCell>
                    <TableCell>
                      {caseItem.filing_date
                        ? new Date(caseItem.filing_date).toLocaleDateString("zh-CN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          编辑
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
        <div className="mt-6 text-sm text-gray-600">
          共 {filteredCases.length} 个案件
        </div>
      </div>
    </div>
  );
}