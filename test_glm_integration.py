#!/usr/bin/env python3
"""
GLM API集成测试脚本
验证AI服务是否正常工作
"""

import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))

from app.core.ai_service import get_ai_service
from app.config import settings


async def test_glm_integration():
    """测试GLM API集成"""

    print("🚀 开始测试GLM API集成...")
    print(f"📋 当前AI模式: {settings.AI_MODE}")
    print(f"🤖 GLM模型: {settings.GLM_MODEL}")
    print(f"🔑 API已配置: {bool(settings.GLM_API_KEY)}")
    print("-" * 50)

    ai_service = get_ai_service()

    # 测试1: 简单对话
    print("🧪 测试1: 简单法律对话")
    try:
        response = await ai_service.chat(
            user_message="什么是合同纠纷？",
            task_type="legal_consultation"
        )
        print(f"✅ 对话测试成功!")
        print(f"📝 AI回复: {response[:100]}...")
        print()
    except Exception as e:
        print(f"❌ 对话测试失败: {e}")
        print()

    # 测试2: 案件分析
    print("🧪 测试2: 案件分析")
    try:
        case_info = {
            "case_name": "张三诉李四借款纠纷案",
            "case_type": "民事",
            "case_amount": 50000,
            "case_brief": "被告借款5万元未还"
        }

        prompt = f"请分析以下案件：{case_info['case_brief']}，类型：{case_info['case_type']}，金额：{case_info['case_amount']}元"

        response = await ai_service.chat(
            user_message=prompt,
            task_type="case_analysis"
        )
        print(f"✅ 案件分析测试成功!")
        print(f"📝 AI分析: {response[:150]}...")
        print()
    except Exception as e:
        print(f"❌ 案件分析测试失败: {e}")
        print()

    # 测试3: 文书生成
    print("🧪 测试3: 起诉状生成")
    try:
        prompt = "请帮我起草一份简单的借款纠纷起诉状模板，原告张三，被告李四，借款金额5万元"

        response = await ai_service.chat(
            user_message=prompt,
            task_type="document_generation"
        )
        print(f"✅ 文书生成测试成功!")
        print(f"📝 生成文书: {response[:150]}...")
        print()
    except Exception as e:
        print(f"❌ 文书生成测试失败: {e}")
        print()

    # 测试4: 证据评估
    print("🧪 测试4: 证据评估")
    try:
        prompt = "我有借条一张和转账记录截图，请问这些证据是否充分？"

        response = await ai_service.chat(
            user_message=prompt,
            task_type="evidence_evaluation"
        )
        print(f"✅ 证据评估测试成功!")
        print(f"📝 评估结果: {response[:100]}...")
        print()
    except Exception as e:
        print(f"❌ 证据评估测试失败: {e}")
        print()

    print("=" * 50)
    print("🎉 GLM API集成测试完成!")
    print()


async def test_api_endpoints():
    """测试API端点（需要服务器运行）"""
    print("🌐 测试API端点...")
    print("请确保后端服务器正在运行: python -m uvicorn app.main:app --reload")
    print("然后访问:")
    print("  - Swagger UI: http://localhost:5000/docs")
    print("  - 测试端点: POST http://localhost:5000/api/v2/ai-test/test-glm")
    print()


if __name__ == "__main__":
    print("🔧 GLM API集成测试工具")
    print("=" * 50)
    print()

    # 运行基础测试
    asyncio.run(test_glm_integration())

    # 显示API测试说明
    asyncio.run(test_api_endpoints())

    print("💡 提示:")
    print("1. 如果测试失败，请检查GLM API Key是否正确")
    print("2. 确保网络连接正常，能够访问open.bigmodel.cn")
    print("3. 查看详细错误信息进行调试")
    print()