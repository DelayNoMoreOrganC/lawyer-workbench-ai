"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/v2/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // 保存令牌和用户信息
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 跳转到主页
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "登录失败，请检查用户名和密码");
      }
    } catch (error) {
      console.error("登录异常:", error);
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            智能律师工作台
          </h1>
          <p className="text-sm text-gray-600">登录以继续</p>
        </div>

        {/* 登录表单 */}
        <Card className="p-6 border border-gray-200">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="请输入用户名"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="请输入密码"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 ml-1"
                onClick={() => router.push("/register")}
              >
                立即注册
              </button>
            </p>
          </div>
        </Card>

        {/* 测试账户提示 */}
        <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900 font-medium mb-2">
            测试账户：
          </p>
          <p className="text-sm text-blue-700">
            用户名: admin / 密码: admin123
          </p>
          <p className="text-sm text-blue-700">
            用户名: lawyer / 密码: lawyer123
          </p>
        </Card>
      </div>
    </div>
  );
}