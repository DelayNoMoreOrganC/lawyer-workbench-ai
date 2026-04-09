"""
智能表单填充API
AI自动填充表单字段，最小化手动输入
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
from datetime import datetime
from app.core.ai_service import get_ai_service
from app.models.database import get_db
from app.models.case_new import CaseNew
from app.models.customer import Customer

router = APIRouter()
ai_service = get_ai_service()


class FormAutoFillRequest(BaseModel):
    """表单自动填充请求"""
    form_type: str  # 案件创建、文书生成、任务创建等
    partial_info: Optional[Dict[str, Any]] = {}  # 已知部分信息
    context: Optional[Dict[str, Any]] = {}  # 上下文信息（相关案件、客户等）


class AutoFilledForm(BaseModel):
    """自动填充的表单"""
    form_type: str
    filled_fields: Dict[str, Any]]
    confidence_scores: Dict[str, float]  # 各字段的置信度
    need_confirmation: List[str]  # 需要确认的字段
    ai_suggestions: List[str]  # AI建议
    source_info: Dict[str, str]  # 信息来源说明


@router.post("/auto-fill", response_model=AutoFilledForm)
async def auto_fill_form(request: FormAutoFillRequest):
    """
    智能表单填充

    Args:
        request: 表单类型和已知信息

    Returns:
        AI自动填充的表单数据
    """

    try:
        # 1. 从已知信息中提取数据
        filled_fields = request.partial_info.copy()

        # 2. AI推断和补充
        if request.form_type == "case_creation":
            filled_fields = await auto_fill_case_form(filled_fields, request.context)
        elif request.form_type == "document_generation":
            filled_fields = await auto_fill_document_form(filled_fields, request.context)
        elif request.form_type == "task_creation":
            filled_fields = await auto_fill_task_form(filled_fields, request.context)
        else:
            filled_fields = await generic_auto_fill(filled_fields, request.context)

        # 3. 计算置信度
        confidence_scores = calculate_confidence_scores(filled_fields, request)

        # 4. 识别需要确认的关键字段
        need_confirmation = identify_fields_needing_confirmation(filled_fields, request.form_type)

        # 5. 生成AI建议
        ai_suggestions = generate_fill_suggestions(filled_fields, request.form_type)

        # 6. 记录信息来源
        source_info = track_info_sources(filled_fields, request)

        return AutoFilledForm(
            form_type=request.form_type,
            filled_fields=filled_fields,
            confidence_scores=confidence_scores,
            need_confirmation=need_confirmation,
            ai_suggestions=ai_suggestions,
            source_info=source_info
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"智能表单填充失败: {str(e)}")


async def auto_fill_case_form(partial_info: Dict, context: Dict) -> Dict:
    """自动填充案件创建表单"""

    # 1. 从上下文中获取相关信息
    filled = partial_info.copy()

    # 2. 如果有关联客户，获取客户信息
    if context.get("customer_id"):
        customer_info = await get_customer_info(context["customer_id"])
        if customer_info:
            filled.update({
                "plaintiff_name": customer_info.get("name"),
                "plaintiff_contact": customer_info.get("phone"),
                "plaintiff_address": customer_info.get("address")
            })

    # 3. 如果有相似案件，参考历史信息
    if context.get("similar_case_id"):
        similar_case = await get_case_info(context["similar_case_id"])
        if similar_case:
            filled.update({
                "court_name": similar_case.get("court_name"),
                "case_type": similar_case.get("case_type"),
                "tags": similar_case.get("tags")
            })

    # 4. AI推断缺失字段
    missing_fields = identify_missing_fields(filled, "case_creation")
    if missing_fields:
        ai_inferred = await infer_missing_fields(missing_fields, filled, "case_creation")
        filled.update(ai_inferred)

    # 5. 设置智能默认值
    filled.setdefault("case_status", "draft")
    filled.setdefault("priority", 2)
    filled.setdefault("created_at", datetime.now().isoformat())

    return filled


async def auto_fill_document_form(partial_info: Dict, context: Dict) -> Dict:
    """自动填充文书生成表单"""
    filled = partial_info.copy()

    # 从案件信息获取基础数据
    if context.get("case_id"):
        case_info = await get_case_info(context["case_id"])
        if case_info:
            filled.update({
                "case_name": case_info.get("case_name"),
                "case_number": case_info.get("case_number"),
                "court_name": case_info.get("court_name"),
                "parties": {
                    "plaintiff": case_info.get("plaintiff"),
                    "defendant": case_info.get("defendant")
                }
            })

    # AI推断文书特定字段
    prompt = f"""
