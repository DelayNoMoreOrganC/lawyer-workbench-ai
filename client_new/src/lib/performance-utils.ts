// 性能监控和优化工具
import { useEffect, useRef } from "react";

// 性能监控Hook
export function usePerformanceMonitor(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === "development"
) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const now = Date.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // 如果渲染时间超过阈值，发出警告
    if (renderTime > 100) {
      console.warn(
        `[性能警告] ${componentName} 组件渲染耗时 ${renderTime}ms，已渲染 ${renderCount.current} 次`
      );
    } else if (renderTime > 16) {
      console.info(
        `[性能信息] ${componentName} 组件渲染耗时 ${renderTime}ms，已渲染 ${renderCount.current} 次`
      );
    }
  });
}

// 防抖Hook
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );
}

// 节流Hook
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        func(...args);
        lastRun.current = now;
      }
    },
    [func, delay]
  );
}

// 内存使用监控
export function useMemoryMonitor(enabled: boolean = process.env.NODE_ENV === "development") {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const checkMemory = () => {
      // @ts-ignore - performance.memory 是Chrome特有的API
      if (performance.memory) {
        // @ts-ignore
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;

        if (usagePercent > 80) {
          console.warn(
            `[内存警告] JS堆内存使用率 ${usagePercent.toFixed(2)}% (${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB)`
          );
        } else if (usagePercent > 60) {
          console.info(
            `[内存信息] JS堆内存使用率 ${usagePercent.toFixed(2)}% (${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB)`
          );
        }
      }
    };

    // 每分钟检查一次内存使用情况
    const interval = setInterval(checkMemory, 60000);

    return () => clearInterval(interval);
  }, [enabled]);
}

// 网络请求监控
export function useNetworkMonitor() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState<string>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      console.log("网络已连接");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.warn("网络已断开");
    };

    const handleConnectionChange = () => {
      // @ts-ignore - connection API 可能不存在
      if (navigator.connection) {
        // @ts-ignore
        setNetworkType(navigator.connection.effectiveType || "unknown");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // @ts-ignore
    if (navigator.connection) {
      // @ts-ignore
      navigator.connection.addEventListener("change", handleConnectionChange);
      handleConnectionChange();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.removeEventListener("change", handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, networkType };
}

// FPS监控
export function useFPSMonitor(enabled: boolean = process.env.NODE_ENV === "development") {
  const fpsRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        fpsRef.current = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (fpsRef.current < 30) {
          console.warn(`[FPS警告] 当前FPS: ${fpsRef.current}`);
        } else if (fpsRef.current < 50) {
          console.info(`[FPS信息] 当前FPS: ${fpsRef.current}`);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    const animationFrameId = requestAnimationFrame(updateFPS);

    return () => cancelAnimationFrame(animationFrameId);
  }, [enabled]);

  return fpsRef.current;
}

// 组件卸载时的清理工具
export function useCleanup(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    return () => {
      callback();
    };
  }, deps);
}

// 图片懒加载Hook
export function useLazyLoading(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // 检查浏览器是否支持IntersectionObserver
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                imageObserver.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: "50px", // 提前50px开始加载
        }
      );

      // 观察所有带有data-src属性的图片
      const images = document.querySelectorAll("img[data-src]");
      images.forEach((img) => imageObserver.observe(img));

      return () => {
        images.forEach((img) => imageObserver.unobserve(img));
      };
    }
  }, [enabled]);
}

// 性能指标收集
export function usePerformanceMetrics(componentName: string) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.performance) return;

    // 页面加载性能指标
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

    console.log(`[${componentName}] 性能指标:`, {
      pageLoadTime: `${pageLoadTime}ms`,
      domReadyTime: `${domReadyTime}ms`,
    });

    // 使用PerformanceObserver监控资源加载
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "navigation") {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log(`[${componentName}] 导航性能:`, {
                domContentLoaded: `${navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart}ms`,
                loadComplete: `${navEntry.loadEventEnd - navEntry.loadEventStart}ms`,
              });
            }
          }
        });

        observer.observe({ entryTypes: ["navigation"] });

        return () => observer.disconnect();
      } catch (error) {
        console.error("PerformanceObserver初始化失败:", error);
      }
    }
  }, [componentName]);
}

import { useState } from "react";