# -*- coding: utf-8 -*-
"""
PeopleGraph — Payroll & Compliance Models
"""

import uuid
from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import String, Float, Date, DateTime, ForeignKey, Text, Integer, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PayrollRun(Base):
    """
    Represents a single payroll cycle (e.g., April 2025 payroll).
    The Finance Card shows next_payout_date and cycle progress from this.
    """
    __tablename__ = "payroll_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_date: Mapped[date] = mapped_column(Date, nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="draft",
        comment="draft | processing | completed | cancelled"
    )
    total_gross_rm: Mapped[float] = mapped_column(Float, default=0.0)
    total_net_rm: Mapped[float] = mapped_column(Float, default=0.0)
    total_employer_statutory_rm: Mapped[float] = mapped_column(Float, default=0.0)
    employee_count: Mapped[int] = mapped_column(Integer, default=0)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    line_items: Mapped[List["PayrollLineItem"]] = relationship("PayrollLineItem", back_populates="payroll_run", cascade="all, delete-orphan")


class PayrollLineItem(Base):
    """
    Per-employee payroll breakdown for a given run.
    Contains all Malaysian statutory deductions.
    """
    __tablename__ = "payroll_line_items"
    __table_args__ = (
        Index("ix_payroll_line_emp_run", "employee_id", "payroll_run_id", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payroll_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("payroll_runs.id"), nullable=False)
    employee_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)

    # Earnings
    base_salary_rm: Mapped[float] = mapped_column(Float, nullable=False)
    allowances_rm: Mapped[float] = mapped_column(Float, default=0.0)
    overtime_rm: Mapped[float] = mapped_column(Float, default=0.0)
    bonus_rm: Mapped[float] = mapped_column(Float, default=0.0)
    gross_salary_rm: Mapped[float] = mapped_column(Float, nullable=False)

    # Malaysian Statutory Deductions (Employee portion)
    epf_employee_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="11% employee EPF")
    socso_employee_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="0.5% capped RM6000")
    eis_employee_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="0.2% capped RM6000")
    pcb_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="Monthly Tax Deduction (PCB/MTD)")
    other_deductions_rm: Mapped[float] = mapped_column(Float, default=0.0)

    # Employer Statutory Contributions (NOT deducted from salary — added cost)
    epf_employer_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="12-13% employer EPF")
    socso_employer_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="1.75% capped RM6000")
    eis_employer_rm: Mapped[float] = mapped_column(Float, default=0.0, comment="0.2% capped RM6000")

    net_salary_rm: Mapped[float] = mapped_column(Float, nullable=False)
    total_employer_cost_rm: Mapped[float] = mapped_column(
        Float, nullable=False,
        comment="gross + epf_employer + socso_employer + eis_employer"
    )

    # Data fallback tracking (Critical Rule #3)
    used_fallback: Mapped[bool] = mapped_column(Boolean, default=False)
    fallback_details: Mapped[Optional[dict]] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    payroll_run: Mapped["PayrollRun"] = relationship("PayrollRun", back_populates="line_items")
    employee: Mapped["Employee"] = relationship("Employee", back_populates="payroll_items")


class ComplianceReceipt(Base):
    """
    Generated compliance receipts/reports (LHDN, EPF, SOCSO).
    Format: '[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]'
    """
    __tablename__ = "compliance_receipts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payroll_run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("payroll_runs.id"), nullable=False)
    receipt_type: Mapped[str] = mapped_column(String(30), nullable=False, comment="epf | socso | eis | pcb | payslip")
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    formatted_content: Mapped[Optional[dict]] = mapped_column(JSONB)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
