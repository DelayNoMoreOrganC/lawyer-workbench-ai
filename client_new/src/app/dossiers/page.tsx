"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Dossier {
  id: number;
  case_id: number;
  file_name: string;
  file_type: string;
  file_format: string;
  file_size: number;
  upload_date: string;
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("全部");
  const [uploading, setUploading] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState("其他");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v2/dossiers/");
      const data = await response.json();
      setDossiers(data.dossiers || []);
    } catch (error) {
      console.error("获取文件列表失败:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", selectedFileType);

      const response = await fetch("http://localhost:5000/api/v2/dossiers/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("文件上传成功！");
        fetchDossiers();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json();
        alert(`上传失败: ${errorData.detail || "未知错误"}`);
      }
    } catch (error) {
      console.error("上传文件异常:", error);
      alert(`上传失败: ${error instanceof Error ? error.message : "网络错误"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDossier = async (dossierId: number) => {
    if (!confirm("确定要删除这个文件吗？")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v2/dossiers/${dossierId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("文件删除成功！");
        fetchDossiers();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("删除文件异常:", error);
      alert("删除失败");
    }
  };

  const filteredDossiers = dossiers.filter((dossier) => {
    if (filterType !== "全部" && dossier.file_type !== filterType)
      return false;
    if (searchTerm && !dossier.file_name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const getFileTypeColor = (fileType: string) => {
    const colors: { [key: string]: string } = {
      "起诉状": "bg-red-100 text-red-700 border-red-200",
      "判决书": "bg-blue-100 text-blue-700 border-blue-200",
      "证据": "bg-green-100 text-green-700 border-green-200",
      "其他": "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[fileType] || colors["其他"];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            文件检索
          </h1>
          <p className="text-sm text-gray-600">
            智能检索和管理所有案件文档
          </p>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="mb-6 p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索文件名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option>全部类型</option>
                <option>起诉状</option>
                <option>判决书</option>
                <option>调解书</option>
                <option>证据</option>
              </select>
              <select
                className="text-sm border border-gray-300 rounded-md px-3 py-2"
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
              >
                <option value="其他">其他</option>
                <option value="起诉状">起诉状</option>
                <option value="判决书">判决书</option>
                <option value="调解书">调解书</option>
                <option value="证据">证据</option>
                <option value="答辩状">答辩状</option>
                <option value="代理词">代理词</option>
              </select>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "上传中..." : "上传文件"}
              </Button>
            </div>
          </div>

          {/* AI搜索区域 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              AI智能检索
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              上传文档图片或输入关键词，AI将自动识别和检索相关文件
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="输入关键词进行AI检索..."
                className="flex-1"
              />
              <Button size="sm">AI检索</Button>
            </div>
          </div>
        </Card>

        {/* 文件列表 */}
        <Card className="border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    文件名
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    类型
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    格式
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    大小
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    上传时间
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDossiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                      暂无文件数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDossiers.map((dossier) => (
                    <TableRow
                      key={dossier.id}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <TableCell className="text-sm text-gray-900">
                        {dossier.file_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getFileTypeColor(
                            dossier.file_type
                          )}`}
                        >
                          {dossier.file_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {dossier.file_format}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatFileSize(dossier.file_size)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(dossier.upload_date).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            查看
                          </Button>
                          <Button variant="ghost" size="sm">
                            下载
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteDossier(dossier.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
