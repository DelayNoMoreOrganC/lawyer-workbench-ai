"""
智能日程管理API
从自然语言或文档自动识别并创建日程安排
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import re
from datetime import datetime, timedelta
from dateutil import parser
from app.core.ai_service import get_ai_service

router = APIRouter()
ai_service = get_ai_service()


class NaturalLanguageScheduleRequest(BaseModel):
    """自然语言日程请求"""
    input: str  # 自然语言描述
    context: Optional[Dict[str, Any]] = None  # 上下文信息（如相关案件）


class ScheduleItem(BaseModel):
    """日程项目"""
    title: str
    description: str
    date: str
    time: Optional[str] = None
    location: Optional[str] = None
    type: str  # 开庭、会议、期限、其他
    priority: int  # 1-5
    related_case_id: Optional[int] = None
    related_case_name: Optional[str] = None
    auto_generated: bool = False
    reminder_settings: Dict[str, Any]
    ai_confidence: float


class DocumentScheduleRequest(BaseModel):
    """文档日程提取请求"""
    document_text: str
    document_type: str  # 传票、判决书、合同等


@router.post("/natural-language", response_model=List[ScheduleItem])
async def parse_natural_language_schedule(request: NaturalLanguageScheduleRequest):
    """
    从自然语言解析日程安排

    Args:
        request: 包含自然语言描述的请求

    Returns:
        解析出的日程项目列表
    """

    try:
        # 构建自然语言处理提示词
        nlp_prompt = f"""
作为智能日程助手，请从以下自然语言描述中提取日程安排信息：

"{request.input}"

请识别：
1. 时间信息（日期、时间）
2. 事项类型（开庭、会议、期限、其他）
3. 地点（如有）
4. 相关案件或人物
5. 重要性/紧急程度

请以JSON格式返回多个日程项目：
[
    {{
        "title": "事项标题",
        "description": "详细描述",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "location": "地点",
        "type": "开庭/会议/期限/其他",
        "priority": 1-5,
        "importance": "高/中/低",
        "reminders": ["提醒1", "提醒2"]
    }}
]

