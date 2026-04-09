// 请求队列管理器 - 避免同时发起太多请求
type RequestFunction<T> = () => Promise<T>;

interface QueuedRequest<T> {
  request: RequestFunction<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  priority: number;
}

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests: number = 0;
  private maxConcurrent: number;
  private processing: boolean = false;

  constructor(maxConcurrent: number = 6) {
    this.maxConcurrent = maxConcurrent;
    this.processQueue();
  }

  async add<T>(
    request: RequestFunction<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject,
        priority,
      });

      // 按优先级排序
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const queuedRequest = this.queue.shift();
      if (!queuedRequest) break;

      this.activeRequests++;

      queuedRequest
        .request()
        .then(queuedRequest.resolve)
        .catch(queuedRequest.reject)
        .finally(() => {
          this.activeRequests--;
          this.processQueue();
        });
    }

    this.processing = false;
  }

  getStats(): { queueLength: number; activeRequests: number } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
    };
  }

  clear(): void {
    this.queue.forEach(queuedRequest => {
      queuedRequest.reject(new Error("请求队列已清空"));
    });
    this.queue = [];
  }
}

// 导出单例实例
export const requestQueue = new RequestQueue();

// 导出类型
export { RequestQueue };