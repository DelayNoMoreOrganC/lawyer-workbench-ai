// 离线存储管理器 - 支持IndexedDB和localStorage
class OfflineStorage {
  private dbName = "LawyerWorkbenchDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // 初始化IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("无法打开IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象存储空间
        if (!db.objectStoreNames.contains("cases")) {
          db.createObjectStore("cases", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("tasks")) {
          db.createObjectStore("tasks", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("api-cache")) {
          db.createObjectStore("api-cache", { keyPath: "key" });
        }
      };
    });
  }

  // 存储数据到IndexedDB
  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("存储数据失败"));
    });
  }

  // 从IndexedDB获取数据
  async get(storeName: string, key: string | number): Promise<any> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("获取数据失败"));
    });
  }

  // 从IndexedDB获取所有数据
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("获取数据失败"));
    });
  }

  // 从IndexedDB删除数据
  async delete(storeName: string, key: string | number): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("删除数据失败"));
    });
  }

  // 清空指定存储空间
  async clear(storeName: string): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("清空数据失败"));
    });
  }

  // localStorage相关方法
  setLocal(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("localStorage存储失败:", error);
    }
  }

  getLocal<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("localStorage读取失败:", error);
      return null;
    }
  }

  removeLocal(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("localStorage删除失败:", error);
    }
  }

  clearLocal(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("localStorage清空失败:", error);
    }
  }

  // 会话存储相关方法
  setSession(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("sessionStorage存储失败:", error);
    }
  }

  getSession<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("sessionStorage读取失败:", error);
      return null;
    }
  }

  removeSession(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("sessionStorage删除失败:", error);
    }
  }

  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("sessionStorage清空失败:", error);
    }
  }
}

// 导出单例实例
export const offlineStorage = new OfflineStorage();

// 导出类型
export { OfflineStorage };