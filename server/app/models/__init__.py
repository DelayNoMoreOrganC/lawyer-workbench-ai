# Models模块初始化 - 新版本
from app.models.database import Base, engine, SessionLocal, get_db, init_db
from app.models.case_new import Case
from app.models.task import Task
from app.models.dossier import Dossier
from app.models.event import Event
from app.models.ai_assist_log import AIAssistLog
from app.models.user_new import User

__all__ = [
    "Base",
    "engine",
    "SessionLocal",
    "get_db",
    "init_db",
    "Case",
    "Task",
    "Dossier",
    "Event",
    "AIAssistLog",
    "User"
]
