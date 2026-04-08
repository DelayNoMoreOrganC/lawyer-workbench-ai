"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DocumentUploadProps {
  onExtractedData: (data: any) => void;
  disabled?: boolean;
}

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  fileName: string;
  progress: number;
}

export function DocumentUpload({ onExtractedData, disabled }: DocumentUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    fileName: "",
    progress: 0,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploadState.isUploading) {
      setUploadState((prev) => ({ ...prev, isDragging: true }));
    }
  }, [disabled, uploadState.isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState((prev) => ({ ...prev, isDragging: false }));

    if (disabled || uploadState.isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [disabled, uploadState.isUploading]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    // 验证文件类型
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError("不支持的文件格式。请上传PDF或图片文件（JPG、PNG等）");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // 开始上传
    setUploadState({
      isDragging: false,
      isUploading: true,
      fileName: file.name,
      progress: 0,
    });
    setError("");
    setSuccess(false);

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append("file", file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadState((prev) => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);

      // 发送到后端API
      const response = await fetch("http://localhost:5000/api/v2/ai/extract-summons", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      console.log("API响应状态:", response.status);

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API响应结果:", result);

      setUploadState((prev) => ({ ...prev, progress: 100, isUploading: false }));
      setSuccess(true);

      // 调用回调函数，将解析的数据传递给父组件
      if (result.success && result.extracted_data) {
        console.log("调用回调函数，数据:", result.extracted_data);
        await onExtractedData(result.extracted_data);

        // 3秒后重置成功状态
        setTimeout(() => {
          setSuccess(false);
          setUploadState((prev) => ({ ...prev, fileName: "", progress: 0 }));
        }, 3000);
      } else {
        throw new Error("AI识别失败，未返回有效数据");
      }

    } catch (err) {
      setUploadState((prev) => ({ ...prev, isUploading: false, progress: 0 }));
      setError(err instanceof Error ? err.message : "上传失败，请重试");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <Card
      className={`border-2 transition-all duration-200 ${
        uploadState.isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-dashed border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-8 text-center">
        {/* 图标区域 */}
        <div className="flex justify-center mb-4">
          {uploadState.isUploading ? (
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {uploadState.progress}%
                </span>
              </div>
            </div>
          ) : success ? (
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">✓</span>
            </div>
          ) : (
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-lg">↑</span>
            </div>
          )}
        </div>

        {/* 文本区域 */}
        {uploadState.isUploading ? (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              正在处理文档...
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {uploadState.fileName}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          </div>
        ) : success ? (
          <div>
            <h3 className="text-base font-semibold text-green-900 mb-2">
              识别成功
            </h3>
            <p className="text-sm text-green-700">
              案件信息已自动填充
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              拖拽文件到此处
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              支持PDF、JPG、PNG等格式
            </p>

            <div className="flex justify-center">
              <input
                ref={(input) => {
                  // 存储input引用以便后续使用
                  (window as any).fileInput = input;
                }}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp"
                onChange={handleFileSelect}
                disabled={disabled || uploadState.isUploading}
                id="file-upload-input"
              />
              <Button
                type="button"
                disabled={disabled || uploadState.isUploading}
                size="sm"
                variant="outline"
                onClick={() => {
                  const input = document.getElementById('file-upload-input') as HTMLInputElement;
                  if (input) {
                    input.click();
                  }
                }}
              >
                选择文件
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}