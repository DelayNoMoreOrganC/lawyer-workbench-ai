"""
AI服务模块 - 集成多个AI模型提供商
支持GLM、DeepSeek、Ollama等多种AI模型
"""

import httpx
import json
from typing import List, Dict, Optional, Any
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class AIService:
    """AI服务统一接口"""

    def __init__(self):
        self.timeout = 30.0  # API超时时间

    async def call_ai(
        self,
        messages: List[Dict[str, str]],
        task_type: str = "general",
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> str:
        """
        调用AI模型生成回复

        Args:
            messages: 对话消息列表
            task_type: 任务类型 (legal_analysis, document_generation, chat等)
            temperature: 温度参数，控制随机性
            max_tokens: 最大生成token数
            **kwargs: 其他参数

        Returns:
            AI生成的回复文本
        """
        # 根据任务类型选择最适合的AI模型
        ai_mode = self._select_ai_model(task_type)

        try:
            if ai_mode == "glm":
                return await self._call_glm(messages, temperature, max_tokens, **kwargs)
            elif ai_mode == "deepseek":
                return await self._call_deepseek(messages, temperature, max_tokens, **kwargs)
            elif ai_mode == "ollama":
                return await self._call_ollama(messages, temperature, max_tokens, **kwargs)
            else:
                raise ValueError(f"不支持的AI模式: {ai_mode}")

        except Exception as e:
            logger.error(f"AI调用失败: {str(e)}")
            # 如果主AI失败，尝试备用AI
            return await self._call_backup_ai(messages, task_type, temperature, max_tokens, **kwargs)

    def _select_ai_model(self, task_type: str) -> str:
        """根据任务类型选择最适合的AI模型"""
        # 法律相关任务优先使用GLM
        legal_tasks = ["legal_analysis", "document_generation", "case_analysis",
                      "evidence_evaluation", "legal_consultation"]

        if task_type in legal_tasks:
            if settings.GLM_API_KEY:  # 如果配置了GLM，优先使用
                return "glm"
            elif settings.DEEPSEEK_API_KEY:
                return "deepseek"

        # 代码和分析任务可以使用DeepSeek
        code_tasks = ["code_generation", "data_analysis"]
        if task_type in code_tasks and settings.DEEPSEEK_API_KEY:
            return "deepseek"

        # 默认使用配置的AI模式
        return settings.AI_MODE

    async def _call_glm(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> str:
        """调用GLM API"""
        if not settings.GLM_API_KEY:
            raise ValueError("GLM API Key未配置")

        headers = {
            "Authorization": f"Bearer {settings.GLM_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.GLM_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": 0.9,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                settings.GLM_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()

            # 解析GLM API响应
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"].strip()
            else:
                raise ValueError("GLM API返回格式异常")

    async def _call_deepseek(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> str:
        """调用DeepSeek API"""
        if not settings.DEEPSEEK_API_KEY:
            raise ValueError("DeepSeek API Key未配置")

        headers = {
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.DEEPSEEK_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                settings.DEEPSEEK_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()

            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"].strip()
            else:
                raise ValueError("DeepSeek API返回格式异常")

    async def _call_ollama(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> str:
        """调用本地Ollama模型"""
        headers = {"Content-Type": "application/json"}

        # 将消息格式转换为Ollama格式
        prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])

        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "Ollama响应异常").strip()

        except httpx.ConnectError:
            raise ValueError("无法连接到Ollama服务，请确保Ollama正在运行")

    async def _call_backup_ai(
        self,
        messages: List[Dict[str, str]],
        task_type: str,
        temperature: float,
        max_tokens: int,
        **kwargs
    ) -> str:
        """备用AI调用"""
        # 尝试其他可用的AI模型
        if settings.AI_MODE != "deepseek" and settings.DEEPSEEK_API_KEY:
            logger.info("主AI失败，尝试使用DeepSeek备用")
            try:
                return await self._call_deepseek(messages, temperature, max_tokens, **kwargs)
            except Exception as e:
                logger.error(f"DeepSeek备用调用也失败: {str(e)}")

        if settings.AI_MODE != "ollama":
            logger.info("尝试使用Ollama作为最后备用")
            try:
                return await self._call_ollama(messages, temperature, max_tokens, **kwargs)
            except Exception as e:
                logger.error(f"Ollama备用调用也失败: {str(e)}")

        # 所有AI都失败，返回默认回复
        return "抱歉，AI服务暂时不可用，请稍后重试。"

    async def chat(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        system_prompt: Optional[str] = None,
        task_type: str = "chat"
    ) -> str:
        """
        简化的聊天接口

        Args:
            user_message: 用户消息
            conversation_history: 对话历史
            system_prompt: 系统提示词
            task_type: 任务类型

        Returns:
            AI回复
        """
        messages = []

        # 添加系统提示词
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        else:
            messages.append({"role": "system", "content": self._get_default_system_prompt()})

        # 添加对话历史
        if conversation_history:
            messages.extend(conversation_history[-10:])  # 限制历史记录数量

        # 添加当前用户消息
        messages.append({"role": "user", "content": user_message})

        return await self.call_ai(messages, task_type=task_type)

    def _get_default_system_prompt(self) -> str:
        """获取默认的系统提示词"""
        return """你是一个专业的律师工作台AI助手，具有深厚的法律知识和丰富的实践经验。

你的主要职责包括：
1. 提供准确的法律咨询和建议
2. 协助起草和审查法律文书
3. 分析案件证据和法律风险
4. 提供诉讼策略建议
5. 解答法律程序问题

请始终：
- 保持专业、客观的态度
- 基于现行法律法规回答问题
- 对于不确定的问题，明确说明
- 保护用户隐私和信息安全
- 建议重大事项咨询专业律师

请用简洁、专业的方式回答问题。"""


# 全局AI服务实例
ai_service = AIService()


def get_ai_service() -> AIService:
    """获取AI服务实例"""
    return ai_service