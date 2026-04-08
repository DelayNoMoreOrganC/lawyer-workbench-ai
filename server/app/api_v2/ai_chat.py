from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    conversation_history: List[ChatMessage]


# 预设的法律回复模板
LEGAL_RESPONSES = {
    "起诉状": """
起诉状是民事诉讼中原告向人民法院提起诉讼时提交的法律文书。

起诉状的基本结构包括：
1. 当事人信息：原告、被告的基本情况
2. 诉讼请求：明确具体的诉讼要求
3. 事实与理由：详细陈述案件事实和法律依据
4. 证据列表：列明支持主张的证据材料
5. 日期和签名

需要我帮您生成具体的起诉状模板吗？
    """,

    "答辩状": """
答辩状是被告针对原告的起诉状进行答复和辩驳的法律文书。

答辩状的主要内容包括：
1. 被告人信息
2. 对原告诉讼请求的答复
3. 事实和理由的辩驳
4. 相关证据材料
5. 法律依据

建议您在答辩时重点关注：
- 事实是否清楚
- 证据是否充分
- 法律适用是否正确
- 诉讼时效问题

    """,

    "调解": """
调解是解决纠纷的重要方式，具有以下优势：

1. 节省时间和成本
2. 保护当事人隐私
3. 维护当事人关系
4. 执行率较高

调解的基本流程：
1. 当事人申请或法院建议调解
2. 选定调解员
3. 调解员组织调解会议
4. 当事人协商达成一致
5. 制作调解协议书

如果您需要具体的调解建议，请告诉我案件的具体情况。
    """,

    "证据": """
证据是诉讼中最重要的要素之一。常见证据类型包括：

1. 书证：合同、信函、文件等
2. 物证：实物证据
3. 视听资料：录音、录像等
4. 证人证言
5. 当事人陈述
6. 鉴定结论
7. 勘验笔录

证据收集注意事项：
- 证据必须合法取得
- 证据要真实可靠
- 及时收集和固定证据
- 注意证据的关联性

    """,

    "default": """
您好！我是您的AI法律助手，很高兴为您提供帮助。

我可以协助您处理以下法律事务：

📋 法律文书
- 起诉状、答辩状、上诉状
- 代理词、辩护词
- 合同文书、协议书

⚖️ 诉讼咨询
- 民事纠纷（合同、侵权、婚姻家庭等）
- 刑事辩护
- 行政诉讼
- 执行程序

🔍 案件分析
- 证据评估
- 法律适用分析
- 诉讼策略建议
- 风险评估

📝 其他服务
- 法律条文查询
- 诉讼程序指导
- 调解谈判建议

请告诉我您遇到的具体法律问题，我会尽力为您提供专业的建议和帮助。
    """
}


def analyze_user_message(message: str) -> str:
    """分析用户消息并返回合适的回复"""
    message_lower = message.lower()

    # 简单的关键词匹配
    if "起诉状" in message or "起诉" in message:
        return LEGAL_RESPONSES["起诉状"]
    elif "答辩状" in message or "答辩" in message:
        return LEGAL_RESPONSES["答辩状"]
    elif "调解" in message:
        return LEGAL_RESPONSES["调解"]
    elif "证据" in message:
        return LEGAL_RESPONSES["证据"]
    else:
        # 检查是否是问候语
        greetings = ["你好", "您好", "hello", "hi"]
        if any(greeting in message_lower for greeting in greetings):
            return LEGAL_RESPONSES["default"]
        else:
            return f"""
感谢您的咨询：{message}

基于您的问题，我建议您：

1. 请提供更详细的案件背景信息
2. 说明具体的法律问题或需求
3. 如有相关证据材料，请简要描述

这样我可以为您提供更准确和有针对性的法律建议。

您可以详细描述一下具体情况吗？
            """


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI聊天接口"""
    try:
        # 分析用户消息并生成回复
        ai_response = analyze_user_message(request.message)

        # 构建对话历史
        conversation_history = request.conversation_history or []
        conversation_history.append(ChatMessage(role="user", content=request.message))
        conversation_history.append(ChatMessage(role="assistant", content=ai_response.strip()))

        return ChatResponse(
            response=ai_response.strip(),
            conversation_history=conversation_history
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"聊天服务异常: {str(e)}")


@router.get("/templates")
async def get_document_templates():
    """获取文书模板列表"""
    return {
        "templates": [
            {
                "id": 1,
                "name": "民事起诉状模板",
                "category": "民事诉讼",
                "description": "适用于一般民事纠纷的起诉状模板"
            },
            {
                "id": 2,
                "name": "答辩状模板",
                "category": "民事诉讼",
                "description": "适用于民事案件的答辩状模板"
            },
            {
                "id": 3,
                "name": "代理词模板",
                "category": "诉讼代理",
                "description": "律师代理词模板"
            },
            {
                "id": 4,
                "name": "合同模板",
                "category": "合同法",
                "description": "通用合同模板"
            }
        ]
    }


@router.get("/usage-stats")
async def get_usage_stats():
    """获取使用统计"""
    return {
        "today_chats": 0,
        "month_chats": 0,
        "remaining_quota": "无限",
        "features": [
            "法律咨询",
            "文书生成",
            "案件分析",
            "证据评估"
        ]
    }