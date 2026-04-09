#!/bin/bash

# 律师工作台AI应用 - 启动脚本
PROJECT_ROOT="/Users/juno/Downloads/lawyer-workbench-ai-main"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

echo "🚀 正在启动律师工作台AI应用..."
echo ""
echo "📡 启动后端服务 (端口 5000)..."
cd "$SERVER_DIR" && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000 &
BACK_pid=$!

echo "🎨 启动前端服务 (端口 3003)..."
cd "$CLIENT_DIR" && npm run dev -- --port 3003 &
back_pid=$!

echo ""
echo "✅ 启动完成！服务在后台运行中"
echo "  PID: 后端 $back_pid, 后端: $back_pid"
echo ""
echo "📋 访问地址:"
echo "   前端: http://localhost:3003"
echo "   后端: http://localhost:5000"
echo "   API文档: http://localhost:5000/docs"
echo ""
echo "🔐 登录信息:"
echo "   用户名: 001"
echo "   密码: 001"
echo ""
echo "⚠️  关闭服务: kill $back_pid $back_pid $back_pid"