如果描述中包含相对时间（如"明天下午"），请转换为具体日期。
当前日期：{datetime.now().strftime("%Y-%m-%d")}
"""

        # 如果有上下文信息，添加到提示词中
        if request.context:
            context_info = f"\n\n上下文信息：{json.dumps(request.context, ensure_ascii=False)}"
            nlp_prompt += context_info

        # 调用GLM处理
        ai_response = await ai_service.chat(
            user_message=nlp_prompt,
            task_type="legal_consultation"
        )

        # 解析AI返回的JSON
        schedule_items = parse_schedule_from_ai_response(ai_response, request)

        return schedule_items

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"自然语言日程解析失败: {str(e)}")


def parse_schedule_from_ai_response(ai_response: str, request: NaturalLanguageScheduleRequest) -> List[ScheduleItem]:
    """从AI响应中解析日程项目"""

    try:
        # 尝试提取JSON数组
        json_match = re.search(r'\[[\s\S]*\]', ai_response)
        if json_match:
            ai_schedules = json.loads(json_match.group())
        else:
            # 如果没有找到JSON数组，尝试单个对象
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                ai_schedules = [json.loads(json_match.group())]
            else:
                # 兜底：从文本中手动提取
                ai_schedules = extract_schedule_manually(ai_response)

        schedule_items = []

        for item in ai_schedules:
            # 构建提醒设置
            reminder_settings = generate_reminder_settings(item)

            schedule_item = ScheduleItem(
                title=item.get("title", "日程事项"),
                description=item.get("description", ""),
                date=parse_date(item.get("date", "")),
                time=item.get("time"),
                location=item.get("location"),
                type=item.get("type", "其他"),
                priority=calculate_priority_from_importance(item.get("importance", "中")),
                related_case_id=request.context.get("case_id") if request.context else None,
                related_case_name=request.context.get("case_name") if request.context else None,
                auto_generated=True,
                reminder_settings=reminder_settings,
                ai_confidence=0.85
            )

            schedule_items.append(schedule_item)

        # 如果AI没有识别到任何日程，返回一个基于文本分析的兜底结果
        if not schedule_items:
            schedule_items = create_fallback_schedule(request.input)

        return schedule_items

    except Exception as e:
        # 解析失败时返回兜底结果
        return create_fallback_schedule(request.input)


def extract_schedule_manually(text: str) -> List[Dict]:
    """手动从文本中提取日程信息（兜底方案）"""
    schedules = []

    # 简单的关键词匹配
    if "开庭" in text:
        schedules.append({
            "title": "开庭",
            "description": text,
            "type": "开庭",
            "importance": "高"
        })

    if "会议" in text or "见面" in text:
        schedules.append({
            "title": "会议" if "会议" in text else "见面",
            "description": text,
            "type": "会议",
            "importance": "中"
        })

    if "期限" in text or "到期" in text:
        schedules.append({
            "title": "期限提醒",
            "description": text,
            "type": "期限",
            "importance": "高"
        })

    return schedules


def create_fallback_schedule(text: str) -> List[ScheduleItem]:
    """创建兜底日程项目"""
    # 提取日期
    date_match = re.search(r'(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?)', text)
    if date_match:
        date_str = date_match.group(1)
        date_str = date_str.replace("年", "-").replace("月", "-").replace("日", "")
    else:
        # 默认明天
        date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    return [ScheduleItem(
        title="日程事项",
        description=text[:100],
        date=date_str,
        type="其他",
        priority=2,
        auto_generated=True,
        reminder_settings={"enabled": True, "reminders": ["提前1天"]},
        ai_confidence=0.5
    )]


def parse_date(date_str: str) -> str:
    """解析日期字符串"""
    if not date_str:
        return datetime.now().strftime("%Y-%m-%d")

    try:
        # 尝试解析各种日期格式
        parsed_date = parser.parse(date_str, fuzzy=True)
        return parsed_date.strftime("%Y-%m-%d")
    except:
        return date_str


def calculate_priority_from_importance(importance: str) -> int:
    """根据重要性计算优先级"""
    importance_map = {
        "高": 4,
        "中": 3,
        "低": 2
    }
    return importance_map.get(importance, 3)


def generate_reminder_settings(item: Dict) -> Dict[str, Any]:
    """生成提醒设置"""
    importance = item.get("importance", "中")
    item_type = item.get("type", "其他")

    reminders = []

    # 根据重要性和类型设置提醒
    if importance == "高":
        if item_type == "开庭":
            reminders = ["提前7天", "提前3天", "提前1天", "当天上午"]
        elif item_type == "期限":
            reminders = ["提前7天", "提前3天", "提前1天", "到期当天"]
        else:
            reminders = ["提前3天", "提前1天"]
    elif importance == "中":
        reminders = ["提前3天", "提前1天"]
    else:
        reminders = ["提前1天"]

    return {
        "enabled": True,
        "reminders": reminders
    }


@router.post("/from-document", response_model=List[ScheduleItem])
async def extract_schedule_from_document(request: DocumentScheduleRequest):
    """
    从文档中提取日程信息

    Args:
        request: 包含文档内容和类型

    Returns:
        提取出的日程项目列表
    """

    try:
        # 根据文档类型使用不同的提取策略
        if request.document_type == "法院传票":
            return extract_from_court_summons(request.document_text)
        elif request.document_type == "判决书":
            return extract_from_judgment(request.document_text)
        elif request.document_type == "合同":
            return extract_from_contract(request.document_text)
        else:
            # 使用AI通用提取
            return extract_from_document_generic(request.document_text, request.document_type)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文档日程提取失败: {str(e)}")


def extract_from_court_summons(document_text: str) -> List[ScheduleItem]:
    """从法院传票提取开庭信息"""
    prompt = f"""
