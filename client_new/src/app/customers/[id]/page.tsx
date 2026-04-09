"use client";

import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCustomer, useCustomerCaseStatistics, useCommunications, useConflictCheck } from "@/hooks/useCustomers";
import { CustomerType, CustomerStatus, CustomerTag } from "@/types/customer";
import { globalToast } from "@/lib/global-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const { customer, loading } = useCustomer(customerId);
  const { statistics } = useCustomerCaseStatistics(customerId);
  const { communications, createCommunication } = useCommunications(customerId);
  const { checkConflict } = useConflictCheck();

  const [activeTab, setActiveTab] = useState("overview");

  // 冲突检测
  const handleConflictCheck = async () => {
    if (!customer) return;

    try {
      const result = await checkConflict(customer.name, customer.id);

      if (result.has_conflict) {
        const caseList = result.conflicting_cases.map(c => `· ${c.case_name} (${c.case_type})`).join("\n");
        alert(`⚠️ 发现潜在利益冲突\n\n冲突详情: ${result.conflict_details.conflict_reason}\n\n相关案件:\n${caseList}`);
      } else {
        globalToast.success("未发现利益冲突");
      }
    } catch (error) {
      globalToast.error("冲突检测失败");
    }
  };

  // 添加沟通记录
  const handleAddCommunication = async () => {
    const type = prompt("请选择沟通类型（面谈、电话、微信、邮件、短信、其他）:");
    if (!type) return;

    const content = prompt("请输入沟通内容:");
    if (!content) return;

    const followUpRequired = confirm("是否需要后续跟进？");

    try {
      await createCommunication({
        customer_id: customerId,
        communication_type: type as any,
        communication_date: new Date().toISOString().split("T")[0],
        content,
        follow_up_required,
      });

      globalToast.success("沟通记录添加成功");
    } catch (error) {
      globalToast.error("沟通记录添加失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center text-gray-500">客户不存在</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 mb-2 flex items-center gap-1 hover:text-gray-900"
          >
            ← 返回列表
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {getTypeLabel(customer.customer_type)} · {getStatusLabel(customer.status)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleConflictCheck}>
                冲突检测
              </Button>
              <Button
                onClick={() => router.push(`/cases/new?customer_id=${customerId}`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                新建案件
              </Button>
            </div>
          </div>
        </div>

        {/* 客户基本信息 */}
        <Card className="p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600">联系电话</label>
              <div className="text-sm font-medium">{customer.phone || "-"}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">邮箱</label>
              <div className="text-sm font-medium">{customer.email || "-"}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">行业</label>
              <div className="text-sm font-medium">{customer.industry || "-"}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">客户来源</label>
              <div className="text-sm font-medium">{customer.source}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">证件号码</label>
              <div className="text-sm font-medium">{customer.id_number || "-"}</div>
            </div>
            <div>
              <label className="text-xs text-gray-600">地址</label>
              <div className="text-sm font-medium">{customer.address || "-"}</div>
            </div>
          </div>

          {customer.tags.length > 0 && (
            <div className="mt-4">
              <label className="text-xs text-gray-600">标签</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="mt-4">
              <label className="text-xs text-gray-600">备注</label>
              <div className="text-sm text-gray-700 mt-1">{customer.notes}</div>
            </div>
          )}
        </Card>

        {/* 详细信息标签页 */}
        <Card className="border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  案件统计
                </TabsTrigger>
                <TabsTrigger
                  value="communications"
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                >
                  沟通记录 ({communications.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              {statistics ? (
                <div className="space-y-6">
                  {/* 案件统计概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">总案件数</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {statistics.total_cases}
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">进行中</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {statistics.active_cases}
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">已结案</div>
                      <div className="text-2xl font-bold text-green-600">
                        {statistics.completed_cases}
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">总收费</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ¥{statistics.total_attorney_fees.toLocaleString()}
                      </div>
                    </Card>
                  </div>

                  {/* 最近案件 */}
                  {statistics.recent_cases.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">最近案件</h3>
                      <div className="space-y-3">
                        {statistics.recent_cases.map((caseItem) => (
                          <Card key={caseItem.id} className="p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{caseItem.case_name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {caseItem.case_type} · {caseItem.case_status}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/cases/${caseItem.id}`)}
                              >
                                查看详情
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">暂无案件数据</div>
              )}
            </TabsContent>

            <TabsContent value="communications" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">沟通记录</h3>
                <Button size="sm" onClick={handleAddCommunication}>
                  添加记录
                </Button>
              </div>

              {communications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  暂无沟通记录
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <Card key={comm.id} className="p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {comm.communication_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comm.communication_date).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        {comm.follow_up_required && comm.follow_up_date && (
                          <span className="text-xs text-orange-600">
                            跟进至: {new Date(comm.follow_up_date).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{comm.content}</p>
                      {comm.duration_minutes && (
                        <div className="text-xs text-gray-500 mt-2">
                          时长: {comm.duration_minutes}分钟
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}