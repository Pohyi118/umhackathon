# -*- coding: utf-8 -*-
"""
PeopleGraph — Employee & Department Models
============================================
Core HR entities with Malaysian localization support.

Design decisions:
- `name_english` and `name_local` are separated to satisfy the Compliance
  Exporter formatting rule: "[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]"
- Salary is decomposed into SalaryComponent for audit-trail and time-series
  analysis of compensation changes.
- `department_id` is a FK to Department for the Department Split chart.
"""

import uuid
from datetime import date, datetime
from typing import Optional, List

from sqlalchemy import (
    String, Float, Date, DateTime, ForeignKey, Text, Integer,
    Enum as SAEnum, Boolean, Index, CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Department ───────────────────────────────────────────────────────
class Department(Base):
    """
    Organizational unit for the Department Split concentric-circle chart.
    Each department aggregates headcount and cost metrics.
    """
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name_bm: Mapped[Optional[str]] = mapped_column(String(100))   # Bahasa Malaysia
    name_zh: Mapped[Optional[str]] = mapped_column(String(100))   # Mandarin 中文
    cost_center_code: Mapped[Optional[str]] = mapped_column(String(20))
    head_employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", use_alter=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    employees: Mapped[List["Employee"]] = relationship(
        "Employee", back_populates="department", foreign_keys="Employee.department_id"
    )

    def __repr__(self) -> str:
        return f"<Department {self.name}>"


# ── Employee ─────────────────────────────────────────────────────────
class Employee(Base):
    """
    Core identity entity.

    Localization:
    - `name_english`: Used in compliance exports (auto-uppercased by the exporter).
    - `name_local`: Chinese/BM characters for localized receipts.

    The `employment_type` field supports the Outsourcing vs. Automation
    recommendation engine in Phase 3.
    """
    __tablename__ = "employees"
    __table_args__ = (
        Index("ix_employees_department", "department_id"),
        Index("ix_employees_active", "is_active"),
        CheckConstraint("monthly_base_salary >= 0", name="ck_salary_non_negative"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_number: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False,
        comment="Sequential ID shown on receipts, e.g. '001'"
    )
    name_english: Mapped[str] = mapped_column(
        String(200), nullable=False,
        comment="Full legal English name — uppercased in compliance exports"
    )
    name_local: Mapped[Optional[str]] = mapped_column(
        String(200),
        comment="Localized name (Chinese/BM) for compliance exporter, e.g. 丹尼尔"
    )
    email: Mapped[Optional[str]] = mapped_column(String(254), unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    ic_number: Mapped[Optional[str]] = mapped_column(
        String(20), unique=True,
        comment="Malaysian IC / MyKad number — PDPA-sensitive"
    )

    # ── Employment details ───────────────────────────────────────────
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False
    )
    role_title: Mapped[str] = mapped_column(String(100), nullable=False)
    employment_type: Mapped[str] = mapped_column(
        SAEnum("full_time", "part_time", "contract", "intern", name="employment_type_enum"),
        default="full_time",
    )
    hire_date: Mapped[date] = mapped_column(Date, nullable=False)
    termination_date: Mapped[Optional[date]] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Compensation (current snapshot) ──────────────────────────────
    monthly_base_salary: Mapped[float] = mapped_column(
        Float, nullable=False,
        comment="Base salary in MYR before statutory deductions"
    )
    bank_account_number: Mapped[Optional[str]] = mapped_column(String(30))
    bank_name: Mapped[Optional[str]] = mapped_column(String(100))
    tax_reference_number: Mapped[Optional[str]] = mapped_column(
        String(30), comment="LHDN tax reference for PCB"
    )
    epf_number: Mapped[Optional[str]] = mapped_column(String(30))
    socso_number: Mapped[Optional[str]] = mapped_column(String(30))

    # ── Location & remote work tracking ──────────────────────────────
    work_location: Mapped[str] = mapped_column(
        SAEnum("office", "remote", "hybrid", name="work_location_enum"),
        default="office",
        comment="For Headcount & Location card on dashboard"
    )

    # ── Metadata ─────────────────────────────────────────────────────
    metadata_json: Mapped[Optional[dict]] = mapped_column(
        JSONB, default=dict,
        comment="Flexible document store for custom fields per client"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # ── Relationships ────────────────────────────────────────────────
    department: Mapped["Department"] = relationship(
        "Department", back_populates="employees", foreign_keys=[department_id]
    )
    salary_components: Mapped[List["SalaryComponent"]] = relationship(
        "SalaryComponent", back_populates="employee", cascade="all, delete-orphan"
    )
    attendance_logs: Mapped[List["AttendanceLog"]] = relationship(
        "AttendanceLog", back_populates="employee", cascade="all, delete-orphan"
    )
    payroll_items: Mapped[List["PayrollLineItem"]] = relationship(
        "PayrollLineItem", back_populates="employee", cascade="all, delete-orphan"
    )

    @property
    def formatted_compliance_name(self) -> str:
        """
        Compliance Exporter formatting rule:
        '[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]'
        e.g. '001 - DANIAL DIRO 丹尼尔'
        """
        local_suffix = f" {self.name_local}" if self.name_local else ""
        return f"{self.employee_number} - {self.name_english.upper()}{local_suffix}"

    def __repr__(self) -> str:
        return f"<Employee {self.employee_number} {self.name_english}>"


# ── Salary Component (Audit Trail) ──────────────────────────────────
class SalaryComponent(Base):
    """
    Time-series salary breakdown for each employee.
    Tracks changes over time for the Cost-Productivity Matrix.

    The `component_type` field categorizes compensation elements:
    - base: Monthly base salary
    - allowance: Housing, transport, meal allowances
    - bonus: Performance bonuses
    - overtime: OT pay calculated per Akta Kerja 1955
    - deduction: Salary deductions (unpaid leave, etc.)

    Statutory contributions (EPF, SOCSO, EIS) are calculated dynamically
    by the StatutoryCalculator service — NOT stored as components — to
    ensure they always reflect current legislative rates.
    """
    __tablename__ = "salary_components"
    __table_args__ = (
        Index("ix_salary_components_employee_period", "employee_id", "effective_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    component_type: Mapped[str] = mapped_column(
        SAEnum("base", "allowance", "bonus", "overtime", "deduction",
               name="salary_component_type_enum"),
        nullable=False,
    )
    component_name: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="salary_components"
    )

    def __repr__(self) -> str:
        return f"<SalaryComponent {self.component_type}:{self.amount}>"
