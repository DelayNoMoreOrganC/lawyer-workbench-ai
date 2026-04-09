"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/contexts/AuthContext";
import { globalToast } from "@/lib/global-toast";

export default function UsersManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 检查管理员权限
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            权限不足
          </div>
          <div className="text-sm text-gray-600 mb-4">
            您需要管理员权限才能访问此页面
          </div>
          <Button onClick={() => router.back()}>返回</Button>
        </Card>
      </div>
    );
  }

  // 模拟用户数据
  const [users] = useState([
    {
      id: 1,
      username: "admin",
      full_name: "系统管理员",
      email: "admin@lawfirm.com",
      role: "admin",
      is_active: true,
      created_at: "2026-01-01",
    },
    {
      id: 2,
      username: "zhang_lawyer",
      full_name: "张律师",
      email: "zhang@lawfirm.com",
      role: "lawyer",
      is_active: true,
      created_at: "2026-01-15",
    },
    {
      id: 3,
      username: "li_lawyer",
      full_name: "李律师",
      email: "li@lawfirm.com",
      role: "lawyer",
      is_active: true,
      created_at: "2026-02-01",
    },
    {
      id: 4,
      username: "wang_assistant",
      full_name: "王助理",
      email: "wang@lawfirm.com",
      role: "assistant",
      is_active: true,
      created_at: "2026-03-10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddUser = () => {
    const username = prompt("请输入用户名:");
    if (!username) return;

    const full_name = prompt("请输入姓名:");
    if (!full_name) return;

    const email = prompt("请输入邮箱:");
    if (!email) return;

    const role = confirm("是律师吗？") ? "lawyer" : "assistant";

    globalToast.success("用户创建成功");
    // 实际应该调用API创建用户
  };

  const handleToggleStatus = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const action = user.is_active ? "禁用" : "启用";
    if (confirm(`确定要${action}用户 ${user.full_name} 吗？`)) {
      globalToast.success(`用户${action}成功`);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap = {
      "admin": "管理员",
      "lawyer": "律师",
      "assistant": "助理",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap = {
      "admin": "bg-red-100 text-red-800",
      "lawyer": "bg-blue-100 text-blue-800",
      "assistant": "bg-gray-100 text-gray-800",
    };
    return colorMap[role as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 mb-2 flex items-center gap-1 hover:text-gray-900"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理系统用户和权限
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        </div>

        {/* 搜索 */}
        <Card className="p-4 mb-6 border border-gray-200">
          <Input
            placeholder="搜索用户名、姓名、邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        {/* 用户统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-xs text-gray-500">总用户数</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === "lawyer").length}
            </div>
            <div className="text-xs text-gray-500">律师</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
            <div className="text-xs text-gray-500">活跃用户</div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.is_active).length}
            </div>
            <div className="text-xs text-gray-500">禁用用户</div>
          </Card>
        </div>

        {/* 用户列表 */}
        <Card className="border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium">用户名</TableHead>
                <TableHead className="text-xs font-medium">姓名</TableHead>
                <TableHead className="text-xs font-medium">邮箱</TableHead>
                <TableHead className="text-xs font-medium">角色</TableHead>
                <TableHead className="text-xs font-medium">状态</TableHead>
                <TableHead className="text-xs font-medium">创建时间</TableHead>
                <TableHead className="text-xs font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-sm font-medium">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-sm">{user.full_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.is_active ? "活跃" : "禁用"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.created_at}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.is_active ? "禁用" : "启用"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}