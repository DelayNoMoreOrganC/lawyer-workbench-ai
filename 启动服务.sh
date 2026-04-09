#!/bin/bash

# 律师工作台AI应用 - 启动服务脚本

PROJECT_ROOT="/Users/juno/Downloads/lawyer-workbench-ai-main"
SERVER_dir="$PROJECT_ROOT/server"
client_dir="$PROJECT_ROOT/client"

# 颜色定义
GREEN='\033[0m'
NC='\033[0m'
BOLD='\033[1m'
BLUE='\033[34m'

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}   律师工作台AI应用 - 启动脚本${nc}"
echo -e "${green}====================================${nc}"
echo ""

# 启动后端服务
echo -e "${BOLD}正在启动后端服务 (端口 5000)...${nc}"
osascript -e "tell application \"Terminal\" to do script \"cd \\\"'\"$server_dir"'/server\" && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"'

sleep 3
 echo -e "${GREEN}✅ 后端服务已启动${nc}"
 echo ""

# 启动前端服务
 echo -e "${Bold}正在启动前端服务 (端口 3003)...${nc}"
osascript -e "tell application "Terminal" to do script \"cd \\\"'\"$client_dir"'/client\" && npm run dev -- --port 3003"'

sleep 5
 echo ""
echo -e "${GREEN}====================================${nc}"
echo -e "${green}  🎉 启动完成！${nc}"
echo -e "${GREEN}====================================${nc}"
echo ""
echo -e "${blue}📋 访问地址:${nc}"
echo -e "  前端: ${GREEN}http://localhost:3003${nc}"
echo -e "  后端: ${GREEN}http://localhost:5000${nc}"
echo -e "  API文档: ${GREEN}http://localhost:5000/docs${nc}"
echo ""
echo -e "${blue}🔐 登录信息:${nc}"
echo -e "  用户名: ${GREEN}001${nc}"
echo -e "  密码: ${GREEN}001${nc}"
echo ""
