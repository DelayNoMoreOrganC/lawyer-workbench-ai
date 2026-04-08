from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.case import CalendarEvent, Case

router = APIRouter()

# Test endpoint to verify code version
@router.get("/test")
async def test_endpoint():
    """测试端点"""
    return {"message": "Calendar API v2.0 - Updated Code", "status": "working"}


@router.get("/events")
async def get_calendar_events(db: Session = Depends(get_db)):
    """获取日历事件"""
    try:
        events = db.query(CalendarEvent).order_by(CalendarEvent.start_time).all()
        # 转换为字典格式返回
        events_data = []
        for event in events:
            events_data.append({
                "id": event.id,
                "case_id": event.case_id,
                "event_type": event.event_type,
                "title": event.title,
                "description": event.description,
                "start_time": str(event.start_time) if event.start_time else None,
                "end_time": str(event.end_time) if event.end_time else None,
                "reminder_time": str(event.reminder_time) if event.reminder_time else None,
                "location": event.location,
                "contact_info": event.contact_info,
                "is_completed": event.is_completed
            })
        return {"events": events_data}
    except Exception as e:
        return {"events": []}


@router.post("/events")
async def create_calendar_event(event_data: dict, db: Session = Depends(get_db)):
    """创建日历事件"""
    try:
        # 处理datetime字段转换
        event_data_copy = event_data.copy()

        # 转换字符串时间为datetime对象
        for field in ['start_time', 'end_time', 'reminder_time']:
            if field in event_data_copy and event_data_copy[field]:
                if isinstance(event_data_copy[field], str):
                    # 尝试解析多种时间格式
                    time_formats = [
                        '%Y-%m-%d %H:%M:%S',
                        '%Y-%m-%dT%H:%M:%S',
                        '%Y-%m-%d %H:%M:%S.%f',
                        '%Y-%m-%dT%H:%M:%S.%f'
                    ]
                    parsed_time = None
                    for fmt in time_formats:
                        try:
                            parsed_time = datetime.strptime(event_data_copy[field], fmt)
                            break
                        except ValueError:
                            continue
                    if parsed_time:
                        event_data_copy[field] = parsed_time

        new_event = CalendarEvent(**event_data_copy)
        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        # 返回格式化的事件数据
        return {
            "id": new_event.id,
            "case_id": new_event.case_id,
            "event_type": new_event.event_type,
            "title": new_event.title,
            "description": new_event.description,
            "start_time": str(new_event.start_time) if new_event.start_time else None,
            "end_time": str(new_event.end_time) if new_event.end_time else None,
            "reminder_time": str(new_event.reminder_time) if new_event.reminder_time else None,
            "location": new_event.location,
            "contact_info": new_event.contact_info,
            "is_completed": new_event.is_completed,
            "message": "事件创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/events/{event_id}")
async def update_calendar_event(event_id: int, event_data: dict, db: Session = Depends(get_db)):
    """更新日历事件"""
    try:
        event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="事件不存在")

        # 处理datetime字段转换
        for field in ['start_time', 'end_time', 'reminder_time']:
            if field in event_data and event_data[field]:
                if isinstance(event_data[field], str):
                    # 尝试解析多种时间格式
                    time_formats = [
                        '%Y-%m-%d %H:%M:%S',
                        '%Y-%m-%dT%H:%M:%S',
                        '%Y-%m-%d %H:%M:%S.%f',
                        '%Y-%m-%dT%H:%M:%S.%f'
                    ]
                    parsed_time = None
                    for fmt in time_formats:
                        try:
                            parsed_time = datetime.strptime(event_data[field], fmt)
                            break
                        except ValueError:
                            continue
                    if parsed_time:
                        event_data[field] = parsed_time

        for key, value in event_data.items():
            setattr(event, key, value)

        db.commit()
        db.refresh(event)
        return {"event": event, "message": "事件更新成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/events/{event_id}")
async def delete_calendar_event(event_id: int, db: Session = Depends(get_db)):
    """删除日历事件"""
    try:
        event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="事件不存在")

        db.delete(event)
        db.commit()
        return {"message": "事件删除成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/todos")
async def get_todos(db: Session = Depends(get_db)):
    """获取待办事项"""
    try:
        # 返回未完成的日历事件作为待办
        todos = db.query(CalendarEvent).filter(
            CalendarEvent.is_completed == False
        ).order_by(CalendarEvent.start_time).all()

        # 转换为字典格式返回
        todos_data = []
        for todo in todos:
            todos_data.append({
                "id": todo.id,
                "case_id": todo.case_id,
                "event_type": todo.event_type,
                "title": todo.title,
                "description": todo.description,
                "start_time": str(todo.start_time) if todo.start_time else None,
                "end_time": str(todo.end_time) if todo.end_time else None,
                "reminder_time": str(todo.reminder_time) if todo.reminder_time else None,
                "location": todo.location,
                "contact_info": todo.contact_info,
                "is_completed": todo.is_completed,
                "is_ai_predicted": todo.is_ai_predicted,
                "created_at": str(todo.created_at) if todo.created_at else None,
                "created_by": todo.created_by
            })
        return {"todos": todos_data}
    except Exception as e:
        return {"todos": []}
