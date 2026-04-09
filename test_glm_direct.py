#!/usr/bin/env python3
"""
GLM API直接测试脚本
不依赖应用配置，直接测试GLM API连接
"""

import asyncio
import httpx
import json


async def test_glm_api_direct():
    """直接测试GLM API"""

    print("🚀 直接测试GLM API...")
    print("=" * 50)

    # GLM API配置
    api_key = "84c4d1dc55e24ae897a41310cc04b36b.t1LLx5SfmxOqe1qk"
    api_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    model = "glm-4-flash"

    print(f"🔑 API Key: {api_key[:20]}...")
    print(f"🌐 API URL: {api_url}")
    print(f"🤖 Model: {model}")
    print("-" * 50)

    # 测试消息
    messages = [
        {"role": "system", "content": "你是一个专业的法律助手，请简要回答法律问题。"},
        {"role": "user", "content": "什么是合同纠纷？请用一句话解释。"}
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500,
        "top_p": 0.9
    }

    print("📤 发送请求到GLM API...")
    print(f"📝 测试问题: {messages[1]['content']}")
    print()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                api_url,
                headers=headers,
                json=payload
            )

            print(f"📡 响应状态码: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print("✅ GLM API调用成功!")
                print()

                if "choices" in result and len(result["choices"]) > 0:
                    ai_response = result["choices"][0]["message"]["content"]
                    print("🤖 GLM回复:")
                    print(f"   {ai_response}")
                    print()

                # 显示完整响应用于调试
                print("📋 完整响应:")
                print(json.dumps(result, indent=2, ensure_ascii=False))
                print()

                # 显示token使用情况
                if "usage" in result:
                    usage = result["usage"]
                    print("📊 Token使用情况:")
                    print(f"   输入tokens: {usage.get('prompt_tokens', 'N/A')}")
                    print(f"   输出tokens: {usage.get('completion_tokens', 'N/A')}")
                    print(f"   总计tokens: {usage.get('total_tokens', 'N/A')}")

                return True
            else:
                print(f"❌ GLM API调用失败!")
                print(f"响应内容: {response.text}")
                return False

    except httpx.ConnectError:
        print("❌ 网络连接失败!")
        print("请检查:")
        print("1. 网络连接是否正常")
        print("2. 是否可以访问 open.bigmodel.cn")
        print("3. 防火墙或代理设置")
        return False

    except httpx.TimeoutException:
        print("❌ 请求超时!")
        print("GLM API响应时间过长，请稍后重试")
        return False

    except Exception as e:
        print(f"❌ 发生错误: {e}")
        return False


async def test_legal_analysis():
    """测试法律分析功能"""

    print("🧪 测试法律分析功能...")
    print("-" * 50)

    api_key = "84c4d1dc55e24ae897a41310cc04b36b.t1LLx5SfmxOqe1qk"
    api_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

    messages = [
        {
            "role": "system",
            "content": "你是一位资深的法律专家，精通各类案件分析。请对案件进行专业、客观的分析。"
        },
        {
            "role": "user",
            "content": """请分析以下案件：

案件名称：张三诉李四借款合同纠纷案
案件类型：民事纠纷
案件标的：5万元
基本事实：被告李四于2024年3月向原告张三借款5万元，约定月息2%，期限6个月。到期后被告未按约定还款，原告多次催收未果。

请从以下方面进行分析：
1. 法律关系认定
2. 主要争议焦点
3. 证据要求
4. 诉讼风险
5. 胜诉可能性评估"""
        }
    ]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "glm-4-flash",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1500
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)

            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]

                print("✅ 法律分析测试成功!")
                print()
                print("📝 AI案件分析:")
                print(ai_response)
                print()

                return True
            else:
                print(f"❌ 法律分析测试失败: {response.text}")
                return False

    except Exception as e:
        print(f"❌ 法律分析测试错误: {e}")
        return False


async def main():
    """主测试函数"""

    print("🔧 GLM API集成测试工具")
    print("=" * 50)
    print()

    # 基础连接测试
    basic_test = await test_glm_api_direct()

    print()
    print("=" * 50)
    print()

    # 法律分析测试
    if basic_test:
        await test_legal_analysis()

    print()
    print("=" * 50)
    print("🎉 测试完成!")
    print()


if __name__ == "__main__":
    asyncio.run(main())