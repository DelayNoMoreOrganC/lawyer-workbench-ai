"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  Settings,
  Activity,
  Database,
  Lock,
  FileText,
} from "lucide-react";

export default function AdminPage() {
  const adminModules = [
    {
      title: "用户管理",
      description: "管理系统用户、角色和权限",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      href: "/admin/users",
    },
    {
      title: "权限管理",
      description: "配置角色权限和数据访问范围",
      icon: Shield,
      color: "bg-green-50 text-green-600",
      href: "/admin/permissions",
    },
    {
      title: "系统配置",
      description: "案件类型、状态流程等参数设置",
      icon: Settings,
      color: "bg-purple-50 text-purple-600",
      href: "/admin/settings",
    },
    {
      title: "操作日志",
      description: "查看用户操作记录和系统日志",
      icon: Activity,
      color: "bg-yellow-50 text-yellow-600",
      href: "/admin/logs",
    },
    {
      title: "数据备份",
      description: "数据库备份和恢复管理",
      icon: Database,
      color: "bg-indigo-50 text-indigo-600",
      href: "/admin/backup",
    },
    {
      title: "安全设置",
      description: "密码策略、登录安全等配置",
      icon: Lock,
      color: "bg-red-50 text-red-600",
      href: "/admin/security",
    },
  ];

  // 模拟系统统计数据
  const systemStats = {
    totalUsers: 15,
    activeUsers: 12,
    totalCases: 156,
    systemStatus: "正常运行",
    lastBackup: "2026-04-08 18:00",
    storageUsed: "2.3GB / 10GB",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">系统管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            用户权限、系统配置和数据管理
          </p>
        </div>

        {/* 系统状态概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card className="p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">系统用户</div>
            <div className="text-xl font-bold text-gray-900">
              {systemStats.totalUsers}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {systemStats.activeUsers}在线
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">系统状态</div>
            <div className="text-sm font-bold text-green-600 mt-1">
              {systemStats.systemStatus}
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">最后备份</div>
            <div className="text-xs text-gray-900 mt-1">
              {systemStats.lastBackup}
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">存储使用</div>
            <div className="text-sm text-gray-900 mt-1">
              {systemStats.storageUsed}
            </div>
          </Card>
        </div>

        {/* 功能模块 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">管理功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <a
                  key={module.href}
                  href={module.href}
                  className="block"
                >
                  <Card className="p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>

        {/* 快捷操作 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      添加新用户
                    </div>
                    <div className="text-xs text-gray-500">
                      创建新的系统用户账号
                    </div>
                  </div>
                </div>
                <Button size="sm">添加</Button>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      立即备份
                    </div>
                    <div className="text-xs text-gray-500">
                      手动执行数据备份
                    </div>
                  </div>
                </div>
                <Button size="sm">备份</Button>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      导出日志
                    </div>
                    <div className="text-xs text-gray-500">
                      下载操作日志记录
                    </div>
                  </div>
                </div>
                <Button size="sm">导出</Button>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      系统监控
                    </div>
                    <div className="text-xs text-gray-500">
                      查看系统运行状态
                    </div>
                  </div>
                </div>
                <Button size="sm">查看</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}