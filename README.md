# 智能律师工作台 (AI Lawyer Workspace)

![Next.js](https://img.shields.io/badge/Next.js-16+-000000?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

一款专为律师事务所设计的现代化智能案件管理平台，采用Next.js + FastAPI架构，集成AI助手、日历待办、案件管理、智能文档识别等功能。

## ✨ 核心功能

### 📋 案件管理
- 全生命周期案件管理（起草中、待立案、一审、二审、执行、结案）
- 智能案件状态跟踪
- 案件分类和标签管理
- 高级搜索和筛选功能
- 案件详情编辑和历史记录

### 🤖 AI智能助手
- **智能法律咨询**: 专业法律问题解答
- **文书生成**: 自动生成起诉状、答辩状、代理词等法律文书
- **案件分析**: AI分析案件风险和提供策略建议
- **证据评估**: 智能评估证据完整性和有效性
- **对话历史**: 完整的对话记录管理

### 📅 日程待办
- **月历视图**: 直观的月历日程展示
- **任务管理**: 完整的待办事项CRUD操作
- **优先级设置**: 任务优先级和截止日期管理
- **状态跟踪**: 待处理、进行中、已完成状态管理
- **案件关联**: 任务与案件的智能关联

### 📄 智能文档识别
- **AI文档解析**: 自动识别PDF和图片中的案件信息
- **智能字段提取**: 自动提取法院、案号、当事人、金额等关键信息
- **多格式支持**: 支持PDF、JPG、PNG、GIF、BMP等格式
- **拖拽上传**: 便捷的文件拖拽上传体验
- **数据验证**: 智能数据验证和置信度评估

### 📁 文件管理
- **电子卷宗**: 完整的文件上传和管理系统
- **文件分类**: 支持起诉状、判决书、证据等分类
- **安全存储**: 服务器端安全文件存储
- **文件操作**: 查看、下载、删除等文件管理功能

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.8+
- SQLite (自动包含)

### 后端安装

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 前端安装

```bash
cd client_new
npm install
```

### 启动服务

**启动后端：**
```bash
cd server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

**启动前端：**
```bash
cd client_new
npm run dev
```

**访问应用：**
- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- API文档: http://localhost:5000/docs

## 📦 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **UI库**: shadcn/ui + Tailwind CSS
- **状态管理**: React Hooks (useState, useEffect)
- **组件库**: Radix UI primitives
- **样式**: Tailwind CSS
- **HTTP**: Fetch API

### 后端
- **框架**: FastAPI
- **数据库**: SQLite + SQLAlchemy 2.0
- **ORM**: SQLAlchemy (新模型架构)
- **文档处理**: PyPDF2, 文本提取
- **AI集成**: 智能文档识别和分析
- **API设计**: RESTful API v2.0

## 🎨 界面特点

- **现代化设计**: shadcn/ui组件库，专业美观
- **响应式布局**: 支持各种屏幕尺寸
- **专业配色**: 灰色系专业配色方案
- **直观操作**: 简洁易用的用户界面
- **快速响应**: 优化的性能和加载速度

## 📂 项目结构

```
lawyer-workbench-ai/
├── client_new/             # 前端Next.js项目
│   ├── src/
│   │   ├── app/           # Next.js App Router页面
│   │   │   ├── page.tsx           # 主页工作台
│   │   │   ├── cases/             # 案件管理页面
│   │   │   ├── tasks/             # 待办事项页面
│   │   │   ├── dossiers/          # 文件检索页面
│   │   │   └── ai-chat/           # AI助手页面
│   │   ├── components/    # React组件
│   │   │   ├── ui/               # shadcn/ui组件
│   │   │   ├── navigation.tsx     # 导航栏组件
│   │   │   ├── document-upload.tsx # 文件上传组件
│   │   │   └── month-calendar-view.tsx # 月历视图组件
│   │   └── lib/            # 工具函数
│   └── package.json
├── server/                # 后端FastAPI项目
│   ├── app/
│   │   ├── api_v2/       # API路由 v2.0
│   │   │   ├── cases.py          # 案件管理API
│   │   │   ├── tasks.py          # 任务管理API
│   │   │   ├── dossiers.py       # 文件管理API
│   │   │   ├── ai_document.py    # AI文档识别API
│   │   │   └── ai_chat.py        # AI聊天API
│   │   ├── models/       # 数据模型
│   │   │   ├── case_new.py       # 案件模型
│   │   │   ├── task.py           # 任务模型
│   │   │   └── dossier.py        # 文件模型
│   │   └── schemas/      # Pydantic模式
│   ├── uploads/        # 用户上传文件存储
│   └── requirements.txt
├── .gitignore
└── README.md
```

## 🔧 配置说明

### 数据库配置

默认使用SQLite，数据库文件自动创建。生产环境可切换到PostgreSQL：

```python
# server/app/config.py
DATABASE_URL = "postgresql://user:password@localhost/lawyer_db"
```

### CORS配置

已配置CORS支持前端跨域请求：

```python
# server/app/main.py
allow_origins=["http://localhost:3000", "http://localhost:3001"]
```

## 📝 API文档

### 主要API端点

**案件管理：**
- `GET /api/v2/cases/` - 获取案件列表
- `POST /api/v2/cases/` - 创建案件
- `PUT /api/v2/cases/{id}` - 更新案件
- `DELETE /api/v2/cases/{id}` - 删除案件

**任务管理：**
- `GET /api/v2/tasks/` - 获取任务列表
- `POST /api/v2/tasks/` - 创建任务
- `PUT /api/v2/tasks/{id}` - 更新任务状态
- `DELETE /api/v2/tasks/{id}` - 删除任务

**AI文档识别：**
- `POST /api/v2/ai/extract-summons` - AI文档识别
- `POST /api/v2/ai/analyze-case` - AI案件分析

**AI聊天助手：**
- `POST /api/v2/ai/chat/chat` - AI对话
- `GET /api/v2/ai/chat/templates` - 获取文书模板

**文件管理：**
- `GET /api/v2/dossiers/` - 获取文件列表
- `POST /api/v2/dossiers/upload` - 上传文件
- `DELETE /api/v2/dossiers/{id}` - 删除文件

完整API文档：http://localhost:5000/docs

## 🎯 使用指南

### 1. 案件管理
1. 点击"新建案件"创建新案件
2. 填写案件基本信息（名称、类型、法院等）
3. 可上传法律文书进行AI识别自动填充
4. 保存后案件自动出现在案件列表中

### 2. 任务管理
1. 在待办事项页面点击"新建任务"
2. 设置任务标题、优先级、截止日期
3. 可将任务关联到具体案件
4. 任务完成后标记为"已完成"状态

### 3. AI文档识别
1. 在案件详情页或主页上传法律文书
2. 系统自动提取案件信息
3. 人工核对和补充AI识别结果
4. 保存到案件记录中

### 4. AI法律助手
1. 在AI助手页面输入法律问题
2. AI提供专业法律建议
3. 可使用快捷操作生成文书模板
4. 查看对话历史记录

## 🚀 部署指南

### 生产环境部署

**前端部署（Vercel）：**
```bash
cd client_new
npm run build
# 部署到Vercel
```

**后端部署（Docker）：**
```bash
cd server
docker build -t lawyer-workbench-api .
docker run -p 5000:5000 lawyer-workbench-api
```

**环境变量配置：**
```env
DATABASE_URL=postgresql://user:password@localhost/lawyer_db
CORS_ORIGINS=https://your-domain.com
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## 📞 联系方式

项目问题请提交 [Issue](https://github.com/yourusername/lawyer-workbench-ai/issues)

---

**注意**: 本项目仅供学习和参考使用，请遵守相关法律法规和律师执业规范。