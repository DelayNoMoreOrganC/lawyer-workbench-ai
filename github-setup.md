# GitHub 上传指南

## 快速设置步骤

### 1. 创建GitHub仓库
1. 访问 https://github.com/new
2. 填写仓库信息：
   - **仓库名**: `lawyer-workbench-ai` (推荐)
   - **描述**: `智能律师工作台 AI Lawyer Workspace - 专业的律师工作管理系统`
   - **可见性**: Private 或 Public 根据需要选择

### 2. 连接并推送代码

#### 方法A: 使用当前分支 (推荐)
```bash
# 在项目根目录执行
cd /Users/juno/Downloads/lawyer-workbench-ai-main

# 添加GitHub远程仓库 (替换YOUR_USERNAME为你的GitHub用户名)
git remote add origin https://github.com/YOUR_USERNAME/lawyer-workbench-ai.git

# 推送当前分支
git push -u origin feature/user-authentication
```

#### 方法B: 创建main分支
```bash
# 创建并切换到main分支
git checkout -b main

# 推送main分支
git push -u origin main
```

### 3. 验证上传
访问你的GitHub仓库页面，确认所有文件都已上传：
https://github.com/YOUR_USERNAME/lawyer-workbench-ai

## 推荐的仓库设置

### 仓库描述
```
智能律师工作台 AI Lawyer Workspace - 专业的律师工作管理系统

🚀 核心功能：
- 案件全流程管理 (咨询→立案→审理→结案)
- 智能财务管理 (费用、律师费、收款)
- 客户关系管理 (CRM)
- AI辅助办案 (文书生成、案例检索、智能问答)
- 行政OA管理 (用印、报销、公告)
- 数据统计分析 (案件、财务、业绩报表)

💡 技术特色：
- Next.js 16 + React 19 + TypeScript
- FastAPI + SQLAlchemy + SQLite
- PWA离线支持 + AI集成
- 响应式设计 + 性能优化

📊 数据规模：
- 13个数据库表
- 93个API接口
- 30+个前端组件
```

### 仓库主题标签
- `nextjs`
- `fastapi`
- `react`
- `typescript`
- `lawyer`
- `ai`
- `saas`
- `legal-tech`

## 后续管理

### 创建README.md
```bash
# 在项目根目录创建README.md
cat > README.md << 'EOF'
# 智能律师工作台 AI Lawyer Workspace

专业的律师工作管理系统，提供案件管理、财务跟踪、客户关系、AI辅助等全方位功能。

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.9+
- SQLite

### 安装运行
```bash
# 一键启动
./start.sh

# 或分别启动
# 后端
cd server && pip install -r requirements.txt && python -m app.main

# 前端
cd client_new && npm install && npm run dev
```

### 访问地址
- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- API文档: http://localhost:5000/docs

## 技术栈
- **前端**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **后端**: FastAPI + SQLAlchemy + Pydantic
- **数据库**: SQLite (支持PostgreSQL)
- **UI**: shadcn/ui + 自定义组件库

## 功能特性
- 案件全流程管理
- 智能财务跟踪
- 客户关系管理
- AI辅助办案
- 行政OA管理
- 数据统计分析

## 开发状态
✅ 第一阶段核心功能已完成

## 联系方式
- 开发: Claude AI Assistant
- 文档: 查看 `/docs` 目录

EOF
```

### 设置GitHub分支保护
```bash
# 设置main为默认分支
git branch -M main

# 推送所有分支
git push -u origin --all
```

## 常用Git命令

### 查看状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

### 创建新分支
```bash
git checkout -b feature/your-feature-name
```

### 合并分支
```bash
git checkout main
git merge feature/your-feature-name
```

## 备份与同步

### 推送到多个远程仓库
```bash
# 添加多个远程仓库
git remote add origin https://github.com/YOUR_USERNAME/lawyer-workbench-ai.git
git remote add backup https://gitee.com/YOUR_USERNAME/lawyer-workbench-ai.git

# 推送到所有远程仓库
git push origin --all
git push backup --all
```

## 发布版本

```bash
# 创建标签
git tag -a v1.0.0 -m "第一阶段核心功能版本"

# 推送标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```
