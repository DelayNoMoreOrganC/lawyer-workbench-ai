#!/usr/bin/env python3
"""
测试GLM-5.1模型性能
"""

import asyncio
import httpx
import json


async def test_glm_5_1():
    """测试GLM-5.1模型"""

    print("🚀 测试GLM-5.1最新模型...")
    print("=" * 50)

    api_key = "84c4d1dc55e24ae897a41310cc04b36b.t1LLx5SfmxOqe1qk"
    api_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    model = "glm-5.1"

    print(f"🤖 使用模型: {model}")
    print(f"🔑 API Key: {api_key[:20]}...")
    print("-" * 50)

    # 测试案件分析
    messages = [
        {
            "role": "system",
            "content": "你是一位资深法律专家，具有丰富的实务经验。请对案件进行深度专业分析。"
        },
        {
            "role": "user",
            "content": """请分析以下复杂案件：

案件背景：某科技公司（甲方）与某软件开发商（乙方）签订软件开发合同，合同金额500万元。项目进行到70%时，甲方发现软件存在重大缺陷，要求整改。乙方认为已按合同要求完成，拒绝无偿整改。

争议焦点：
1. 软件质量是否符合合同标准
2. 甲方是否有权拒绝支付剩余30%款项
3. 乙方是否构成违约
4. 损失赔偿如何计算

请作为甲方代理律师，提供详细的法律分析和诉讼策略建议。"""
        }
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000
    }

    print("📤 发送复杂案件分析请求...")
    print()

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)

            print(f"📡 响应状态码: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print("✅ GLM-5.1调用成功!")
                print()

                ai_response = result["choices"][0]["message"]["content"]

                print("📝 GLM-5.1案件分析:")
                print("=" * 50)
                print(ai_response)
                print("=" * 50)
                print()

                # Token使用情况
                if "usage" in result:
                    usage = result["usage"]
                    print("📊 Token使用情况:")
                    print(f"   输入tokens: {usage.get('prompt_tokens', 'N/A')}")
                    print(f"   输出tokens: {usage.get('completion_tokens', 'N/A')}")
                    print(f"   总计tokens: {usage.get('total_tokens', 'N/A')}")

                return True
            else:
                print(f"❌ GLM-5.1调用失败: {response.text}")
                return False

    except Exception as e:
        print(f"❌ 测试错误: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_glm_5_1())