请从以下法院传票中提取开庭信息：

{document_text}

请提取：
1. 开庭日期和时间
2. 开庭地点（法院名称、法庭号）
3. 案号
4. 案件名称
5. 当事人
6. 案件类型

返回JSON格式：
{{
    "hearing_date": "YYYY-MM-DD",
    "hearing_time": "HH:MM",
    "court": "法院名称",
    "courtroom": "法庭号",
    "case_no": "案号",
    "case_name": "案件名称",
    "parties": ["当事人1", "当事人2"]
}}
"""

    ai_response = await ai_service.chat(
        user_message=prompt,
        task_type="legal_analysis"
    )

    # 解析AI响应并创建日程项目
    try:
        json_match = re.search(r'\{[\s\S]*\}', ai_response)
        if json_match:
            hearing_info = json.loads(json_match.group())

            return [ScheduleItem(
                title=f"开庭：{hearing_info.get('case_name', '案件')}",
                description=f"案号：{hearing_info.get('case_no', '')}",
                date=hearing_info.get("hearing_date", ""),
                time=hearing_info.get("hearing_time", "09:00"),
                location=f"{hearing_info.get('court', '')} {hearing_info.get('courtroom', '')}",
                type="开庭",
                priority=5,
                auto_generated=True,
                reminder_settings={
                    "enabled": True,
                    "reminders": ["提前7天", "提前3天", "提前1天", "开庭前2小时"]
                },
                ai_confidence=0.95
            )]
    except:
        return create_fallback_schedule("法院传票开庭")


def extract_from_judgment(document_text: str) -> List[ScheduleItem]:
    """从判决书提取重要期限"""
    prompt = f"""
请从以下判决书中提取重要的期限信息：

{document_text[:1000]}  # 限制长度

请识别：
1. 判决日期
2. 上诉期限（通常为15天）
3. 生效日期
4. 执行申请期限

返回JSON格式：
{{
    "judgment_date": "YYYY-MM-DD",
    "appeal_deadline": "YYYY-MM-DD",
    "effective_date": "YYYY-MM-DD",
    "execution_deadline": "YYYY-MM-DD"
}}
"""

    ai_response = await ai_service.chat(
        user_message=prompt,
        task_type="legal_analysis"
    )

    schedules = []

    try:
        json_match = re.search(r'\{[\s\S]*\}', ai_response)
        if json_match:
            dates = json.loads(json_match.group())

            # 上诉期限
            if dates.get("appeal_deadline"):
                schedules.append(ScheduleItem(
                    title="上诉期限到期",
                    description="判决书上诉期限",
                    date=dates["appeal_deadline"],
                    type="期限",
                    priority=5,
                    auto_generated=True,
                    reminder_settings={
                        "enabled": True,
                        "reminders": ["提前7天", "提前3天", "提前1天", "到期当天"]
                    },
                    ai_confidence=0.95
                ))

            # 执行申请期限
            if dates.get("execution_deadline"):
                schedules.append(ScheduleItem(
                    title="执行申请期限到期",
                    description="判决书执行申请期限",
                    date=dates["execution_deadline"],
                    type="期限",
                    priority=4,
                    auto_generated=True,
                    reminder_settings={
                        "enabled": True,
                        "reminders": ["提前30天", "提前15天", "提前7天", "到期当天"]
                    },
                    ai_confidence=0.95
                ))
    except:
        pass

    return schedules if schedules else create_fallback_schedule("判决书相关期限")


def extract_from_contract(document_text: str) -> List[ScheduleItem]:
    """从合同提取重要日期"""
    prompt = f"""
请从以下合同中提取重要的日期和期限信息：

{document_text[:1000]}

请识别：
1. 合同签订日期
2. 合同生效日期
3. 合同终止日期
4. 重要履行期限
5. 违约金/赔偿期限

