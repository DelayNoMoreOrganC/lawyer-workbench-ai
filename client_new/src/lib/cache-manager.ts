// 简单的内存缓存管理器
class CacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number; ttl: number }>;
  private defaultTTL: number = 5 * 60 * 1000; // 5分钟默认缓存时间

  constructor() {
    this.cache = new Map();

    // 定期清理过期缓存
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 每分钟清理一次
  }

  set(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计信息
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 导出单例实例
export const cacheManager = new CacheManager<any>();

// 导出类型
export { CacheManager };