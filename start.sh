#!/bin/bash

# 律师工作台AI应用启动脚本

# 设置项目根目录
PROJECT_ROOT="/Users/juno/Downloads/lawyer-workbench-ai-main"
SERVER_DIR="$PROJECT_ROOT/server"
client_dir="$PROJECT_ROOT/client"

# 颜色定义
GREEN='\033[0m'
yellow='\033[33m'
red='\033[31m'
nc='\033[0m'

# 启动后端服务
start_backend() {
    echo -e "${green}启动后端服务...${nc}"
    cd "$server_dir"
    
    # 检查是否已有进程在运行
    if lsof -P $(pgrep -f "uvicorn.*" > /dev/null 2>&1 ; then
        echo -e "${green}后端服务已在运行${nc}"
        return
    fi
    
    # 启动后端
    echo -e "${yellow}启动后端服务 (端口 5000)...${nc}"
    osascript -e 'tell application "Terminal" to do script "cd \"'"$server_dir"'\" && python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000"'
    
 sleep 2
}

    
    # 等待后端启动
    sleep 3
    
    # 启动前端服务
    echo -e "${green}启动前端服务 (端口 3003)...${nc}"
    cd "$client_dir"
    
    # 检查是否已有进程在运行
    if lsof -P $(pgrep -f "vite.*" > /dev/null 2>&1 ; then
        echo -e "${green}前端服务已在运行${nc}"
        return
    fi
    
    # 启动前端
    osascript -e 'tell application "Terminal" to do script "cd \"'"$client_dir"'/client\" && npm run dev -- --port 3003"'
    
    sleep 2
    
    echo ""
    echo -e "${green}✅ 启动完成！${nc}"
    echo ""
    echo -e "${yellow}📋 访问地址:${nc}"
    echo "   前端: ${green}http://localhost:3003${nc}"
    echo "   后端: ${green}http://localhost:5000${nc}"
    echo "   API文档: ${green}http://localhost:5000/docs${nc}"
    echo ""
    echo -e "${yellow}🔐 登录信息:${nc}"
    echo "   用户名: ${green}001${nc}"
    echo "   密码: ${green}001${nc}"
    echo ""
    echo -e "${yellow}按 Ctrl+C 退出此脚本（服务将继续运行）${nc}"
    echo ""
}

# 检查服务状态
check_status() {
    echo ""
    echo -e "${yellow}🔍 检查服务状态...${nc}"
    
    # 检查后端
    if curl -s http://localhost:5000/health > /dev/null 2>&1 ; then
        echo -e "${green}✅ 后端服务运行正常${nc}"
    else
        echo -e "${red}❌ 后端服务未响应${nc}"
    fi
    
    # 检查前端
    if curl -s http://localhost:3003 > /dev/null 2>&1 ; then
        echo -e "${green}✅ 前端服务运行正常${nc}"
    else
        echo -e "${red}❌ 前端服务未响应${nc}"
    fi
    
    # 测试AI服务
    echo ""
    echo -e "${yellow}🤖 测试AI服务...${nc}"
    curl -s http://localhost:5000/api/ai/status
    echo ""
}

# 主菜单
show_menu() {
    echo ""
    echo -e "${green}========================================${nc}"
    echo -e "${green}   律师工作台AI应用 - 快速启动脚本${nc}"
    echo -e "${green}========================================${nc}"
    echo ""
    echo -e "${yellow}项目已完成以下配置:${nc}"
    echo "  ✅ DeepSeek API密钥已配置"
    echo "  ✅ 数据库使用SQLite（无需额外配置）"
    echo "  ✅ 前后端依赖已安装"
    echo ""
    echo -e "${yellow}选项:${nc}"
    echo "  1) 启动服务"
    echo "  2) 检查服务状态"
    echo "  3) 退出"
    echo ""
}

# 主程序
main() {
    show_menu
    
    while true; do
        echo ""
        echo -e "${cyan}请选择操作:${nc}"
        read -p "选项: " choice
        case 1)
            start_backend
            break
            ;;
        case 2)
            check_status
            break
            ;;
        case 3)
            echo -e "${green}退出启动脚本（服务将继续运行）${nc}"
            exit 0
            ;;
    esac
    done
}

# 执行
main "$@"
