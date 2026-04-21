# -*- coding: utf-8 -*-
"""
PeopleGraph — Compliance & Payroll Router
Implements the Compliance Exporter with data fallback logic.
"""

import uuid
from datetime import date, datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.employee import Employee
from app.models.payroll import PayrollRun, PayrollLineItem, ComplianceReceipt
from app.models.user import User
from app.schemas.payroll import (
    PayrollRunCreate, PayrollRunResponse, PayrollLineItemResponse,
    ComplianceExportRequest, ComplianceExportResponse, ComplianceExportRow,
    BatchFallbackRequest,
)
from app.services.statutory import StatutoryCalculator
from app.services.compliance_exporter import (
    ComplianceExporter, format_compliance_name, apply_data_fallback,
)
from app.middleware.rbac import (
    get_current_user, require_payroll_access, require_compliance_export,
)

router = APIRouter(prefix="/api/v1/payroll", tags=["Payroll & Compliance"])
calculator = StatutoryCalculator()
exporter = ComplianceExporter()


@router.post("/runs", response_model=PayrollRunResponse, status_code=201)
async def create_payroll_run(
    payload: PayrollRunCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_payroll_access),
):
    """
    Initialize a new payroll run cycle.
    This creates the run record and auto-generates line items
    for all active employees with statutory calculations.
    """
    run = PayrollRun(
        run_date=date.today(),
        period_start=payload.period_start,
        period_end=payload.period_end,
        status="processing",
        notes=payload.notes,
    )
    db.add(run)
    await db.flush()

    # Fetch all active employees
    result = await db.execute(
        select(Employee).where(Employee.is_active == True)
    )
    employees = result.scalars().all()

    total_gross = 0.0
    total_net = 0.0
    total_employer_stat = 0.0

    for emp in employees:
        gross = emp.monthly_base_salary
        breakdown = calculator.compute(gross)

        net = gross - breakdown.total_employee_deductions
        employer_cost = gross + breakdown.total_employer_contributions

        line = PayrollLineItem(
            payroll_run_id=run.id,
            employee_id=emp.id,
            base_salary_rm=gross,
            gross_salary_rm=gross,
            epf_employee_rm=breakdown.epf_employee,
            socso_employee_rm=breakdown.socso_employee,
            eis_employee_rm=breakdown.eis_employee,
            pcb_rm=breakdown.pcb,
            epf_employer_rm=breakdown.epf_employer,
            socso_employer_rm=breakdown.socso_employer,
            eis_employer_rm=breakdown.eis_employer,
            net_salary_rm=round(net, 2),
            total_employer_cost_rm=round(employer_cost, 2),
        )
        db.add(line)

        total_gross += gross
        total_net += net
        total_employer_stat += breakdown.total_employer_contributions

    run.total_gross_rm = round(total_gross, 2)
    run.total_net_rm = round(total_net, 2)
    run.total_employer_statutory_rm = round(total_employer_stat, 2)
    run.employee_count = len(employees)
    run.status = "completed"

    await db.flush()
    await db.refresh(run)
    return PayrollRunResponse.model_validate(run)


@router.get("/runs", response_model=List[PayrollRunResponse])
async def list_payroll_runs(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_payroll_access),
):
    """List all payroll runs, most recent first."""
    result = await db.execute(
        select(PayrollRun).order_by(PayrollRun.run_date.desc()).limit(50)
    )
    return [PayrollRunResponse.model_validate(r) for r in result.scalars().all()]


@router.get("/runs/{run_id}/items", response_model=List[PayrollLineItemResponse])
async def get_payroll_items(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_payroll_access),
):
    """Get all line items for a payroll run."""
    result = await db.execute(
        select(PayrollLineItem).where(PayrollLineItem.payroll_run_id == run_id)
    )
    items = result.scalars().all()
    if not items:
        raise HTTPException(status_code=404, detail="Payroll run not found or empty")
    return [PayrollLineItemResponse.model_validate(i) for i in items]


# ── Compliance Export Endpoints ──────────────────────────────────────

@router.post("/compliance/export", response_model=ComplianceExportResponse)
async def export_compliance_report(
    request: ComplianceExportRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_compliance_export),
):
    """
    Generate a formatted compliance report (EPF/SOCSO/EIS/PCB).
    Names are formatted per the strict rule:
    '[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]'
    """
    # Fetch line items with employee data
    result = await db.execute(
        select(PayrollLineItem, Employee)
        .join(Employee, PayrollLineItem.employee_id == Employee.id)
        .where(PayrollLineItem.payroll_run_id == request.payroll_run_id)
    )
    rows = result.all()

    if not rows:
        raise HTTPException(status_code=404, detail="No payroll data found")

    export_rows = []
    for line_item, employee in rows:
        # Apply strict compliance name formatting (Critical Rule)
        formatted = format_compliance_name(
            employee.employee_number,
            employee.name_english,
            employee.name_local,
        )

        breakdown = {}
        if request.export_type == "epf":
            breakdown = {
                "epf_employee": line_item.epf_employee_rm,
                "epf_employer": line_item.epf_employer_rm,
                "total_epf": round(line_item.epf_employee_rm + line_item.epf_employer_rm, 2),
            }
        elif request.export_type == "socso":
            breakdown = {
                "socso_employee": line_item.socso_employee_rm,
                "socso_employer": line_item.socso_employer_rm,
            }
        elif request.export_type == "eis":
            breakdown = {
                "eis_employee": line_item.eis_employee_rm,
                "eis_employer": line_item.eis_employer_rm,
            }
        elif request.export_type == "pcb":
            breakdown = {"pcb": line_item.pcb_rm}

        export_rows.append(ComplianceExportRow(
            formatted_name=formatted,
            gross_salary=line_item.gross_salary_rm,
            breakdown=breakdown,
        ))

    return ComplianceExportResponse(
        export_type=request.export_type,
        generated_at=datetime.utcnow(),
        rows=export_rows,
        total_employees=len(export_rows),
    )


@router.post("/compliance/batch-with-fallback")
async def batch_process_with_fallback(
    request: BatchFallbackRequest,
    user: User = Depends(require_compliance_export),
):
    """
    Process batch payroll data with automatic data fallback (Critical Rule #3).
    If columns E, F, or H are 0/blank, fallback to N, O, Q respectively.
    """
    records = exporter.generate_batch_export(
        [emp.model_dump() for emp in request.employees]
    )

    return {
        "processed": len(records),
        "fallback_triggered_count": sum(1 for r in records if r.fallback_used),
        "records": [
            {
                "formatted_name": r.formatted_name,
                "gross_salary": r.gross_salary,
                "net_salary": r.net_salary,
                "total_employer_cost": r.total_employer_cost,
                "statutory": r.statutory_breakdown,
                "fallback_used": r.fallback_used,
                "fallback_details": r.fallback_details,
            }
            for r in records
        ],
    }
