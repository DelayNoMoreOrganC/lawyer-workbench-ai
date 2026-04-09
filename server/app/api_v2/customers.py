from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.models.database import get_db
from app.models.customer import Customer, Communication, CustomerType, CustomerSource, CustomerStatus, case_customer_association
from app.models.case_new import Case
from app.models.user_new import User


router = APIRouter()

# ========== 客户管理接口 ==========

@router.get("/", response_model=List[dict])
def get_customers(
    search: Optional[str] = None,
    customer_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取客户列表"""
    query = db.query(Customer)

    # 搜索过滤
    if search:
        query = query.filter(
            (Customer.name.contains(search)) |
            (Customer.phone.contains(search))
        )

    # 类型过滤
    if customer_type:
        query = query.filter(Customer.customer_type == CustomerType(customer_type))

    # 状态过滤
    if status:
        query = query.filter(Customer.status == CustomerStatus(status))

    customers = query.order_by(Customer.created_at.desc()).all()

    return [
        {
            "id": customer.id,
            "name": customer.name,
            "customer_type": customer.customer_type.value if customer.customer_type else None,
            "phone": customer.phone,
            "email": customer.email,
            "address": customer.address,
            "id_number": customer.id_number,
            "industry": customer.industry,
            "source": customer.source.value if customer.source else None,
            "status": customer.status.value if customer.status else None,
            "tags": customer.tags.split(",") if customer.tags else [],
            "notes": customer.notes,
            "created_at": customer.created_at.isoformat() if customer.created_at else None
        }
        for customer in customers
    ]


@router.get("/{customer_id}", response_model=dict)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """获取客户详情"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(status_code=404, detail="客户不存在")

    return {
        "id": customer.id,
        "name": customer.name,
        "customer_type": customer.customer_type.value if customer.customer_type else None,
        "phone": customer.phone,
        "email": customer.email,
        "address": customer.address,
        "id_number": customer.id_number,
        "industry": customer.industry,
        "source": customer.source.value if customer.source else None,
        "status": customer.status.value if customer.status else None,
        "tags": customer.tags.split(",") if customer.tags else [],
        "notes": customer.notes,
        "created_at": customer.created_at.isoformat() if customer.created_at else None
    }


@router.post("/", response_model=dict)
def create_customer(
    customer_data: dict,
    db: Session = Depends(get_db)
):
    """创建客户"""
    try:
        new_customer = Customer(
            name=customer_data.get("name"),
            customer_type=CustomerType(customer_data.get("customer_type")),
            phone=customer_data.get("phone"),
            email=customer_data.get("email"),
            address=customer_data.get("address"),
            id_number=customer_data.get("id_number"),
            industry=customer_data.get("industry"),
            source=CustomerSource(customer_data.get("source", "OTHER")),
            status=CustomerStatus(customer_data.get("status", "POTENTIAL")),
            tags=",".join(customer_data.get("tags", [])),
            notes=customer_data.get("notes")
        )

        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)

        return {
            "id": new_customer.id,
            "message": "客户创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{customer_id}", response_model=dict)
