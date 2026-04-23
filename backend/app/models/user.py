# -*- coding: utf-8 -*-
"""
PeopleGraph — User & RBAC Models
Enforces strict Role-Based Access Control per Critical Rule #4.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Role(Base):
    """
    RBAC roles controlling access to sensitive endpoints:
    - 'owner': Full access including Cost-Productivity Matrix, PerformanceMatrix, financial data
    - 'hr_admin': Employee CRUD, attendance, payroll processing
    - 'hr_viewer': Read-only HR data (no financial data)
    - 'manager': Department-scoped access to team metrics
    - 'employee': Self-service portal only
    """
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(200))
    can_view_financials: Mapped[bool] = mapped_column(Boolean, default=False)
    can_view_performance_matrix: Mapped[bool] = mapped_column(Boolean, default=False)
    can_run_payroll: Mapped[bool] = mapped_column(Boolean, default=False)
    can_manage_employees: Mapped[bool] = mapped_column(Boolean, default=False)
    can_view_analytics: Mapped[bool] = mapped_column(Boolean, default=False)
    can_export_compliance: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class User(Base):
    """Application user with RBAC role assignment."""
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_email", "email", unique=True),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("employees.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)

    role: Mapped["Role"] = relationship("Role")
