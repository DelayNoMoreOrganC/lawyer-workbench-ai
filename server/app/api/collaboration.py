from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws/collaborate/{case_id}")
async def collaborate_websocket(websocket: WebSocket, case_id: int):
    """协作WebSocket"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # TODO: 实现实时协作逻辑
            await websocket.send_json({"type": "echo", "data": data})
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for case {case_id}")


@router.get("/case/{case_id}/collaborators")
async def get_collaborators(case_id: int):
    """获取协作者列表"""
    # TODO: 实现协作者查询
    return {"message": "协作者查询功能开发中"}


@router.post("/case/{case_id}/collaborators")
async def add_collaborator(case_id: int, user_id: int, permission: str):
    """添加协作者"""
    # TODO: 实现添加协作者
    return {"message": "添加协作者功能开发中"}
