"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  FileText,
  Scale,
  Search,
  BookOpen,
  Sparkles,
  Download,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface AIAssistantProps {
  caseId?: number;
  caseName?: string;
  caseContext?: any;
}

export function AIAssistant({ caseId, caseName, caseContext }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: caseId
        ? `你好！我是你的AI法律助手。我可以帮助你:\n\n• 📝 生成法律文书（起诉状、答辩状、代理词等）\n• 🔍 检索相关案例和法律法规\n• 💡 提供法律建议和风险分析\n• 📋 回答案件相关问题\n\n当前案件: ${caseName}\n\n请告诉我你需要什么帮助？`
        : `你好！我是你的AI法律助手。我可以帮助你:\n\n• 📝 生成法律文书（起诉状、答辩状、代理词等）\n• 🔍 检索相关案例和法律法规\n• 💡 提供法律建议和风险分析\n• 📋 回答法律问题\n\n请告诉我你需要什么帮助？`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("起诉状") || lowerInput.includes("答辩状")) {
      return `好的，我来为你生成一份${lowerInput.includes("起诉状") ? "起诉状" : "答辩状"}。

请提供以下信息：
1. ${caseContext?.plaintiff || "原告信息"}
2. ${caseContext?.defendant || "被告信息"}
3. 诉讼请求
4. 事实与理由

或者你可以上传相关文档，我将自动提取信息生成文书。`;
    }

    if (lowerInput.includes("案例") || lowerInput.includes("检索")) {
      return `根据案件类型"${caseContext?.case_type || "民事"}"，我为你检索到以下相关案例：

**案例1：** 张三诉李四合同纠纷案 (2024)京01民终123号
• 争议焦点：合同履行争议
• 裁判结果：支持原告诉讼请求
• 裁判要点：明确约定了合同履行期限和方式

**案例2：** 王五诉赵六侵权责任案 (2024)京02民终456号
• 争议焦点：损害赔偿责任认定
• 裁判结果：部分支持原告诉讼请求
• 裁判要点：侵权行为与损害结果因果关系认定

需要查看更多案例或具体分析某个案例吗？`;
    }

    if (lowerInput.includes("法律") || lowerInput.includes("法规")) {
      return `根据案件情况，相关法律法规包括：

**《中华人民共和国民法典》**
• 第一百一十九条 [合同的约束力]
• 第五百七十七条 [违约责任]
• 第五百八十四条 [损害赔偿范围]

**《中华人民共和国民事诉讼法》**
• 第二十一条 [原告住所地管辖]
• 第六十四条 [举证责任]

需要具体解读某个法条或查看更多相关法规吗？`;
    }

    if (lowerInput.includes("风险") || lowerInput.includes("分析")) {
      return `基于案件信息，我为你分析以下风险点：

**法律风险：**
• 证据风险：${caseContext?.case_brief ? "案件描述较为简单，建议补充更多证据材料" : "暂无详细案件信息"}
• 时效风险：请注意诉讼时效期间
• 程序风险：确保管辖法院正确

**建议措施：**
1. 完善证据链，准备相关证明材料
2. 核实对方当事人信息
3. 评估诉讼成本和收益
4. 考虑调解或和解的可能性

需要我详细分析某个风险点吗？`;
    }

    return `收到你的问题："${userInput}"

作为AI法律助手，我可以帮助你：
• 生成各类法律文书
• 检索相关案例和法规
• 提供法律建议
• 分析案件风险

请告诉我你的具体需求，我会为你提供专业的法律支持。`;
  };

  const quickActions = [
    { icon: FileText, label: "生成起诉状", feature: "complaint" },
    { icon: FileText, label: "生成答辩状", feature: "defense" },
    { icon: Scale, label: "案例检索", feature: "search" },
    { icon: BookOpen, label: "法规查询", feature: "law" },
    { icon: Sparkles, label: "风险分析", feature: "risk" },
    { icon: Search, label: "法律问答", feature: "qa" },
  ];

  const handleQuickAction = (feature: string, label: string) => {
    setInput(label);
    inputRef.current?.focus();
  };

  const handleExportChat = () => {
    const chatContent = messages.map(msg =>
      `[${msg.timestamp.toLocaleString("zh-CN")}] ${msg.role === "user" ? "用户" : "AI助手"}: ${msg.content}`
    ).join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `AI对话记录_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">AI法律助手</div>
            {caseName && (
              <div className="text-xs text-gray-500">当前案件: {caseName}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportChat}>
            <Download className="w-4 h-4 mr-1" />
            导出对话
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-200" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-sm text-gray-600">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷操作 */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.feature}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.feature, action.label)}
                className="flex-shrink-0"
              >
                <Icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* 输入区域 */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="输入你的问题或需求..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}