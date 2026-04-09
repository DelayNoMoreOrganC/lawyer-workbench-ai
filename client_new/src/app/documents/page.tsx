"use client";

import { useState } from "react";
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
import {
  FileText,
  Upload,
  Search,
  Folder,
  Download,
  Eye,
  Trash2,
  Tag,
} from "lucide-react";
import { globalToast } from "@/lib/global-toast";

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 模拟文档数据
  const [documents] = useState([
    {
      id: 1,
      name: "张三诉李四合同纠纷案起诉状.pdf",
      type: "pdf",
      size: "2.3MB",
      category: "起诉状",
      caseId: 1,
      caseName: "张三诉李四合同纠纷案",
      uploadDate: "2026-04-01",
      tags: ["合同纠纷", "民事"],
    },
    {
      id: 2,
      name: "证据材料 - 借条.pdf",
      type: "pdf",
      size: "1.1MB",
      category: "证据材料",
      caseId: 1,
      caseName: "张三诉李四合同纠纷案",
      uploadDate: "2026-04-02",
      tags: ["证据", "借条"],
    },
    {
      id: 3,
      name: "代理词 - 一审.docx",
      type: "docx",
      size: "856KB",
      category: "代理词",
      caseId: 1,
      caseName: "张三诉李四合同纠纷案",
      uploadDate: "2026-04-05",
      tags: ["代理词", "一审"],
    },
    {
      id: 4,
      name: "判决书 (2024)京01民终123号.pdf",
      type: "pdf",
      size: "3.2MB",
      category: "法院文书",
      caseId: 2,
      caseName: "王五诉赵六侵权纠纷案",
      uploadDate: "2026-03-28",
      tags: ["判决书", "侵权"],
    },
  ]);

  const categories = [
    { id: "all", name: "全部文档", icon: Folder },
    { id: "起诉状", name: "起诉状", icon: FileText },
    { id: "答辩状", name: "答辩状", icon: FileText },
    { id: "证据材料", name: "证据材料", icon: Folder },
    { id: "代理词", name: "代理词", icon: FileText },
    { id: "法院文书", name: "法院文书", icon: FileText },
    { id: "合同文档", name: "合同文档", icon: FileText },
  ];

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.jpg,.png";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        globalToast.success(`文件 "${file.name}" 上传成功`);
        // 实际应该调用API上传文件
      }
    };
    input.click();
  };

  const handlePreview = (doc: typeof documents[0]) => {
    alert(`预览文档: ${doc.name}\n\n(实际应用中应集成文档预览组件)`);
  };

  const handleDownload = (doc: typeof documents[0]) => {
    alert(`下载文档: ${doc.name}`);
  };

  const handleDelete = (docId: number) => {
    if (confirm("确定要删除这个文档吗？")) {
      globalToast.success("文档删除成功");
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.caseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">文档管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              案件文档上传、分类和管理
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4 mr-2" />
            上传文档
          </Button>
        </div>

        {/* 分类导航 */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors flex-shrink-0 ${
                    selectedCategory === category.id
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 搜索栏 */}
        <Card className="p-4 mb-6 border border-gray-200">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索文档名称、案件..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* 文档列表 */}
        <Card className="border border-gray-200">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无文档</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium">文档名称</TableHead>
                  <TableHead className="text-xs font-medium">分类</TableHead>
                  <TableHead className="text-xs font-medium">关联案件</TableHead>
                  <TableHead className="text-xs font-medium">大小</TableHead>
                  <TableHead className="text-xs font-medium">标签</TableHead>
                  <TableHead className="text-xs font-medium">上传时间</TableHead>
                  <TableHead className="text-xs font-medium text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.type)}
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {doc.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {doc.caseName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {doc.size}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {doc.uploadDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(doc)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
          共 {filteredDocs.length} 个文档
        </div>
      </div>
    </div>
  );
}