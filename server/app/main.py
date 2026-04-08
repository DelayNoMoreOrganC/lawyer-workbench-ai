from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# 创建FastAPI应用
app = FastAPI(
    title="AI Lawyer Workspace - 新版本",
    description="基于新数据库模型的律师工作台AI应用后端API",
    version="2.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"],  # Next.js默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 根路由
@app.get("/")
async def root():
    return {
        "message": "AI Lawyer Workspace API v2.0",
        "version": "2.0.0",
        "status": "running",
        "database": "SQLite (新模型)"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# 新版本路由
from app.api_v2 import cases, tasks, dossiers, events, users, ai_document, ai_chat

# 注册新版本API路由
app.include_router(cases.router, prefix="/api/v2/cases", tags=["案件管理 v2"])
app.include_router(tasks.router, prefix="/api/v2/tasks", tags=["待办事项 v2"])
app.include_router(dossiers.router, prefix="/api/v2/dossiers", tags=["电子卷宗 v2"])
app.include_router(events.router, prefix="/api/v2/events", tags=["日程安排 v2"])
app.include_router(users.router, prefix="/api/v2/users", tags=["用户管理 v2"])
app.include_router(ai_document.router, prefix="/api/v2/ai", tags=["AI文档识别 v2"])
app.include_router(ai_chat.router, prefix="/api/v2/ai/chat", tags=["AI聊天助手 v2"])

# 保留旧版本路由（向后兼容）
try:
    from app.api import auth, cases as old_cases, ai, calendar, documents, collaboration
    app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
    app.include_router(old_cases.router, prefix="/api/cases", tags=["案件管理"])
    app.include_router(ai.router, prefix="/api/ai", tags=["AI服务"])
    app.include_router(calendar.router, prefix="/api/calendar", tags=["日历待办"])
    app.include_router(documents.router, prefix="/api/documents", tags=["文档管理"])
    app.include_router(collaboration.router, prefix="/api/collaboration", tags=["协作"])
except ImportError:
    pass  # 旧版本API不存在时忽略


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
