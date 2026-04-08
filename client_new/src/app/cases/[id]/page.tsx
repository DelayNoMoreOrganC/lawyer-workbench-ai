"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/document-upload";

export default function SimpleCasePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [formData, setFormData] = useState({
    case_name: "",
    case_type: "民事",
    case_status: "draft",
    court_name: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (caseId !== "new") {
      fetchCaseData();
    }
  }, [caseId]);

  const fetchCaseData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v2/cases/${caseId}`);
      if (response.ok) {
        const caseData = await response.json();
        setFormData({
          case_name: caseData.case_name || "",
          case_type: caseData.case_type || "民事",
          case_status: caseData.case_status || "draft",
          court_name: caseData.court_name || "",
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

  const handleSaveCase = async () => {
    if (!formData.case_name.trim()) {
      alert("请输入案件名称");
      return;
    }

    try {
      const isEditing = caseId !== "new";
      const url = isEditing
        ? `http://localhost:5000/api/v2/cases/${caseId}`
        : "http://localhost:5000/api/v2/cases/";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 mb-4 block"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {caseId === "new" ? "新建案件" : "编辑案件"}
          </h1>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载案件信息中...</p>
          </Card>
        ) : (
          <>
        {/* AI上传区域 - 测试 */}
        <Card className="p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">AI文档识别</h2>
          <p className="text-sm text-gray-600 mb-4">
            拖拽PDF或图片文件，AI将自动识别并填充案件信息
          </p>
          <DocumentUpload
            onExtractedData={handleExtractedData}
            disabled={false}
          />
        </Card>

        {/* 案件信息表单 */}
        <Card className="p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">案件信息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                案件名称
              </label>
              <input
                type="text"
                value={formData.case_name}
                onChange={(e) => setFormData({...formData, case_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入案件名称"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件类型
                </label>
                <select
                  value={formData.case_type}
                  onChange={(e) => setFormData({...formData, case_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>民事</option>
                  <option>刑事</option>
                  <option>行政</option>
                  <option>执行</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件状态
                </label>
                <select
                  value={formData.case_status}
                  onChange={(e) => setFormData({...formData, case_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">起草中</option>
                  <option value="pending_filing">待立案</option>
                  <option value="first_trial">一审审理中</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                法院名称
              </label>
              <input
                type="text"
                value={formData.court_name}
                onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="请输入法院名称"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveCase}>
              保存案件
            </Button>
          </div>
        </Card>
        </>
        )}
      </div>
    </div>
  );
}
