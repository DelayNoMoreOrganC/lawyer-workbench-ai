"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "工作台",
    href: "/",
    icon: ""
  },
  {
    name: "案件管理",
    href: "/cases",
    icon: ""
  },
  {
    name: "待办事项",
    href: "/tasks",
    icon: ""
  },
  {
    name: "文件检索",
    href: "/dossiers",
    icon: ""
  },
  {
    name: "AI助手",
    href: "/ai-chat",
    icon: ""
  }
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      logout();
      router.push("/login");
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900">
                智能律师工作台
              </span>
              <span className="text-xs text-gray-500">v2.0</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  帮助
                </button>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.full_name || user?.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.role === "admin" ? "管理员" : user?.role === "lawyer" ? "律师" : "助理"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 ml-2"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}