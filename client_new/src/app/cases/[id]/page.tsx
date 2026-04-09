"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/document-upload";
import { CaseStatusStepper } from "@/components/case-status-stepper";
import { CaseTemplates } from "@/components/case-templates";
import { CaseFinanceManager } from "@/components/case-finance-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

export default function SimpleCasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [formData, setFormData] = useState({
    case_name: "",
    case_type: "民事",
    case_status: "draft",
    court_name: "",
    judge_name: "",
    plaintiff: "",
    defendant: "",
    case_amount: "",
    filing_date: "",
    hearing_date: "",
    case_brief: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(caseId === "new");
  const [activeTab, setActiveTab] = useState("basic");
  const { user } = useAuth();

  useEffect(() => {
    if (caseId !== "new") {
      fetchCaseData();
    }
  }, [caseId]);

  const fetchCaseData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:5000/api/v2/cases/${caseId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const caseData = await response.json();
        setFormData({
          case_name: caseData.case_name || "",
          case_type: caseData.case_type || "民事",
          case_status: caseData.case_status || "draft",
          court_name: caseData.court_name || "",
          judge_name: caseData.judge_name || "",
          plaintiff: caseData.plaintiff || "",
          defendant: caseData.defendant || "",
          case_amount: caseData.case_amount?.toString() || "",
          filing_date: caseData.filing_date ? caseData.filing_date.split('T')[0] : "",
          hearing_date: caseData.hearing_date ? caseData.hearing_date.split('T')[0] : "",
          case_brief: caseData.case_brief || "",
        });
      } else {
        alert("获取案件信息失败");
        router.back();
      }
    } catch (error) {
      console.error("获取案件信息异常:", error);
      alert("获取案件信息失败");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractedData = async (extractedData: any) => {
    console.log("收到AI识别数据:", extractedData);
    setFormData(extractedData);
    alert("AI识别成功！案件信息已自动填充");
  };

  const handleTemplateSelect = (template: any) => {
    console.log("选择模板:", template);
    setFormData({
      ...formData,
      ...template.defaultData
    });
    setShowTemplates(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`确定要将案件状态更改为 "${newStatus}"吗？`)) {
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = caseId !== "new"
        ? `http://localhost:5000/api/v2/cases/${caseId}`
        : "http://localhost:5000/api/v2/cases/";

      const method = caseId !== "new" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          case_status: newStatus
        }),
      });

      if (response.ok) {
        const savedCase = await response.json();
        setFormData({ ...formData, case_status: newStatus });
        alert("案件状态更新成功！");
      } else {
        const errorData = await response.json();
        alert(`状态更新失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("更新状态异常:", error);
      alert(`状态更新失败: ${error instanceof Error ? error.message : "网络错误"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCase = async () => {
    if (!formData.case_name.trim()) {
      alert("请输入案件名称");
      return;
    }

    setIsSaving(true);
    try {
      const isEditing = caseId !== "new";
      const url = isEditing
        ? `http://localhost:5000/api/v2/cases/${caseId}`
        : "http://localhost:5000/api/v2/cases/";
      const method = isEditing ? "PUT" : "POST";
      const token = localStorage.getItem("access_token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedCase = await response.json();
        alert(isEditing ? "案件更新成功！" : "案件创建成功！");
        router.push("/cases");
      } else {
        const errorData = await response.json();
        alert(`保存失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("保存案件异常:", error);
      alert(`保存失败: ${error instanceof Error ? error.message : "网络错误"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 mb-2 flex items-center gap-1 hover:text-gray-900"
          >
            ← 返回列表
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {caseId === "new" ? "新建案件" : "编辑案件"}
          </h1>
        </div>

        {isLoading ? (
          <Card className="p-8 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">加载中...</p>
          </Card>
        ) : showTemplates ? (
          <Card className="p-6 border border-gray-200 bg-white">
            <CaseTemplates onSelectTemplate={handleTemplateSelect} />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowTemplates(false)}
              >
                跳过，手动填写
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* 案件状态 */}
            <Card className="p-4 mb-4 border border-gray-200 bg-white">
              <CaseStatusStepper
                currentStatus={formData.case_status}
                onStatusChange={handleStatusChange}
                readOnly={false}
              />
            </Card>

            {/* AI文档识别 */}
            <Card className="p-4 mb-4 border border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">AI文档识别</h2>
                <span className="text-xs text-gray-400">可选</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                上传PDF或图片文件，系统将自动识别并填充案件信息
              </p>
              <DocumentUpload
                onExtractedData={handleExtractedData}
                disabled={false}
              />
            </Card>

            {/* 案件信息标签页 */}
            <Card className="border border-gray-200 bg-white">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200">
                  <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                      value="basic"
                      className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                    >
                      基本信息
                    </TabsTrigger>
                    {caseId !== "new" && (
                      <TabsTrigger
                        value="finance"
                        className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                      >
                        财务管理
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <TabsContent value="basic" className="p-4">
              <h2 className="text-sm font-semibold mb-4">基本信息</h2>

              <div className="space-y-4">
                {/* 案件名称 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    案件名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.case_name}
                    onChange={(e) => setFormData({...formData, case_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入案件名称"
                  />
                </div>

                {/* 案件类型和状态 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      案件类型
                    </label>
                    <select
                      value={formData.case_type}
                      onChange={(e) => setFormData({...formData, case_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>民事</option>
                      <option>刑事</option>
                      <option>行政</option>
                      <option>执行</option>
                    </select>
                  </div>
                </div>

                {/* 法院和法官 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      法院名称
                    </label>
                    <input
                      type="text"
                      value={formData.court_name}
                      onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入法院名称"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      承办法官
                    </label>
                    <input
                      type="text"
                      value={formData.judge_name}
                      onChange={(e) => setFormData({...formData, judge_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入法官姓名"
                    />
                  </div>
                </div>

                {/* 案件金额 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    案件金额
                  </label>
                  <input
                    type="text"
                    value={formData.case_amount}
                    onChange={(e) => setFormData({...formData, case_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入案件金额"
                  />
                </div>

                {/* 重要日期 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      立案日期
                    </label>
                    <input
                      type="date"
                      value={formData.filing_date}
                      onChange={(e) => setFormData({...formData, filing_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      开庭日期
                    </label>
                    <input
                      type="date"
                      value={formData.hearing_date}
                      onChange={(e) => setFormData({...formData, hearing_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 当事人信息 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    原告信息
                  </label>
                  <textarea
                    value={formData.plaintiff}
                    onChange={(e) => setFormData({...formData, plaintiff: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="请输入原告信息"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    被告信息
                  </label>
                  <textarea
                    value={formData.defendant}
                    onChange={(e) => setFormData({...formData, defendant: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="请输入被告信息"
                  />
                </div>

                {/* 案件简介 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    案件简介
                  </label>
                  <textarea
                    value={formData.case_brief}
                    onChange={(e) => setFormData({...formData, case_brief: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="请输入案件简介"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => router.back()}>
                  取消
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveCase}
                  disabled={isSaving}
                >
                  {isSaving ? "保存中..." : "保存案件"}
                </Button>
              </div>
                </TabsContent>

                {caseId !== "new" && (
                  <TabsContent value="finance" className="p-4">
                    <CaseFinanceManager
                      caseId={parseInt(caseId)}
                      caseName={formData.case_name}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
