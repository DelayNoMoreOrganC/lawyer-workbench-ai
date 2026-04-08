from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.event import Event

router = APIRouter()


@router.get("/")
def get_events(case_id: int = None, db: Session = Depends(get_db)):
    """获取日程安排列表"""
    query = db.query(Event)
    if case_id:
        query = query.filter(Event.case_id == case_id)
    events = query.all()
    return {"events": events, "total": len(events)}


@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    """获取日程安排详情"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="日程安排不存在")
    return event