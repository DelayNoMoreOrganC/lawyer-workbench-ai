"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFinance, useCaseFinanceSummary, useCreateExpense, useCreatePayment } from "@/hooks/useFinance";
import { ExpenseType, ExpenseStatus, AttorneyFeeStatus } from "@/types/finance";
import { globalToast } from "@/lib/global-toast";

interface CaseFinanceManagerProps {
  caseId: number;
  caseName: string;
}

export function CaseFinanceManager({ caseId, caseName }: CaseFinanceManagerProps) {
  const {
    expenses,
    attorneyFees,
    payments,
    loading,
    refetch,
  } = useFinance(caseId);

  const { summary } = useCaseFinanceSummary(caseId);
  const { createExpense } = useCreateExpense();
  const { createPayment } = useCreatePayment();

  const [activeTab, setActiveTab] = useState("overview");

  // 添加费用的处理函数
  const handleAddExpense = async () => {
    const expense_type = prompt("请输入费用类型（诉讼费、保全费、差旅费等）:");
    if (!expense_type) return;

    const amount = prompt("请输入金额:");
    if (!amount) return;

    const description = prompt("请输入费用说明:");
    if (!description) return;

    try {
      await createExpense({
        case_id: caseId,
        expense_type,
        amount: parseFloat(amount),
        description,
      });

      globalToast.success("费用添加成功");
      refetch();
    } catch (error) {
      globalToast.error("费用添加失败");
    }
  };

  // 添加收款的处理函数
  const handleAddPayment = async () => {
    if (attorneyFees.length === 0) {
      globalToast.error("请先设置律师费信息");
      return;
    }

    const amount = prompt("请输入收款金额:");
    if (!amount) return;

    const payment_method = prompt("请输入收款方式（现金、转账、支票、其他）:");
    if (!payment_method) return;

    const payer = prompt("请输入付款人:");
    if (!payer) return;

    try {
      await createPayment({
        case_id: caseId,
        attorney_fee_id: attorneyFees[0].id,
        amount: parseFloat(amount),
        payment_date: new Date().toISOString().split("T")[0],
        payment_method,
        payer,
      });

      globalToast.success("收款记录添加成功");
      refetch();
    } catch (error) {
      globalToast.error("收款记录添加失败");
    }
  };

  const getExpenseStatusColor = (status: ExpenseStatus) => {
    const colorMap = {
      [ExpenseStatus.PENDING]: "bg-yellow-100 text-yellow-800",
      [ExpenseStatus.APPROVED]: "bg-blue-100 text-blue-800",
      [ExpenseStatus.REJECTED]: "bg-red-100 text-red-800",
      [ExpenseStatus.PAID]: "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getAttorneyFeeStatusColor = (status: AttorneyFeeStatus) => {
    const colorMap = {
      [AttorneyFeeStatus.UNPAID]: "bg-red-100 text-red-800",
      [AttorneyFeeStatus.PARTIAL]: "bg-yellow-100 text-yellow-800",
      [AttorneyFeeStatus.PAID]: "bg-green-100 text-green-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">加载中...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 财务统计概览 */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">总收入</div>
            <div className="text-2xl font-bold text-gray-900">
              ¥{summary.total_attorney_fees.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">已收款</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{summary.paid_attorney_fees.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">总支出</div>
            <div className="text-2xl font-bold text-red-600">
              ¥{summary.total_expenses.toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">利润</div>
            <div className={`text-2xl font-bold ${summary.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ¥{summary.profit.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              利润率: {summary.profit_margin.toFixed(1)}%
            </div>
          </Card>
        </div>
      )}

      {/* 详细财务信息 */}
      <Card className="border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                财务概览
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                费用记录 ({expenses.length})
              </TabsTrigger>
              <TabsTrigger
                value="attorney-fees"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                律师费 ({attorneyFees.length})
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                收款记录 ({payments.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-4">
            <div className="space-y-6">
              {/* 律师费信息 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">律师费信息</h3>
                {attorneyFees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                    暂无律师费信息
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attorneyFees.map((fee) => (
                      <Card key={fee.id} className="p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              总额: ¥{fee.total_amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              收费方式: {fee.billing_type}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAttorneyFeeStatusColor(fee.status)}`}>
                            {fee.status === "UNPAID" ? "未收款" : fee.status === "PARTIAL" ? "部分收款" : "已收款"}
                          </div>
                        </div>
                        {fee.status !== AttorneyFeeStatus.PAID && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-600 mb-2">
                              待收金额: ¥{(fee.total_amount - fee.paid_amount).toLocaleString()}
                            </div>
                            <Button size="sm" onClick={handleAddPayment}>
                              添加收款
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* 费用统计 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">费用统计</h3>
                {summary && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(summary.expense_breakdown).map(([type, amount]) =>
                      amount > 0 ? (
                        <Card key={type} className="p-3 border border-gray-200">
                          <div className="text-xs text-gray-600">{type}</div>
                          <div className="text-sm font-semibold text-gray-900">
                            ¥{amount.toLocaleString()}
                          </div>
                        </Card>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">费用记录</h3>
              <Button size="sm" onClick={handleAddExpense}>
                添加费用
              </Button>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                暂无费用记录
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium">费用类型</TableHead>
                    <TableHead className="text-xs font-medium">金额</TableHead>
                    <TableHead className="text-xs font-medium">说明</TableHead>
                    <TableHead className="text-xs font-medium">状态</TableHead>
                    <TableHead className="text-xs font-medium">日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm">{expense.expense_type}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ¥{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{expense.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getExpenseStatusColor(expense.status)}`}>
                          {expense.status === "PENDING" ? "待审批" : expense.status === "APPROVED" ? "已批准" : expense.status === "REJECTED" ? "已拒绝" : "已支付"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(expense.apply_date).toLocaleDateString("zh-CN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="attorney-fees" className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">律师费详情</h3>
            {attorneyFees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                暂无律师费信息
              </div>
            ) : (
              <div className="space-y-4">
                {attorneyFees.map((fee) => (
                  <Card key={fee.id} className="p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            总额: ¥{fee.total_amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            收费方式: {fee.billing_type}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAttorneyFeeStatusColor(fee.status)}`}>
                          {fee.status === "UNPAID" ? "未收款" : fee.status === "PARTIAL" ? "部分收款" : "已收款"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">已收款:</span>
                          <span className="ml-2 font-medium text-green-600">
                            ¥{fee.paid_amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">待收款:</span>
                          <span className="ml-2 font-medium text-red-600">
                            ¥{(fee.total_amount - fee.paid_amount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {fee.contingency_percentage && (
                        <div className="text-xs text-gray-600">
                          风险代理比例: {fee.contingency_percentage}%
                        </div>
                      )}

                      {fee.hourly_rate && fee.billable_hours && (
                        <div className="text-xs text-gray-600">
                          计费: ¥{fee.hourly_rate}/小时 × {fee.billable_hours}小时
                        </div>
                      )}

                      {fee.contract_date && (
                        <div className="text-xs text-gray-600">
                          合同日期: {new Date(fee.contract_date).toLocaleDateString("zh-CN")}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">收款记录</h3>
              <Button size="sm" onClick={handleAddPayment}>
                添加收款
              </Button>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                暂无收款记录
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium">收款日期</TableHead>
                    <TableHead className="text-xs font-medium">金额</TableHead>
                    <TableHead className="text-xs font-medium">付款人</TableHead>
                    <TableHead className="text-xs font-medium">收款方式</TableHead>
                    <TableHead className="text-xs font-medium">发票号</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {new Date(payment.payment_date).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-600">
                        +¥{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{payment.payer}</TableCell>
                      <TableCell className="text-sm">{payment.payment_method}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.invoice_number || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}