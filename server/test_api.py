#!/usr/bin/env python3
"""
API接口测试脚本
用于验证新增的财务管理、客户管理API是否正常工作
"""
import requests
import json

BASE_URL = "http://localhost:5000/api/v2"

def test_api():
    print("=" * 60)
    print("开始测试新增API接口...")
    print("=" * 60)

    # 测试根路由
    try:
        response = requests.get(f"{BASE_URL.replace('/api/v2', '')}/")
        if response.status_code == 200:
            print("✅ 后端服务连接成功")
            print(f"   响应: {response.json()}")
        else:
            print(f"❌ 后端服务连接失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法连接到后端服务: {str(e)}")
        print("💡 请确保后端服务已启动: python3 -m uvicorn app.main:app --port 5000")
        return False

    # 测试财务管理API
    print("\n📊 测试财务管理API...")
    try:
        response = requests.get(f"{BASE_URL}/finance/expenses")
        if response.status_code == 200:
            expenses = response.json()
            print(f"✅ 获取费用列表成功: {len(expenses)} 条记录")
        else:
            print(f"⚠️  获取费用列表: {response.status_code}")
    except Exception as e:
        print(f"❌ 财务API测试失败: {str(e)}")

    # 测试客户管理API
    print("\n👥 测试客户管理API...")
    try:
        response = requests.get(f"{BASE_URL}/customers/")
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ 获取客户列表成功: {len(customers)} 个客户")
        else:
            print(f"⚠️  获取客户列表: {response.status_code}")
    except Exception as e:
        print(f"❌ 客户API测试失败: {str(e)}")

    print("\n" + "=" * 60)
    print("🎉 API测试完成！")
    print("=" * 60)
    print("\n💡 接下来可以:")
    print("   1. 启动前端: cd client_new && npm run dev")
    print("   2. 访问系统: http://localhost:3000")
    print("   3. 测试新增的功能模块")

if __name__ == "__main__":
    test_api()
