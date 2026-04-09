// 全局Toast通知系统
let toastCallback: ((message: string, type: "success" | "error" | "warning" | "info", duration?: number) => void) | null = null;

export function setToastCallback(callback: (message: string, type: "success" | "error" | "warning" | "info", duration?: number) => void) {
  toastCallback = callback;
}

export const globalToast = {
  success: (message: string, duration?: number) => {
    if (toastCallback) {
      toastCallback(message, "success", duration);
    } else {
      console.log("✅", message);
    }
  },
  error: (message: string, duration?: number) => {
    if (toastCallback) {
      toastCallback(message, "error", duration);
    } else {
      console.error("❌", message);
    }
  },
  warning: (message: string, duration?: number) => {
    if (toastCallback) {
      toastCallback(message, "warning", duration);
    } else {
      console.warn("⚠️", message);
    }
  },
  info: (message: string, duration?: number) => {
    if (toastCallback) {
      toastCallback(message, "info", duration);
    } else {
      console.info("ℹ️", message);
    }
  },
};