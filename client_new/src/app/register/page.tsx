"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    email: "",
    phone: "",
    role: "lawyer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("密码长度不能少于6位");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/v2/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      if (response.ok) {
        alert("注册成功！请登录");
        router.push("/login");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "注册失败");
      }
    } catch (error) {
      console.error("注册异常:", error);
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
          <p className="text-sm text-gray-600">创建新账户</p>
        </div>

        {/* 注册表单 */}
        <Card className="p-6 border border-gray-200">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名 *
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="请输入用户名（至少3个字符）"
                required
                minLength={3}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码 *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="请输入密码（至少6个字符）"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认密码 *
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="请再次输入密码"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                真实姓名 *
              </label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="请输入真实姓名"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="请输入邮箱地址"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号码
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="请输入手机号码"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                <option value="lawyer">律师</option>
                <option value="assistant">助理</option>
              </select>
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
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 ml-1"
                onClick={() => router.push("/login")}
              >
                立即登录
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}