"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useMemo, memo } from "react";

interface NavigationItem {
  name: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "工作台",
    href: "/"
  },
  {
    name: "案件管理",
    href: "/cases"
  },
  {
    name: "客户管理",
    href: "/customers"
  },
  {
    name: "待办事项",
    href: "/tasks"
  },
  {
    name: "行政办公",
    href: "/oa"
  },
  {
    name: "数据统计",
    href: "/statistics"
  },
  {
    name: "文件检索",
    href: "/dossiers"
  },
  {
    name: "AI助手",
    href: "/ai-chat"
  },
  {
    name: "系统管理",
    href: "/admin"
  }
];

interface NavLinkProps {
  item: NavigationItem;
  pathname: string;
}

function NavLink({ item, pathname }: NavLinkProps) {
  const isActive = useMemo(() =>
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href)),
    [pathname, item.href]
  );

  return (
    <Link
      href={item.href}
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {item.name}
    </Link>
  );
}

const MemoizedNavLink = memo(NavLink);

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = useCallback(() => {
    if (confirm("确定要退出登录吗？")) {
      logout();
      router.push("/login");
    }
  }, [logout, router]);

  const userInitial = useMemo(() =>
    user?.full_name?.charAt(0) || user?.username?.charAt(0) || "U",
    [user?.full_name, user?.username]
  );

  const userName = useMemo(() =>
    user?.full_name || user?.username,
    [user?.full_name, user?.username]
  );

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                智能律师工作台
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.filter(item => {
              // 系统管理只对管理员可见
              return item.href !== "/admin" || user?.role === "admin";
            }).map((item) => (
              <MemoizedNavLink
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-gray-900 hidden sm:block">
                    {userName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}