作为法律文书专家，请根据以下案件信息，推断文书生成所需的信息：

案件信息：{json.dumps(context, ensure_ascii=False)}

请推断：
1. 诉讼请求（根据案件类型和标的额）
2. 案由描述
3. 法律依据（相关法条）
4. 证据清单建议

返回JSON格式。
"""

    try:
        ai_response = await ai_service.chat(
            user_message=prompt,
            task_type="document_generation"
        )

        # 解析AI响应
        ai_inferred = parse_ai_response_for_form(ai_response)
        filled.update(ai_inferred)

    except:
        pass

    return filled


async def auto_fill_task_form(partial_info: Dict, context: Dict) -> Dict:
    """自动填充任务创建表单"""
    filled = partial_info.copy()

    # 从上下文获取关联信息
    if context.get("case_id"):
        case_info = await get_case_info(context["case_id"])
        if case_info:
            filled.setdefault("title", f"{case_info.get('case_name', '案件')}相关任务")
            filled.setdefault("related_case", case_info.get("case_name"))

    # AI推断任务属性
    if not filled.get("due_date"):
        # 根据任务类型智能推断截止日期
        task_type = filled.get("task_type", "一般任务")
        inferred_date = infer_task_due_date(task_type)
        filled["due_date"] = inferred_date

    if not filled.get("priority"):
        # 根据任务类型推断优先级
        filled["priority"] = infer_task_priority(filled.get("task_type", ""))

    return filled


async def generic_auto_fill(partial_info: Dict, context: Dict) -> Dict:
    """通用自动填充"""
    filled = partial_info.copy()

    # 使用AI进行通用推断
    missing_fields = [k for k, v in filled.items() if not v]

    if missing_fields:
        prompt = f"""
请根据以下信息，推断表单中缺失字段的合理值：

已知信息：{json.dumps(filled, ensure_ascii=False)}
上下文：{json.dumps(context, ensure_ascii=False)}

缺失字段：{missing_fields}

请提供合理的推断值，格式为JSON：{{字段名: 推断值}}
"""

        try:
            ai_response = await ai_service.chat(
                user_message=prompt,
                task_type="legal_consultation"
            )

            ai_inferred = parse_ai_response_for_form(ai_response)
            filled.update(ai_inferred)
        except:
            pass

    return filled


def identify_missing_fields(filled: Dict, form_type: str) -> List[str]:
    """识别缺失的字段"""
    # 定义各表单的必填字段
    required_fields = {
        "case_creation": ["case_name", "case_type", "plaintiff_name", "defendant_name"],
        "document_generation": ["document_type", "case_name"],
        "task_creation": ["title", "task_type", "due_date"]
    }

    required = required_fields.get(form_type, [])
    return [field for field in required if not filled.get(field)]


async def infer_missing_fields(missing_fields: List[str], known_info: Dict, form_type: str) -> Dict:
    """AI推断缺失字段"""
    inferred = {}

    prompt = f"""
作为法律助手，请根据已知信息推断表单中缺失的字段：

表单类型：{form_type}
已知信息：{json.dumps(known_info, ensure_ascii=False)}
需要推断的字段：{missing_fields}

