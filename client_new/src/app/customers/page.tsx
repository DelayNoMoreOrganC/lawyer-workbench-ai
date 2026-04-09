"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers, useCustomerSearch } from "@/hooks/useCustomers";
import { CustomerStatus, CustomerTag, CustomerType } from "@/types/customer";
import { globalToast } from "@/lib/global-toast";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const {
    customers,
    loading,
    createCustomer,
  } = useCustomers();

  const { results: searchResults, searching, searchCustomers, clearResults } = useCustomerSearch();

  // 处理搜索
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await searchCustomers(term);
    } else {
      clearResults();
    }
  };

  // 添加新客户
  const handleAddCustomer = async () => {
    const name = prompt("请输入客户姓名/企业名称:");
    if (!name) return;

    const customer_type = confirm("是企业客户吗？") ? "ENTERPRISE" : "INDIVIDUAL";
    const phone = prompt("请输入联系电话:");

    try {
      await createCustomer({
        name,
        customer_type: CustomerType[customer_type as keyof typeof CustomerType],
        phone: phone || undefined,
        source: "OTHER",
        status: "POTENTIAL",
      });

      globalToast.success("客户创建成功");
    } catch (error) {
      globalToast.error("客户创建失败");
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      "ACTIVE": "bg-green-100 text-green-800",
      "INACTIVE": "bg-gray-100 text-gray-800",
      "POTENTIAL": "bg-blue-100 text-blue-800",
      "ARCHIVED": "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labelMap = {
      "INDIVIDUAL": "个人",
      "ENTERPRISE": "企业",
      "OTHER": "其他",
    };
    return labelMap[type as keyof typeof labelMap] || type;
  };

  const getStatusLabel = (status: string) => {
    const labelMap = {
      "ACTIVE": "活跃",
      "INACTIVE": "非活跃",
      "POTENTIAL": "潜在客户",
      "ARCHIVED": "已归档",
    };
    return labelMap[status as keyof typeof labelMap] || status;
  };

  // 使用搜索结果或全部客户
  const displayCustomers = searchTerm.trim() ? searchResults : customers;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              客户档案管理与沟通记录
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddCustomer}
          >
            新建客户
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card className="p-4 mb-6 border border-gray-200">
          <div className="flex gap-3">
            <Input
              placeholder="搜索客户姓名、电话、公司名..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">全部类型</option>
              <option value="INDIVIDUAL">个人</option>
              <option value="ENTERPRISE">企业</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">全部状态</option>
              <option value="ACTIVE">活跃</option>
              <option value="POTENTIAL">潜在客户</option>
              <option value="INACTIVE">非活跃</option>
            </select>
          </div>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {customers.length}
            </div>
            <div className="text-xs text-gray-500">全部客户</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === "ACTIVE").length}
            </div>
            <div className="text-xs text-gray-500">活跃客户</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.status === "POTENTIAL").length}
            </div>
            <div className="text-xs text-gray-500">潜在客户</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.tags.includes("VIP")).length}
            </div>
            <div className="text-xs text-gray-500">VIP客户</div>
          </Card>
        </div>

        {/* 客户列表 */}
        <Card className="border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : searching ? (
            <div className="p-8 text-center text-gray-500">搜索中...</div>
          ) : displayCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "未找到匹配的客户" : "暂无客户，请点击上方按钮创建"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">客户名称</TableHead>
                  <TableHead className="text-xs font-medium">类型</TableHead>
                  <TableHead className="text-xs font-medium">联系电话</TableHead>
                  <TableHead className="text-xs font-medium">状态</TableHead>
                  <TableHead className="text-xs font-medium">标签</TableHead>
                  <TableHead className="text-xs font-medium">创建时间</TableHead>
                  <TableHead className="text-xs font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">
                      {customer.name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {getTypeLabel(customer.customer_type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {customer.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(customer.status)}`}>
                        {getStatusLabel(customer.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {customer.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{customer.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            查看详情
                          </Button>
                        </Link>
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
          共 {displayCustomers.length} 个客户
        </div>
      </div>
    </div>
  );
}