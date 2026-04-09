#!/bin/bash

set -e

🚀 启动律师工作台AI应用"
PROJECT_ROOT="/Users/juno/Downloads/lawyer-workbench-ai-main"
SERVER_DIR="$PROJECT_ROOT/server"
client_dir="$PROJECT_ROOT/client"

# 颜色
GREEN='\033[0m'
YELLOW='\033[33m'
RED='\033[31m'

echo -e "${GREEN}====================================${nc}"
echo -e "${GREEN}  启动律师工作台AI应用${nc}"
echo -e "${green}====================================${nc}"
echo ""

# 启动后端
echo -e "${yellow}正在启动后端服务 (端口 5000)...${nc}"
cd "$server_dir"
osascript -e 'tell application "Terminal" to do script "cd \"'"$server_dir"'/server\" && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"'

sleep 3
echo -e "${green}✅ 后端服务已在新终端窗口启动${nc}"
echo ""

# 启动前端
echo -e "${yellow}正在启动前端服务 (端口 3003)...${nc}"
cd "$client_dir"
osascript -e 'tell application "Terminal" to do script "cd \"'"$client_dir"'/client\" && npm run dev -- --port 3003"'

sleep 3
echo ""
echo -e "${green}✅ 启动完成！${nc}"
echo ""
echo -e "${yellow}访问地址:${nc}"
echo "   前端: ${green}http://localhost:3003${nc}"
echo "   后端: ${green}http://localhost:5000${nc}"
echo "   API文档: ${green}http://localhost:5000/docs${nc}"
echo ""
echo -e "${yellow}登录信息:${nc}"
echo "   用户名: ${green}001${nc}"
echo "   密码: ${green}001${nc}"
