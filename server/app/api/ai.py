from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field
from app.core.database import get_db
from app.models.case import Case
from app.config import settings
import httpx

router = APIRouter()

class SearchRequest(BaseModel):
    query: str = Field(..., description="搜索查询")
    context: Optional[str] = Field("", description="搜索上下文")

class ChatRequest(BaseModel):
    messages: List[dict] = Field(..., description="对话消息列表")


@router.get("/status")
async def get_ai_status():
    """获取AI状态"""
    try:
        # 测试DeepSeek连接
        deepseek_available = False
        if settings.DEEPSEEK_API_KEY:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        settings.DEEPSEEK_API_URL,
                        headers={"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"},
                        timeout=5.0
                    )
                    deepseek_available = response.status_code == 200
            except:
                pass

        # 测试Ollama连接
        ollama_available = False
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.OLLAMA_BASE_URL}/api/tags",
                    timeout=3.0
                )
                ollama_available = response.status_code == 200
        except:
            pass

        # 确定健康状态
        if settings.AI_MODE == "ollama":
            healthy = ollama_available
        elif settings.AI_MODE == "deepseek":
            healthy = deepseek_available
        else:
            healthy = ollama_available or deepseek_available

        return {
            "mode": settings.AI_MODE,
            "healthy": healthy,
            "available_modes": ["deepseek", "ollama"],
            "deepseek_configured": bool(settings.DEEPSEEK_API_KEY),
            "deepseek_available": deepseek_available,
            "ollama_available": ollama_available
        }
    except Exception as e:
        return {
            "mode": settings.AI_MODE,
            "healthy": False,
            "available_modes": ["deepseek", "ollama"],
            "deepseek_configured": bool(settings.DEEPSEEK_API_KEY),
            "ollama_available": False
        }


@router.put("/backend")
async def switch_backend(backend: str):
    """切换AI后端"""
    if backend not in ["deepseek", "ollama"]:
        raise HTTPException(status_code=400, detail="无效的AI后端模式")
    # TODO: 实现模式切换 - 需要修改配置并重启
    return {"message": "模式切换功能开发中", "mode": backend}


@router.post("/chat")
async def chat_ai(messages: List[dict]):
    """AI对话"""
    try:
        if settings.AI_MODE == "ollama":
            # 使用Ollama
            async with httpx.AsyncClient() as client:
                # 构建对话prompt
                prompt = ""
                for msg in messages:
                    if msg["role"] == "user":
                        prompt += f"用户: {msg['content']}\n"
                    elif msg["role"] == "assistant":
                        prompt += f"助手: {msg['content']}\n"

                prompt += "助手: "

                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=60.0
                )
                if response.status_code == 200:
                    result = response.json()
                    return {"response": result.get("response", "")}

        elif settings.AI_MODE == "deepseek" and settings.DEEPSEEK_API_KEY:
            # 使用DeepSeek
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.DEEPSEEK_API_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.DEEPSEEK_MODEL,
                        "messages": messages
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    result = response.json()
                    return {"response": result["choices"][0]["message"]["content"]}

        # 默认响应
        return {
            "response": f"AI服务当前模式: {settings.AI_MODE}。请检查AI配置页面确保服务可用。"
        }
    except Exception as e:
        return {"response": f"AI服务暂时不可用: {str(e)}"}


@router.post("/search")
async def smart_search(request: SearchRequest, db: Session = Depends(get_db)):
    """智能搜索"""
    try:
        # 简单的关键词搜索，等待AI集成
        cases_query = db.query(Case)

        # 基本的搜索逻辑
        if request.query:
            cases_query = cases_query.filter(
                Case.debtor_name.contains(request.query) |
                Case.trial_case_number.contains(request.query) |
                Case.execution_case_number.contains(request.query)
            )

        cases = cases_query.limit(10).all()

        # 转换结果为字典格式
        results = []
        for case in cases:
            results.append({
                "id": case.id,
                "debtor_name": case.debtor_name,
                "stage": case.stage,
                "sub_stage": case.sub_stage,
                "trial_case_number": case.trial_case_number,
                "execution_case_number": case.execution_case_number
            })

        return {
            "results": results,
            "query": request.query,
            "total": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ocr/summons")
async def ocr_summons(file: UploadFile = File(...)):
    """OCR识别传票"""
    # TODO: 集成OCR识别
    return {
        "success": True,
        "data": {
            "case_number": "(2025)粤0604民初1234号",
            "court_name": "佛山市禅城区人民法院",
            "defendant": "张三",
            "plaintiff": "工商银行",
            "hearing_date": "2025-04-15",
            "hearing_time": "09:30",
            "location": "第3审判庭",
            "case_type": "信用卡纠纷",
            "judge": "李法官"
        }
    }


@router.post("/analyze/document")
async def analyze_document(document_id: int, db: Session = Depends(get_db)):
    """分析文档"""
    # TODO: 集成文档分析
    return {
        "result": "文档分析功能开发中。请先配置AI服务以使用此功能。",
        "document_id": document_id
    }


@router.post("/predict/todos")
async def predict_todos(case_id: int, db: Session = Depends(get_db)):
    """预测待办事项"""
    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail="案件不存在")

        # 基于案件状态生成简单待办建议
        todos = []

        if case.stage == "litigation":
            if case.sub_stage == "审理中":
                todos.append({
                    "id": 1,
                    "title": "准备开庭材料",
                    "priority": "high",
                    "due_date": case.litigation_filing_date
                })
                todos.append({
                    "id": 2,
                    "title": "联系当事人确认诉讼请求",
                    "priority": "medium",
                    "due_date": case.litigation_filing_date
                })
            elif case.sub_stage == "已判决":
                todos.append({
                    "id": 3,
                    "title": "申请执行",
                    "priority": "high",
                    "due_date": case.judgment_date
                })
        elif case.stage == "executing":
            todos.append({
                "id": 4,
                "title": "查询被执行人财产",
                "priority": "high",
                "due_date": case.execution_filing_date
            })

        return {"todos": todos}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
