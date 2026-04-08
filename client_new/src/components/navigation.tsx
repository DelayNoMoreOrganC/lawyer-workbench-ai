"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
            <button className="text-sm text-gray-600 hover:text-gray-900">
              帮助
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                L
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}