const CACHE_NAME = "lawyer-workbench-v1";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// 安装Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] 安装Service Worker");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] 缓存文件");
      return cache.addAll(urlsToCache);
    })
  );

  // 立即激活新的Service Worker
  self.skipWaiting();
});

// 激活Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] 激活Service Worker");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除旧版本的缓存
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] 删除旧缓存:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 立即控制所有页面
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener("fetch", (event) => {
  // 只拦截GET请求
  if (event.request.method !== "GET") {
    return;
  }

  // 跳过chrome扩展和某些特殊请求
  if (
    !event.request.url.startsWith("http") &&
    !event.request.url.startsWith("https")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果有缓存，返回缓存
      if (cachedResponse) {
        console.log("[SW] 从缓存返回:", event.request.url);
        return cachedResponse;
      }

      // 否则发起网络请求
      return fetch(event.request)
        .then((response) => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // 克隆响应，因为响应是流，只能使用一次
          const responseToCache = response.clone();

          // 将新请求添加到缓存
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error("[SW] 网络请求失败:", error);

          // 如果是HTML请求且失败，返回离线页面
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/offline.html");
          }

          // 对于API请求，返回错误响应
          return new Response(JSON.stringify({ error: "网络连接失败" }), {
            headers: { "Content-Type": "application/json" },
            status: 503,
          });
        });
    })
  );
});

// 消息处理
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    });
  }
});

// 后台同步
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // 这里可以实现数据同步逻辑
    console.log("[SW] 执行后台同步");

    // 获取IndexedDB中待同步的数据
    // 发送到服务器
    // 清除已同步的数据
  } catch (error) {
    console.error("[SW] 后台同步失败:", error);
  }
}

// 推送通知
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "您有新的通知",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification("律师工作台", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/") || clients.focus()
  );
});