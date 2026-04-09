#!/usr/bin/env python3
import requests
import json

# DeepSeek API配置
API_KEY = "sk-31a4bc8466494d058889dc634d058dee"
BASE_URL = "https://api.deepseek.com"
MODEL = "deepseek-chat"

def test_deepseek():
    """测试DeepSeek API连接"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-type": "application/json"
    }
    
    # 测试聊天API
    url = f"{BASE_URL}/chat/completions"
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": "你好"}
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        result = response.json()
        print("✅ API测试成功!")
        print("返回状态码:", response.status_code)
        if "choices" in result and len(result["choices"]) > 0:
            content = result["choices"][0].get("message", {}).get("content", "")
            print("AI回复:", content)
        return True
    except Exception as e:
        print(f"❌ API测试失败: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("测试DeepSeek API连接")
    print("=" * 60)
    print(f"API密钥: {API_KEY[:10]}...")
    print(f"Base URL: {BASE_URL}")
    print(f"Model: {MODEL}")
    print("=" * 60)
    
    if test_deepseek():
        print("\n✅ DeepSeek API配置正确，可以使用!")
    else:
        print("\n❌ DeepSeek API配置有问题，请检查")
