# -*- coding: utf-8 -*-
"""Pydantic schemas for Payroll and Compliance endpoints."""

import uuid
from datetime import date, datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


class StatutoryBreakdownSchema(BaseModel):
    epf_employee: float
    socso_employee: float
    eis_employee: float
    pcb: float
    epf_employer: float
    socso_employer: float
    eis_employer: float
    total_employee_deductions: float
    total_employer_contributions: float


class PayrollLineItemCreate(BaseModel):
    employee_id: uuid.UUID
    base_salary_rm: float
    allowances_rm: float = 0.0
    overtime_rm: float = 0.0
    bonus_rm: float = 0.0


class PayrollLineItemResponse(BaseModel):
    id: uuid.UUID
    employee_id: uuid.UUID
    base_salary_rm: float
    allowances_rm: float
    overtime_rm: float
    bonus_rm: float
    gross_salary_rm: float
    epf_employee_rm: float
    socso_employee_rm: float
    eis_employee_rm: float
    pcb_rm: float
    epf_employer_rm: float
    socso_employer_rm: float
    eis_employer_rm: float
    net_salary_rm: float
    total_employer_cost_rm: float
    used_fallback: bool
    fallback_details: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


class PayrollRunCreate(BaseModel):
    period_start: date
    period_end: date
    notes: Optional[str] = None


class PayrollRunResponse(BaseModel):
    id: uuid.UUID
    run_date: date
    period_start: date
    period_end: date
    status: str
    total_gross_rm: float
    total_net_rm: float
    total_employer_statutory_rm: float
    employee_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ComplianceExportRequest(BaseModel):
    """Request body for batch compliance export."""
    payroll_run_id: uuid.UUID
    export_type: str = Field(..., pattern="^(epf|socso|eis|pcb|payslip)$")


class ComplianceExportRow(BaseModel):
    """Single row in a compliance export with formatted name."""
    formatted_name: str = Field(
        ..., description="Format: '[Number] - [NAME ALL CAPS] [Chinese name]'"
    )
    gross_salary: float
    breakdown: Dict[str, float]


class ComplianceExportResponse(BaseModel):
    export_type: str
    generated_at: datetime
    rows: List[ComplianceExportRow]
    total_employees: int


# ── Data Fallback Schemas ────────────────────────────────────────────
class PayrollRowWithFallback(BaseModel):
    """
    Raw payroll row data using column-letter convention.
    Critical Rule #3: If E, F, or H is 0/blank, fallback to N, O, Q.
    """
    employee_number: str
    name_english: str
    name_local: Optional[str] = None
    age: int = 30
    row_data: Dict[str, Any] = Field(
        ...,
        description="Column-keyed data: E=base_salary, F=allowances, H=overtime, N/O/Q=fallbacks",
        json_schema_extra={
            "example": {
                "E": 5000, "F": 500, "H": 200,
                "N": 4800, "O": 500, "Q": 150,
            }
        },
    )


class BatchFallbackRequest(BaseModel):
    employees: List[PayrollRowWithFallback]
