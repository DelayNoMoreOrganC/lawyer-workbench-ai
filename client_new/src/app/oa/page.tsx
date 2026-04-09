"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Stamp,
  Megaphone,
  BookOpen,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export default function OAPage() {
  const oaModules = [
    {
      title: "用印管理",
      description: "公章、律师章使用申请和审批",
      icon: Stamp,
      color: "bg-blue-50 text-blue-600",
      href: "/oa/seal-applications",
      count: 3,
    },
    {
      title: "费用报销",
      description: "差旅费、办公费等报销申请",
      icon: FileCheck,
      color: "bg-green-50 text-green-600",
      href: "/oa/reimbursements",
      count: 5,
    },
    {
      title: "公告通知",
      description: "律所内部公告和通知",
      icon: Megaphone,
      color: "bg-yellow-50 text-yellow-600",
      href: "/oa/announcements",
      count: 12,
    },
    {
      title: "工作汇报",
      description: "周报、月报等定期汇报",
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      href: "/oa/reports",
      count: 8,
    },
    {
      title: "知识库",
      description: "模板、制度、培训资料",
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600",
      href: "/oa/knowledge",
      count: 25,
    },
    {
      title: "数据统计",
      description: "工作量、业绩等统计分析",
      icon: TrendingUp,
      color: "bg-red-50 text-red-600",
      href: "/oa/statistics",
      count: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">行政办公</h1>
          <p className="text-sm text-gray-500 mt-1">
            律所内部管理和协作平台
          </p>
        </div>

        {/* 快捷功能入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oaModules.map((module) => {
            const Icon = module.icon;
            return (
              <a
                key={module.href}
                href={module.href}
                className="block"
              >
                <Card className="p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        {module.count > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {module.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        {/* 待办事项 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">待办事项</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Stamp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      用印申请审批
                    </div>
                    <div className="text-xs text-gray-500">
                      2个待审批申请
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  处理
                </Button>
              </div>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      费用报销审批
                    </div>
                    <div className="text-xs text-gray-500">
                      1个待审批报销
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  处理
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}