请提供合理的推断值，返回JSON格式。
"""

    try:
        ai_response = await ai_service.chat(
            user_message=prompt,
            task_type="legal_analysis"
        )

        # 解析AI响应
        ai_inferred = parse_ai_response_for_form(ai_response)
        inferred.update(ai_inferred)

    except:
        # 如果AI推断失败，设置默认值
        for field in missing_fields:
            if field not in inferred:
                inferred[field] = get_default_value_for_field(field, form_type)

    return inferred


def calculate_confidence_scores(filled: Dict, request: FormAutoFillRequest) -> Dict[str, float]:
    """计算各字段的置信度"""
    confidence = {}

    for field, value in filled.items():
        if field in request.partial_info:
            # 用户直接提供的，置信度高
            confidence[field] = 1.0
        elif field in request.context:
            # 从上下文获取的，置信度中等
            confidence[field] = 0.8
        else:
            # AI推断的，置信度较低
            confidence[field] = 0.6

    return confidence


def identify_fields_needing_confirmation(filled: Dict, form_type: str) -> List[str]:
    """识别需要确认的关键字段"""
    # 定义各表单的关键确认字段
    confirmation_fields = {
        "case_creation": ["case_amount", "hearing_date", "case_name"],
        "document_generation": ["claims", "legal_basis"],
        "task_creation": ["due_date", "title"]
    }

    key_fields = confirmation_fields.get(form_type, [])

    # 返回存在但置信度较低的关键字段
    return [field for field in key_fields if field in filled]


def generate_fill_suggestions(filled: Dict, form_type: str) -> List[str]:
    """生成填充建议"""
    suggestions = []

    if form_type == "case_creation":
        if not filled.get("case_amount"):
            suggestions.append("建议补充案件标的额，这将影响案件优先级")

        if not filled.get("hearing_date"):
            suggestions.append("如已收到开庭通知，请填写开庭日期")

    elif form_type == "task_creation":
        due_date = filled.get("due_date")
        if due_date:
            suggestions.append(f"任务截止日期已设为{due_date}，建议设置提前提醒")

    return suggestions


def track_info_sources(filled: Dict, request: FormAutoFillRequest) -> Dict[str, str]:
    """追踪信息来源"""
    sources = {}

    for field in filled.keys():
        if field in request.partial_info:
            sources[field] = "用户直接提供"
        elif field in request.context:
            sources[field] = "从上下文获取"
        else:
            sources[field] = "AI智能推断"

    return sources


# 辅助函数
async def get_customer_info(customer_id: int) -> Dict:
    """获取客户信息"""
    # 这里应该从数据库查询
    # 目前返回模拟数据
    return {
        "name": "示例客户",
        "phone": "13800138000",
        "address": "示例地址"
    }


async def get_case_info(case_id: int) -> Dict:
    """获取案件信息"""
    # 这里应该从数据库查询
    # 目前返回模拟数据
    return {
        "case_name": "示例案件",
        "case_type": "民事",
        "court_name": "示例法院"
    }


def parse_ai_response_for_form(ai_response: str) -> Dict:
    """从AI响应解析表单数据"""
    import re
    try:
        json_match = re.search(r'\{[\s\S]*\}', ai_response)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    return {}


def get_default_value_for_field(field: str, form_type: str) -> Any:
    """获取字段的默认值"""
    defaults = {
        "case_name": "待命名案件",
        "case_type": "民事",
        "priority": 2,
        "case_status": "draft",
        "task_type": "一般任务"
    }
    return defaults.get(field, "")


def infer_task_due_date(task_type: str) -> str:
    """根据任务类型推断截止日期"""
    from datetime import timedelta

    task_deadlines = {
        "立案准备": 7,      # 7天
        "证据收集": 14,    # 14天
        "开庭准备": 3,     # 3天
        "文书撰写": 5,     # 5天
        "客户沟通": 2      # 2天
    }

    days = task_deadlines.get(task_type, 7)
    return (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")


def infer_task_priority(task_type: str) -> int:
    """根据任务类型推断优先级"""
    priority_map = {
        "立案准备": 3,
        "证据收集": 3,
        "开庭准备": 4,
        "期限提醒": 5,
        "客户沟通": 2
    }
    return priority_map.get(task_type, 2)


@router.post("/smart-complete")
async def smart_complete(
    field_name: str,
    partial_value: str,
    form_type: str,
    context: Optional[Dict] = None
):
    """
    智能补全 - 根据部分输入智能补全字段内容

    Args:
        field_name: 字段名称
        partial_value: 部分输入值
        form_type: 表单类型
        context: 上下文信息

    Returns:
        AI补全的建议值
    """

    try:
        prompt = f"""
用户正在填写{form_type}表单的{field_name}字段，目前已输入：{partial_value}

请根据以下内容提供智能补全建议：
1. 已输入内容的语义理解
2. 常见的补全选项
3. 基于上下文的推断

返回JSON格式：
{{
    "understanding": "对用户输入的理解",
    "suggestions": ["建议1", "建议2", "建议3"],
    "auto_complete": "自动补全的完整值"
}}
"""

        ai_response = await ai_service.chat(
            user_message=prompt,
            task_type="legal_consultation"
        )

        # 解析AI响应
        try:
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass

        return {
            "understanding": partial_value,
            "suggestions": [partial_value],
            "auto_complete": partial_value
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"智能补全失败: {str(e)}")