def update_customer(
    customer_id: int,
    customer_data: dict,
    db: Session = Depends(get_db)
):
    """更新客户信息"""
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()

        if not customer:
            raise HTTPException(status_code=404, detail="客户不存在")

        # 更新字段
        if customer_data.get("name"):
            customer.name = customer_data.get("name")
        if customer_data.get("phone"):
            customer.phone = customer_data.get("phone")
        if customer_data.get("email"):
            customer.email = customer_data.get("email")
        if customer_data.get("address"):
            customer.address = customer_data.get("address")
        if customer_data.get("tags"):
            customer.tags = ",".join(customer_data.get("tags", []))
        if customer_data.get("notes"):
            customer.notes = customer_data.get("notes")

        db.commit()
        db.refresh(customer)

        return {
            "id": customer.id,
            "message": "客户信息更新成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{customer_id}", response_model=dict)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """删除客户"""
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()

        if not customer:
            raise HTTPException(status_code=404, detail="客户不存在")

        db.delete(customer)
        db.commit()

        return {"message": "客户删除成功"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========== 冲突检测接口 ==========

@router.get("/conflict-check", response_model=dict)
def check_conflict(
    customer_name: str,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """检查利益冲突"""
    try:
        # 查找与该客户相关的案件（排除当前案件）
        from sqlalchemy import or_

        # 作为原告的案件
        plaintiff_cases = db.query(Case).filter(
            Case.plaintiff.contains(customer_name)
        ).all()

        # 作为被告的案件
        defendant_cases = db.query(Case).filter(
            Case.defendant.contains(customer_name)
        ).all()

        all_cases = list(set(plaintiff_cases + defendant_cases))

        # 排除当前案件
        if customer_id:
            # 这里需要通过案件客户关联表来排除
            pass

        if not all_cases:
            return {
                "has_conflict": False,
                "conflicting_cases": [],
                "conflict_details": {
                    "direct_conflict": False,
                    "potential_conflict": False,
                    "conflict_reason": "未发现利益冲突"
                }
            }

        # 构建冲突案件列表
        conflicting_cases = []
        for case in all_cases:
            conflicting_cases.append({
                "case_id": case.id,
                "case_name": case.case_name,
                "case_type": case.case_type,
                "case_status": case.case_status,
                "opposing_parties": [],  # 可以从案件中解析对方当事人
                "current_lawyers": []  # 需要从案件团队关系中获取
            })

        return {
            "has_conflict": True,
            "conflicting_cases": conflicting_cases,
            "conflict_details": {
                "direct_conflict": False,
                "potential_conflict": True,
                "conflict_reason": f"发现 {len(conflicting_cases)} 个相关案件"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========== 沟通记录接口 ==========

@router.get("/{customer_id}/communications", response_model=List[dict])
def get_communications(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """获取客户沟通记录"""
    communications = db.query(Communication).filter(
        Communication.customer_id == customer_id
    ).order_by(Communication.communication_date.desc()).all()

    return [
        {
            "id": comm.id,
            "customer_id": comm.customer_id,
            "case_id": comm.case_id,
            "communication_type": comm.communication_type,
            "communication_date": comm.communication_date.isoformat() if comm.communication_date else None,
            "duration_minutes": comm.duration_minutes,
            "content": comm.content,
            "follow_up_required": comm.follow_up_required,
            "follow_up_date": comm.follow_up_date.isoformat() if comm.follow_up_date else None,
            "created_at": comm.created_at.isoformat() if comm.created_at else None
        }
        for comm in communications
    ]


@router.post("/communications", response_model=dict)
def create_communication(
    comm_data: dict,
    db: Session = Depends(get_db)
):
    """创建沟通记录"""
    try:
        new_comm = Communication(
            customer_id=comm_data.get("customer_id"),
            case_id=comm_data.get("case_id"),
            communication_type=comm_data.get("communication_type"),
            communication_date=datetime.fromisoformat(comm_data.get("communication_date")) if comm_data.get("communication_date") else datetime.utcnow(),
            duration_minutes=comm_data.get("duration_minutes"),
            content=comm_data.get("content"),
            follow_up_required=comm_data.get("follow_up_required", False),
            follow_up_date=datetime.fromisoformat(comm_data.get("follow_up_date")) if comm_data.get("follow_up_date") else None,
            staff_id=comm_data.get("staff_id", 1)
        )

        db.add(new_comm)
        db.commit()
        db.refresh(new_comm)

        return {
            "id": new_comm.id,
            "message": "沟通记录创建成功"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ========== 客户案件统计接口 ==========

@router.get("/{customer_id}/case-statistics", response_model=dict)
def get_customer_case_statistics(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """获取客户案件统计"""
    try:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="客户不存在")

        # 获取相关案件（这里简化处理，实际需要通过关联表）
        cases = db.query(Case).filter(
            (Case.plaintiff.contains(customer.name)) |
            (Case.defendant.contains(customer.name))
        ).all()

        total_cases = len(cases)
        active_cases = len([c for c in cases if c.case_status not in ["completed", "结案"]])
        completed_cases = len([c for c in cases if c.case_status in ["completed", "结案"]])

        # 统计案件类型
        case_types = {}
        for case in cases:
            if case.case_type not in case_types:
                case_types[case.case_type] = 0
            case_types[case.case_type] += 1

        return {
            "customer_id": customer_id,
            "customer_name": customer.name,
            "total_cases": total_cases,
            "active_cases": active_cases,
            "completed_cases": completed_cases,
            "total_attorney_fees": 0,  # 需要从律师费表中计算
            "total_paid_fees": 0,     # 需要从收款表中计算
            "case_types": case_types,
            "recent_cases": [
                {
                    "id": case.id,
                    "case_name": case.case_name,
                    "case_type": case.case_type,
                    "case_status": case.case_status,
                    "created_at": case.created_at.isoformat() if case.created_at else None
                }
                for case in cases[:5]  # 最近5个案件
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))