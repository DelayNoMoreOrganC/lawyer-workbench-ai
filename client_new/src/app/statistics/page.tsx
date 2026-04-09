"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, DollarSign, FileText } from "lucide-react";

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [loading, setLoading] = useState(false);

  // 模拟统计数据（实际应从API获取）
  const caseStatistics = {
    total: 156,
    new: 23,
    active: 89,
    completed: 44,
    civil: 78,
    criminal: 34,
    administrative: 18,
    execution: 26,
    monthlyTrend: [
      { month: "1月", count: 12 },
      { month: "2月", count: 15 },
      { month: "3月", count: 18 },
      { month: "4月", count: 22 },
      { month: "5月", count: 20 },
      { month: "6月", count: 23 },
    ],
  };

  const feeStatistics = {
    totalFees: 2850000,
    collectedFees: 2120000,
    pendingFees: 730000,
    collectionRate: 74.4,
    monthlyTrend: [
      { month: "1月", amount: 320000 },
      { month: "2月", amount: 410000 },
      { month: "3月", amount: 380000 },
      { month: "4月", amount: 450000 },
      { month: "5月", amount: 390000 },
      { month: "6月", amount: 570000 },
    ],
  };

  const lawyerPerformance = [
    { id: 1, name: "张律师", cases: 28, fees: 680000, completionRate: 85.7 },
    { id: 2, name: "李律师", cases: 24, fees: 520000, completionRate: 83.3 },
    { id: 3, name: "王律师", cases: 32, fees: 750000, completionRate: 87.5 },
    { id: 4, name: "赵律师", cases: 19, fees: 410000, completionRate: 78.9 },
    { id: 5, name: "刘律师", cases: 22, fees: 490000, completionRate: 81.8 },
  ];

  const handleExport = (type: string) => {
    alert(`导出${type}报表`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
            <p className="text-sm text-gray-500 mt-1">
              案件、收费、业绩多维度统计分析
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年度</option>
              <option value="custom">自定义</option>
            </select>
            <Button
              variant="outline"
              onClick={() => handleExport("综合报表")}
            >
              导出报表
            </Button>
          </div>
        </div>

        {/* 统计概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {caseStatistics.total}
                </div>
                <div className="text-xs text-gray-500">总案件数</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥{(feeStatistics.totalFees / 10000).toFixed(0)}万
                </div>
                <div className="text-xs text-gray-500">总收费额</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {feeStatistics.collectionRate}%
                </div>
                <div className="text-xs text-gray-500">收款率</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {caseStatistics.new}
                </div>
                <div className="text-xs text-gray-500">本月新增</div>
              </div>
            </div>
          </Card>
        </div>

        {/* 详细统计标签页 */}
        <Card className="border border-gray-200">
          <Tabs defaultValue="cases" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="cases"
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  案件统计
                </TabsTrigger>
                <TabsTrigger
                  value="fees"
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  收费统计
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  律师业绩
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cases" className="p-6">
              <div className="space-y-6">
                {/* 案件类型分布 */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">案件类型分布</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">民事案件</div>
                      <div className="text-xl font-bold text-gray-900">
                        {caseStatistics.civil}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((caseStatistics.civil / caseStatistics.total) * 100).toFixed(1)}%
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">刑事案件</div>
                      <div className="text-xl font-bold text-gray-900">
                        {caseStatistics.criminal}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((caseStatistics.criminal / caseStatistics.total) * 100).toFixed(1)}%
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">行政案件</div>
                      <div className="text-xl font-bold text-gray-900">
                        {caseStatistics.administrative}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((caseStatistics.administrative / caseStatistics.total) * 100).toFixed(1)}%
                      </div>
                    </Card>

                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">执行案件</div>
                      <div className="text-xl font-bold text-gray-900">
                        {caseStatistics.execution}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((caseStatistics.execution / caseStatistics.total) * 100).toFixed(1)}%
                      </div>
                    </Card>
                  </div>
                </div>

                {/* 案件状态分布 */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">案件状态分布</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 border border-blue-200 bg-blue-50">
                      <div className="text-xs text-blue-600 mb-1">进行中</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {caseStatistics.active}
                      </div>
                    </Card>

                    <Card className="p-4 border border-green-200 bg-green-50">
                      <div className="text-xs text-green-600 mb-1">已结案</div>
                      <div className="text-2xl font-bold text-green-700">
                        {caseStatistics.completed}
                      </div>
                    </Card>

                    <Card className="p-4 border border-yellow-200 bg-yellow-50">
                      <div className="text-xs text-yellow-600 mb-1">本月新增</div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {caseStatistics.new}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* 月度趋势 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">月度趋势</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport("案件统计")}
                    >
                      导出案件报表
                    </Button>
                  </div>
                  <Card className="p-4 border border-gray-200">
                    <div className="space-y-2">
                      {caseStatistics.monthlyTrend.map((item) => (
                        <div
                          key={item.month}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm text-gray-600">{item.month}</div>
                          <div className="flex items-center gap-4">
                            <div className="w-48 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / Math.max(...caseStatistics.monthlyTrend.map(t => t.count))) * 100}%`,
                                }}
                              />
                            </div>
                            <div className="text-sm font-medium w-8 text-right">
                              {item.count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="p-6">
              <div className="space-y-6">
                {/* 收费概览 */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">总收费额</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ¥{(feeStatistics.totalFees / 10000).toFixed(0)}万
                    </div>
                  </Card>

                  <Card className="p-4 border border-green-200 bg-green-50">
                    <div className="text-xs text-green-600 mb-1">已收款</div>
                    <div className="text-2xl font-bold text-green-700">
                      ¥{(feeStatistics.collectedFees / 10000).toFixed(0)}万
                    </div>
                  </Card>

                  <Card className="p-4 border border-red-200 bg-red-50">
                    <div className="text-xs text-red-600 mb-1">待收款</div>
                    <div className="text-2xl font-bold text-red-700">
                      ¥{(feeStatistics.pendingFees / 10000).toFixed(0)}万
                    </div>
                  </Card>
                </div>

                {/* 月度收费趋势 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">月度收费趋势</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport("收费统计")}
                    >
                      导出收费报表
                    </Button>
                  </div>
                  <Card className="p-4 border border-gray-200">
                    <div className="space-y-2">
                      {feeStatistics.monthlyTrend.map((item) => (
                        <div
                          key={item.month}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm text-gray-600">{item.month}</div>
                          <div className="flex items-center gap-4">
                            <div className="w-48 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.amount / Math.max(...feeStatistics.monthlyTrend.map(t => t.amount))) * 100}%`,
                                }}
                              />
                            </div>
                            <div className="text-sm font-medium w-16 text-right">
                              ¥{(item.amount / 10000).toFixed(1)}万
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">律师业绩排名</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("律师业绩")}
                  >
                    导出业绩报表
                  </Button>
                </div>

                <div className="space-y-3">
                  {lawyerPerformance.map((lawyer, index) => (
                    <Card key={lawyer.id} className="p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                ? "bg-gray-100 text-gray-700"
                                : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{lawyer.name}</div>
                            <div className="text-xs text-gray-500">
                              {lawyer.cases}个案件
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              ¥{(lawyer.fees / 10000).toFixed(1)}万
                            </div>
                            <div className="text-xs text-gray-500">收费额</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {lawyer.completionRate}%
                            </div>
                            <div className="text-xs text-gray-500">结案率</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}