import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 检查应用是否已安装
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    // 监听应用安装事件
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      console.log("[PWA] 应用可以被安装");
    };

    // 监听应用安装完成事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] 应用已安装");
    };

    // 监听网络状态
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[PWA] 网络已连接");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[PWA] 网络已断开");
    };

    // 初始化检查
    checkInstalled();

    // 添加事件监听器
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 请求安装应用
  const requestInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn("[PWA] 无法安装：没有可用的安装提示");
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("[PWA] 用户接受了安装提示");
      } else {
        console.log("[PWA] 用户拒绝了安装提示");
      }

      setDeferredPrompt(null);
      setIsInstallable(false);

      return outcome === "accepted";
    } catch (error) {
      console.error("[PWA] 安装失败:", error);
      return false;
    }
  }, [deferredPrompt]);

  // 注册Service Worker
  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[PWA] Service Worker注册成功:", registration);

        // 监听Service Worker更新
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] 发现新版本");
                // 可以在这里通知用户有新版本可用
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error("[PWA] Service Worker注册失败:", error);
        return null;
      }
    }

    console.warn("[PWA] 浏览器不支持Service Worker");
    return null;
  }, []);

  // 清除应用缓存
  const clearCache = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // 发送消息给Service Worker清除缓存
          registration.active?.postMessage({ type: "CLEAR_CACHE" });

          // 也可以直接清除缓存
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));

          console.log("[PWA] 缓存已清除");
          return true;
        }
      } catch (error) {
        console.error("[PWA] 清除缓存失败:", error);
        return false;
      }
    }
    return false;
  }, []);

  // 请求通知权限
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      console.log("[PWA] 通知权限:", permission);
      return permission === "granted";
    }
    return false;
  }, []);

  // 显示通知
  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          // 如果有Service Worker，使用Service Worker显示通知
          if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, options);
          } else {
            // 否则使用普通通知
            new Notification(title, options);
          }
          return true;
        } catch (error) {
          console.error("[PWA] 显示通知失败:", error);
          return false;
        }
      } else {
        console.warn("[PWA] 通知权限未授予");
        return false;
      }
    },
    []
  );

  return {
    isInstallable,
    isInstalled,
    isOnline,
    requestInstall,
    registerServiceWorker,
    clearCache,
    requestNotificationPermission,
    showNotification,
  };
}

// 检查PWA支持情况
export function checkPWASupport() {
  const support = {
    serviceWorker: "serviceWorker" in navigator,
    manifest: "onbeforeinstallprompt" in window,
    notifications: "Notification" in window,
    pushManager: "serviceWorker" in navigator && "pushManager" in ServiceWorkerRegistration.prototype,
    storage: "indexedDB" in window,
    share: "share" in navigator,
  };

  console.log("[PWA] 支持情况:", support);
  return support;
}

// 检测运行环境
export function detectEnvironment() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isPWA: isStandalone || (document.referrer.includes("android-app://")),
  };
}