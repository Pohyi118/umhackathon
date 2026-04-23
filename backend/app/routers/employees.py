# -*- coding: utf-8 -*-
"""
PeopleGraph — Employee CRUD Router
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.employee import Employee, Department
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    EmployeeListResponse, DepartmentCreate, DepartmentResponse,
)
from app.middleware.rbac import get_current_user, require_employee_management

router = APIRouter(prefix="/api/v1/employees", tags=["Employees"])


@router.get("/", response_model=EmployeeListResponse)
async def list_employees(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    department_id: Optional[uuid.UUID] = None,
    is_active: Optional[bool] = True,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List employees with pagination, filtering, and search."""
    query = select(Employee)

    if is_active is not None:
        query = query.where(Employee.is_active == is_active)
    if department_id:
        query = query.where(Employee.department_id == department_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            Employee.name_english.ilike(search_pattern)
            | Employee.employee_number.ilike(search_pattern)
            | Employee.email.ilike(search_pattern)
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    employees = result.scalars().all()

    return EmployeeListResponse(
        employees=[EmployeeResponse.model_validate(e) for e in employees],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    payload: EmployeeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_employee_management),
):
    """Create a new employee. Requires employee management permission."""
    # Check department exists
    dept = await db.get(Department, payload.department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    employee = Employee(**payload.model_dump())
    db.add(employee)
    await db.flush()
    await db.refresh(employee)
    return EmployeeResponse.model_validate(employee)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single employee by ID."""
    employee = await db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeResponse.model_validate(employee)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: uuid.UUID,
    payload: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_employee_management),
):
    """Update employee details. Requires employee management permission."""
    employee = await db.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)

    await db.flush()
    await db.refresh(employee)
    return EmployeeResponse.model_validate(employee)
