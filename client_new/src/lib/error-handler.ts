// 错误处理和日志系统
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

enum ErrorCategory {
  NETWORK = "NETWORK",
  API = "API",
  VALIDATION = "VALIDATION",
  AUTH = "AUTH",
  UNKNOWN = "UNKNOWN",
}

interface ErrorLog {
  timestamp: string;
  level: LogLevel;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  url?: string;
  userAgent?: string;
}

class ErrorHandler {
  private logs: ErrorLog[] = [];
  private maxLogs: number = 100; // 最多保存100条日志
  private isDevelopment: boolean = process.env.NODE_ENV === "development";

  // 错误分类
  private categorizeError(error: Error | string): ErrorCategory {
    const errorMessage = typeof error === "string" ? error : error.message;

    if (errorMessage.includes("网络") || errorMessage.includes("fetch") || errorMessage.includes("Network")) {
      return ErrorCategory.NETWORK;
    }

    if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("认证")) {
      return ErrorCategory.AUTH;
    }

    if (errorMessage.includes("验证") || errorMessage.includes("格式")) {
      return ErrorCategory.VALIDATION;
    }

    if (errorMessage.includes("API") || errorMessage.includes("请求")) {
      return ErrorCategory.API;
    }

    return ErrorCategory.UNKNOWN;
  }

  // 记录错误
  logError(
    error: Error | string,
    context?: Record<string, any>,
    level: LogLevel = LogLevel.ERROR
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      category: this.categorizeError(error),
      message: typeof error === "string" ? error : error.message,
      stack: typeof error === "object" ? error.stack : undefined,
      context,
      userId: this.getUserId(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
    };

    this.addLog(errorLog);

    // 在开发环境打印详细错误信息
    if (this.isDevelopment) {
      console.error(`[${errorLog.level}] ${errorLog.category}:`, error, errorLog);
    } else {
      console.error(`[${errorLog.level}] ${errorLog.category}:`, errorLog.message);
    }

    // 在生产环境可以发送错误日志到服务器
    if (!this.isDevelopment) {
      this.sendToServer(errorLog);
    }
  }

  // 记录信息
  logInfo(message: string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: ErrorCategory.UNKNOWN,
      message,
      context,
      userId: this.getUserId(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.addLog(errorLog);

    if (this.isDevelopment) {
      console.info(`[INFO]:`, message, context);
    }
  }

  // 记录警告
  logWarning(message: string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: ErrorCategory.UNKNOWN,
      message,
      context,
      userId: this.getUserId(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.addLog(errorLog);

    if (this.isDevelopment) {
      console.warn(`[WARN]:`, message, context);
    }
  }

  // 添加日志到内存
  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 保存到localStorage
    try {
      localStorage.setItem("error_logs", JSON.stringify(this.logs));
    } catch (error) {
      console.error("保存错误日志失败:", error);
    }
  }

  // 获取用户ID
  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id?.toString();
      }
    } catch (error) {
      console.error("获取用户ID失败:", error);
    }
    return undefined;
  }

  // 发送错误日志到服务器（可选）
  private async sendToServer(log: ErrorLog): Promise<void> {
    try {
      // 这里可以实现将错误日志发送到服务器的逻辑
      // await fetch("/api/logs", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(log),
      // });
    } catch (error) {
      console.error("发送错误日志到服务器失败:", error);
    }
  }

  // 获取所有日志
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  // 清空日志
  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem("error_logs");
    } catch (error) {
      console.error("清空错误日志失败:", error);
    }
  }

  // 导出日志为JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // 获取最近的错误
  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.logs
      .filter(log => log.level === LogLevel.ERROR)
      .slice(-count);
  }

  // 处理未捕获的错误
  handleGlobalError(): void {
    if (typeof window === "undefined") return;

    // 处理未捕获的JavaScript错误
    window.addEventListener("error", (event) => {
      this.logError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // 处理未捕获的Promise rejection
    window.addEventListener("unhandledrejection", (event) => {
      this.logError(event.reason || "未处理的Promise rejection", {
        type: "unhandledrejection",
      });
    });
  }
}

// 导出单例实例
export const errorHandler = new ErrorHandler();

// 在应用启动时初始化全局错误处理
if (typeof window !== "undefined") {
  errorHandler.handleGlobalError();
}

// 导出便捷函数
export const logError = (error: Error | string, context?: Record<string, any>) =>
  errorHandler.logError(error, context);

export const logInfo = (message: string, context?: Record<string, any>) =>
  errorHandler.logInfo(message, context);

export const logWarning = (message: string, context?: Record<string, any>) =>
  errorHandler.logWarning(message, context);

// 导出类型和枚举
export { LogLevel, ErrorCategory, ErrorLog };