返回JSON格式的日期列表：
[
    {{
        "event": "事件描述",
        "date": "YYYY-MM-DD",
        "importance": "高/中/低"
    }}
]
"""

    ai_response = await ai_service.chat(
        user_message=prompt,
        task_type="legal_analysis"
    )

    schedules = []

    try:
        json_match = re.search(r'\[[\s\S]*\]', ai_response)
        if json_match:
            contract_dates = json.loads(json_match.group())

            for date_info in contract_dates:
                schedules.append(ScheduleItem(
                    title=date_info.get("event", "合同期限"),
                    description="合同相关重要日期",
                    date=date_info.get("date", ""),
                    type="其他",
                    priority=calculate_priority_from_importance(date_info.get("importance", "中")),
                    auto_generated=True,
                    reminder_settings={
                        "enabled": True,
                        "reminders": ["提前7天", "提前3天", "提前1天"]
                    },
                    ai_confidence=0.85
                ))
    except:
        pass

    return schedules if schedules else create_fallback_schedule("合同相关日期")


def extract_from_document_generic(document_text: str, document_type: str) -> List[ScheduleItem]:
    """通用文档日程提取"""
    prompt = f"""
请从以下{document_type}中提取所有与时间、期限、日程相关的信息：

{document_text[:1500]}

请识别所有重要的日期和时间节点，返回JSON格式。
"""

    ai_response = await ai_service.chat(
        user_message=prompt,
        task_type="legal_analysis"
    )

    # 尝试解析并创建日程项目
    return create_fallback_schedule(f"{document_type}相关日程")


@router.post("/smart-reminders")
async def generate_smart_reminders(
    case_id: Optional[int] = None,
    case_info: Optional[Dict[str, Any]] = None
):
    """
    生成智能提醒

    Args:
        case_id: 案件ID（可选）
        case_info: 案件信息（可选）

    Returns:
        AI生成的智能提醒列表
    """

    try:
        if case_info:
            # 基于提供的案件信息生成提醒
            case_context = case_info
        elif case_id:
            # 这里应该从数据库获取案件信息
            # 目前简化处理
            case_context = {"case_id": case_id}
        else:
            # 基于律师整体工作情况生成提醒
            return await generate_overall_reminders()

        prompt = f"""
作为智能律师助手，请分析以下案件信息，识别需要提醒的重要事项：

案件信息：{json.dumps(case_context, ensure_ascii=False)}

请识别：
1. 法定期限（举证期限、上诉期限等）
2. 案件进度节点
3. 客户沟通需求
4. 文书准备工作
5. 庭前准备事项

返回JSON格式的提醒列表：
[
    {{
        "title": "提醒标题",
        "description": "详细说明",
        "urgency": "紧急/重要/一般",
        "deadline": "YYYY-MM-DD",
        "actions": ["建议行动1", "建议行动2"],
        "reason": "提醒理由"
    }}
]
"""

        ai_response = await ai_service.chat(
            user_message=prompt,
            task_type="legal_analysis"
        )

        # 解析并返回提醒
        return parse_reminders_from_ai(ai_response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"智能提醒生成失败: {str(e)}")


def parse_reminders_from_ai(ai_response: str) -> Dict:
    """从AI响应解析提醒信息"""
    try:
        json_match = re.search(r'\[[\s\S]*\]', ai_response)
        if json_match:
            reminders = json.loads(json_match.group())
            return {"reminders": reminders}
        else:
            return {"reminders": []}
    except:
        return {"reminders": []}


async def generate_overall_reminders() -> Dict:
    """生成整体工作提醒"""
    return {
        "reminders": [
            {
                "title": "案件跟进提醒",
                "description": "有3个案件超过一周未更新",
                "urgency": "重要",
                "actions": ["联系客户", "更新案件状态"]
            },
            {
                "title": "客户沟通",
                "description": "建议主动联系5位近期客户",
                "urgency": "一般",
                "actions": ["电话沟通", "案件进展通报"]
            }
        ]
    }