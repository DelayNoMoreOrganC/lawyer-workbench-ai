"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "您好！我是您的AI法律助手。我可以帮您：\n\n• 解答法律咨询\n• 生成法律文书\n• 分析案件信息\n• 提供法律建议\n\n请告诉我您需要什么帮助？"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (messageContent?: string) => {
    const userMessage = messageContent || input.trim();
    if (!userMessage) return;

    if (!messageContent) {
      setInput("");
    }
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v2/ai/chat/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: messages
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error("AI服务暂时不可用");
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "抱歉，AI服务暂时不可用。请稍后再试或联系管理员。"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "complaint":
        handleSend("请帮我生成一份起诉状模板");
        break;
      case "consultation":
        handleSend("我想咨询一个法律问题");
        break;
      case "analysis":
        handleSend("请帮我分析一个案件");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            AI法律助手
          </h1>
          <p className="text-sm text-gray-600">
            智能法律咨询和文书生成服务
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <p className="text-sm">思考中...</p>
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder="请描述您的法律问题..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
                className="flex-1 min-h-20 resize-none"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="self-end"
              >
                发送
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              常用功能
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left"
                onClick={() => handleQuickAction("complaint")}
                disabled={isLoading}
              >
                📄 生成起诉状
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left"
                onClick={() => handleQuickAction("consultation")}
                disabled={isLoading}
              >
                ⚖️ 法律咨询
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left"
                onClick={() => handleQuickAction("analysis")}
                disabled={isLoading}
              >
                🔍 案件分析
              </Button>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              文书模板
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full text-left">
                起诉状模板
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left">
                答辩状模板
              </Button>
              <Button variant="outline" size="sm" className="w-full text-left">
                代理词模板
              </Button>
            </div>
          </Card>

          <Card className="p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              使用统计
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>今日对话: <span className="font-medium text-gray-900">0</span> 次</p>
              <p>本月对话: <span className="font-medium text-gray-900">0</span> 次</p>
              <p>剩余额度: <span className="font-medium text-gray-900">无限</span></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
