"""
智能建档API
从客户材料自动提取信息并生成案件档案
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
from datetime import datetime, timedelta
from app.core.ai_service import get_ai_service
from app.core.legal_prompts import get_legal_system_prompt
import re

router = APIRouter()
ai_service = get_ai_service()


class SmartIntakeRequest(BaseModel):
    """智能建档请求"""
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_notes: Optional[str] = None
    materials: Optional[str] = None  # 客户提供的材料描述


class AutoFilledCase(BaseModel):
    """AI自动填充的案件信息"""
    case_name: str
    case_type: str
    case_status: str
    plaintiff: Dict[str, Any]
    defendant: Dict[str, Any]
    case_amount: float
    court_name: str
    filing_date: Optional[str]
    hearing_date: Optional[str]
    case_brief: str
    priority: int
    tags: str
    confidence: float  # AI置信度
    auto_scheduled_tasks: List[Dict[str, Any]]  # AI自动识别的任务


@router.post("/analyze-materials", response_model=AutoFilledCase)
async def analyze_client_materials(request: SmartIntakeRequest):
    """
    分析客户材料，自动提取案件信息

    Args:
        request: 包含客户提供的材料信息

    Returns:
        AI自动填充的案件信息
    """

    try:
        # 构建分析提示词
        analysis_prompt = f"""
作为专业的案件建档助手，请分析以下客户提供的材料，提取关键案件信息：

客户描述：{request.description or "无"}
客户备注：{request.client_notes or "无"}
材料描述：{request.materials or "无"}

请按照JSON格式返回以下信息：
{{
    "case_name": "案件名称（如：张三诉李四借款纠纷案）",
    "case_type": "案件类型（民事、刑事、行政、执行）",
    "case_status": "案件状态（draft、pending_filing、first_trial等）",
    "plaintiff": {{
        "name": "原告姓名",
        "gender": "性别",
        "age": 年龄,
        "contact": "联系方式",
        "address": "地址"
    }},
    "defendant": {{
        "name": "被告姓名",
        "contact": "联系方式",
        "address": "地址"
    }},
    "case_amount": 案件标的额（数字）,
    "court_name": "管辖法院",
    "case_brief": "案件简要描述",
    "key_facts": ["关键事实1", "关键事实2"],
    "legal_issues": ["争议焦点1", "争议焦点2"],
    "suggested_schedule": [
        {{
            "type": "开庭/期限/会议",
            "description": "具体描述",
            "date": "YYYY-MM-DD",
            "importance": "高/中/低"
        }}
    ]
}}

