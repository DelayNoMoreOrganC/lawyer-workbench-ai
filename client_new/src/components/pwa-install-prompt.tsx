"use client";

import { useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, requestInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 检查是否已经显示过安装提示
    const hasShownPrompt = localStorage.getItem("pwa_install_prompt_shown");
    if (!hasShownPrompt && isInstallable && !isInstalled) {
      // 延迟显示，避免影响首次加载体验
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const installed = await requestInstall();
    if (installed) {
      setShowPrompt(false);
      localStorage.setItem("pwa_install_prompt_shown", "true");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_install_prompt_shown", "true");
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 border-blue-200 bg-blue-50 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              安装应用
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              将智能律师工作台安装到桌面，享受更好的使用体验
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-blue-600 hover:bg-blue-700"
              >
                安装
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
              >
                暂不安装
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Card>
    </div>
  );
}

import { useState } from "react";