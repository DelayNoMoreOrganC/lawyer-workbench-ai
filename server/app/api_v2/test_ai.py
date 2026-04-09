"""
AI服务测试接口
用于验证GLM API集成是否正常工作
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.ai_service import get_ai_service
from app.config import settings

router = APIRouter()
ai_service = get_ai_service()


class TestRequest(BaseModel):
    message: str


class TestResponse(BaseModel):
    success: bool
    message: str
    ai_response: str
    ai_mode: str
    model_info: dict


@router.post("/test-glm", response_model=TestResponse)
async def test_glm_api(request: TestRequest):
    """
    测试GLM API连接和响应

    Args:
        request: 包含测试消息的请求

    Returns:
        测试结果，包含AI响应
    """

    try:
        # 测试简单的对话
        ai_response = await ai_service.chat(
            user_message=request.message,
            task_type="legal_consultation"
        )

        return TestResponse(
            success=True,
            message="GLM API测试成功",
            ai_response=ai_response,
            ai_mode=settings.AI_MODE,
            model_info={
                "provider": "智谱AI (GLM)",
                "model": settings.GLM_MODEL,
                "api_configured": bool(settings.GLM_API_KEY)
            }
        )

    except Exception as e:
        return TestResponse(
            success=False,
            message=f"GLM API测试失败: {str(e)}",
            ai_response="",
            ai_mode=settings.AI_MODE,
            model_info={
                "provider": "智谱AI (GLM)",
                "model": settings.GLM_MODEL,
                "api_configured": bool(settings.GLM_API_KEY),
                "error": str(e)
            }
        )


@router.get("/ai-config")
async def get_ai_config():
    """
    获取当前AI配置信息（不暴露敏感信息）
    """

    return {
        "ai_mode": settings.AI_MODE,
        "glm": {
            "configured": bool(settings.GLM_API_KEY),
            "model": settings.GLM_MODEL,
            "api_url": settings.GLM_API_URL
        },
        "deepseek": {
            "configured": bool(settings.DEEPSEEK_API_KEY),
            "model": settings.DEEPSEEK_MODEL
        },
        "ollama": {
            "configured": True,  # Ollama是本地服务，不需要API Key
            "model": settings.OLLAMA_MODEL,
            "base_url": settings.OLLAMA_BASE_URL
        }
    }


@router.post("/test-legal-analysis")
async def test_legal_analysis():
    """
    测试法律分析功能

    Returns:
        法律分析测试结果
    """

    try:
        test_case = {
            "case_name": "张三诉李四借款合同纠纷案",
            "case_type": "民事",
            "case_amount": 50000,
            "case_brief": "被告向原告借款50000元未还，原告起诉要求还款",
            "court_name": "北京市朝阳区人民法院"
        }

        # 构建分析提示词
        analysis_prompt = f"请分析以下案件：{test_case['case_brief']}，案件类型：{test_case['case_type']}，标的额：{test_case['case_amount']}元。请从法律关系、争议焦点、证据要求、风险分析等方面进行专业分析。"

        # 调用AI分析
        ai_analysis = await ai_service.chat(
            user_message=analysis_prompt,
            task_type="case_analysis"
        )

        return {
            "success": True,
            "test_case": test_case,
            "ai_analysis": ai_analysis,
            "analysis_length": len(ai_analysis),
            "model_used": settings.GLM_MODEL
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"法律分析测试失败: {str(e)}")


@router.post("/test-document-generation")
async def test_document_generation():
    """
    测试文书生成功能

    Returns:
        文书生成测试结果
    """

    try:
        # 测试起诉状生成
        case_info = {
            "plaintiff_name": "张三",
            "defendant_name": "李四",
            "case_type": "借款合同纠纷",
            "amount": 50000,
            "court": "北京市朝阳区人民法院",
            "facts": "被告于2024年3月向原告借款5万元，约定6个月归还，但到期未还"
        }

        # 构建文书生成提示词
        doc_prompt = f"请根据以下信息起草一份民事起诉状：原告{case_info['plaintiff_name']}，被告{case_info['defendant_name']}，案由{case_info['case_type']}，诉讼请求金额{case_info['amount']}元，管辖法院{case_info['court']}，基本事实：{case_info['facts']}。请按照标准格式起草起诉状。"

        # 调用AI生成文书
        ai_document = await ai_service.chat(
            user_message=doc_prompt,
            task_type="document_generation"
        )

        return {
            "success": True,
            "case_info": case_info,
            "generated_document": ai_document,
            "document_length": len(ai_document),
            "model_used": settings.GLM_MODEL
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文书生成测试失败: {str(e)}")