如果信息不足，请根据描述进行合理推断，并在对应字段标注"推断"。
"""

        # 调用GLM分析
        ai_response = await ai_service.chat(
            user_message=analysis_prompt,
            task_type="legal_analysis"
        )

        # 解析AI返回的JSON
        try:
            # 尝试提取JSON部分
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                ai_data = json.loads(json_match.group())
            else:
                raise ValueError("无法从AI响应中提取JSON")

        except json.JSONDecodeError:
            # 如果AI没有返回有效JSON，使用默认值
            ai_data = parse_case_from_text(ai_response, request)

        # 构建自动填充的案件信息
        auto_filled_case = build_auto_filled_case(ai_data, request)

        return auto_filled_case

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"智能建档分析失败: {str(e)}")


def parse_case_from_text(ai_response: str, request: SmartIntakeRequest) -> Dict:
    """从AI文本回复中解析案件信息（备用方案）"""
    return {
        "case_name": request.case_name or "待命名案件",
        "case_type": "民事",
        "case_status": "draft",
        "plaintiff": {
            "name": "待确认",
            "gender": "",
            "age": None,
            "contact": "",
            "address": ""
        },
        "defendant": {
            "name": "待确认",
            "contact": "",
            "address": ""
        },
        "case_amount": 0,
        "court_name": "待确认",
        "case_brief": ai_response[:200] if ai_response else "待完善",
        "key_facts": [],
        "legal_issues": [],
        "suggested_schedule": []
    }


def build_auto_filled_case(ai_data: Dict, request: SmartIntakeRequest) -> AutoFilledCase:
    """构建自动填充的案件信息"""

    # 提取当事人信息
    plaintiff = ai_data.get("plaintiff", {})
    defendant = ai_data.get("defendant", {})

    # 自动识别的任务/日程
    auto_scheduled_tasks = []
    suggested_schedule = ai_data.get("suggested_schedule", [])

    for item in suggested_schedule:
        task = {
            "title": item.get("description", ""),
            "task_type": item.get("type", "其他"),
            "due_date": item.get("date"),
            "priority": 3 if item.get("importance") == "高" else 2,
            "auto_generated": True,
            "reason": f"AI根据材料自动识别：{item.get('type', '相关事项')}"
        }
        auto_scheduled_tasks.append(task)

    # 根据案件信息自动推断一些任务
    case_type = ai_data.get("case_type", "")
    if case_type == "民事":
        auto_scheduled_tasks.extend([
            {
                "title": "准备立案材料",
                "task_type": "立案准备",
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "priority": 3,
                "auto_generated": True,
                "reason": "AI建议：新案件应尽快准备立案材料"
            },
            {
                "title": "联系客户确认详细信息",
                "task_type": "客户沟通",
                "due_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "priority": 2,
                "auto_generated": True,
                "reason": "AI建议：及时与客户沟通确认案件细节"
            }
        ])

    # 计算置信度
    confidence = calculate_confidence(ai_data, request)

    return AutoFilledCase(
        case_name=ai_data.get("case_name", request.case_name or "待命名案件"),
        case_type=ai_data.get("case_type", "民事"),
        case_status=ai_data.get("case_status", "draft"),
        plaintiff=plaintiff if isinstance(plaintiff, dict) else {},
        defendant=defendant if isinstance(defendant, dict) else {},
        case_amount=float(ai_data.get("case_amount", 0)),
        court_name=ai_data.get("court_name", ""),
        filing_date=ai_data.get("filing_date"),
        hearing_date=ai_data.get("hearing_date"),
        case_brief=ai_data.get("case_brief", ""),
        priority=calculate_priority(ai_data),
        tags=generate_tags(ai_data),
        confidence=confidence,
        auto_scheduled_tasks=auto_scheduled_tasks
    )


def calculate_confidence(ai_data: Dict, request: SmartIntakeRequest) -> float:
    """计算AI分析的置信度"""
    confidence = 0.5  # 基础置信度

    # 如果提供了详细描述，提高置信度
    if request.description and len(request.description) > 50:
        confidence += 0.2

    # 如果AI成功提取了关键信息
    if ai_data.get("plaintiff", {}).get("name"):
        confidence += 0.1
    if ai_data.get("defendant", {}).get("name"):
        confidence += 0.1
    if ai_data.get("case_amount", 0) > 0:
        confidence += 0.1

    return min(confidence, 0.95)


def calculate_priority(ai_data: Dict) -> int:
    """根据案件信息自动计算优先级"""
    amount = ai_data.get("case_amount", 0)

    if amount > 100000:
        return 3  # 高优先级
    elif amount > 10000:
        return 2  # 中等优先级
    else:
        return 1  # 低优先级


def generate_tags(ai_data: Dict) -> str:
    """根据案件信息生成标签"""
    tags = []

    case_type = ai_data.get("case_type", "")
    if case_type:
        tags.append(case_type)

    case_brief = ai_data.get("case_brief", "")
    if "借款" in case_brief or "借贷" in case_brief:
        tags.append("借款纠纷")
    elif "合同" in case_brief:
        tags.append("合同纠纷")
    elif "离婚" in case_brief:
        tags.append("婚姻家庭")
    elif "劳动" in case_brief:
        tags.append("劳动争议")

    return ",".join(tags) if tags else "民事纠纷"


@router.post("/quick-create")
async def quick_create_case(request: SmartIntakeRequest):
    """
    快速创建案件（一键建档）

    Args:
        request: 客户提供的材料

    Returns:
        创建的案件信息和后续步骤建议
    """

    try:
        # 1. AI分析材料
        auto_filled_case = await analyze_client_materials(request)

        # 2. 生成后续步骤建议
        next_steps = generate_next_steps(auto_filled_case)

        # 3. 返回结果
        return {
            "success": True,
            "message": "AI已自动生成案件档案",
            "case": auto_filled_case.dict(),
            "next_steps": next_steps,
            "ai_suggestions": {
                "confidence": auto_filled_case.confidence,
                "need_review": auto_filled_case.confidence < 0.8,
                "recommended_actions": [
                    "核对AI提取的当事人信息",
                    "确认案件标的额是否准确",
                    "检查AI自动识别的日程安排"
                ]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"快速创建案件失败: {str(e)}")


def generate_next_steps(case: AutoFilledCase) -> List[str]:
    """生成后续步骤建议"""
    steps = []

    if case.confidence < 0.7:
        steps.append("📝 建议联系客户补充详细信息")
        steps.append("🔍 核对AI提取的关键信息")

    if case.auto_scheduled_tasks:
        steps.append(f"📅 AI已自动创建{len(case.auto_scheduled_tasks)}个任务，请查看任务列表")

    if case.case_amount > 50000:
        steps.append("💰 案件标的较大，建议重点关注")

    if case.case_status == "draft":
        steps.append("🚀 案件状态为草稿，请准备立案材料")

    return steps


@router.post("/natural-language-intake")
async def natural_language_intake(
    text_input: str = Form(...),
    voice_file: Optional[UploadFile] = None
):
    """
    自然语言输入建档

    Args:
        text_input: 文字描述或语音转文字
        voice_file: 可选的语音文件

    Returns:
        AI解析的案件信息
    """

    try:
        # 如果有语音文件，这里应该进行语音识别
        # 目前简化处理，直接使用文本输入

        # 构建自然语言处理提示词
        nlp_prompt = f"""
作为智能律师助手，请从以下自然语言描述中提取案件信息：

"{text_input}"

请提取：
1. 当事人信息（原告、被告）
2. 案件类型
3. 标的金额
4. 关键事实
5. 客户诉求
6. 时间节点（如有的话）

请以JSON格式返回，格式同analyze-materials接口。
"""

        ai_response = await ai_service.chat(
            user_message=nlp_prompt,
            task_type="legal_analysis"
        )

        # 解析并返回案件信息
        request = SmartIntakeRequest(
            description=text_input,
            client_notes="自然语言输入"
        )

        return await analyze_client_materials(request)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"自然语言建档失败: {str(e)}")