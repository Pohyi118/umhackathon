# -*- coding: utf-8 -*-
"""Pydantic schemas for Employee endpoints."""

import uuid
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator


class DepartmentBase(BaseModel):
    name: str = Field(..., max_length=100)
    name_bm: Optional[str] = None
    name_zh: Optional[str] = None
    cost_center_code: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: uuid.UUID
    is_active: bool
    employee_count: int = 0

    model_config = {"from_attributes": True}


class EmployeeBase(BaseModel):
    name_english: str = Field(..., max_length=200)
    name_local: Optional[str] = Field(None, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = None
    ic_number: Optional[str] = None
    department_id: uuid.UUID
    role_title: str = Field(..., max_length=100)
    employment_type: str = "full_time"
    hire_date: date
    monthly_base_salary: float = Field(..., ge=0)
    work_location: str = "office"

    @field_validator("name_english")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("English name cannot be empty")
        return v.strip()


class EmployeeCreate(EmployeeBase):
    employee_number: str = Field(..., max_length=20)
    bank_account_number: Optional[str] = None
    bank_name: Optional[str] = None
    tax_reference_number: Optional[str] = None
    epf_number: Optional[str] = None
    socso_number: Optional[str] = None


class EmployeeUpdate(BaseModel):
    name_english: Optional[str] = None
    name_local: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role_title: Optional[str] = None
    monthly_base_salary: Optional[float] = Field(None, ge=0)
    work_location: Optional[str] = None
    is_active: Optional[bool] = None
    termination_date: Optional[date] = None


class EmployeeResponse(EmployeeBase):
    id: uuid.UUID
    employee_number: str
    is_active: bool
    termination_date: Optional[date] = None
    formatted_compliance_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int
    page: int
    per_page: int
