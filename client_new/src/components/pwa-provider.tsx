"use client";

import { useEffect, ReactNode } from "react";
import { usePWA } from "@/hooks/usePWA";

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const { registerServiceWorker, isOnline } = usePWA();

  useEffect(() => {
    // 注册Service Worker
    registerServiceWorker();

    // 检查PWA支持情况
    if (process.env.NODE_ENV === "development") {
      console.log("[PWA] 环境检查");
    }
  }, [registerServiceWorker]);

  // 显示离线状态
  useEffect(() => {
    if (!isOnline) {
      console.warn("[PWA] 当前处于离线状态");
    }
  }, [isOnline]);

  return <>{children}</>;
}