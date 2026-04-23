# -*- coding: utf-8 -*-
"""
PeopleGraph — BenchmarkIntelligence Model
Industry benchmark data for Malaysian sectors (F&B, Tech, Manufacturing).
"""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import String, Float, Date, DateTime, Integer, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BenchmarkIntelligence(Base):
    __tablename__ = "benchmark_intelligence"
    __table_args__ = (
        Index("ix_benchmark_sector_role", "sector", "role_category"),
        Index("ix_benchmark_period", "period_start", "period_end"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sector: Mapped[str] = mapped_column(String(50), nullable=False)
    role_category: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[str] = mapped_column(String(50), default="MY")
    company_size_bracket: Mapped[str] = mapped_column(String(30), default="sme")

    # Cost Benchmarks (MYR)
    avg_monthly_salary_rm: Mapped[float] = mapped_column(Float, nullable=False)
    median_monthly_salary_rm: Mapped[float] = mapped_column(Float, nullable=False)
    avg_total_labor_cost_rm: Mapped[float] = mapped_column(Float, nullable=False)
    cost_per_hire_rm: Mapped[Optional[float]] = mapped_column(Float)
    avg_turnover_cost_rm: Mapped[Optional[float]] = mapped_column(Float)

    # Productivity Benchmarks
    avg_output_value_rm: Mapped[float] = mapped_column(Float, default=0.0)
    avg_revenue_per_employee_rm: Mapped[Optional[float]] = mapped_column(Float)
    productivity_ratio: Mapped[float] = mapped_column(Float, default=1.0)

    # Workforce Metrics
    avg_tenure_months: Mapped[Optional[float]] = mapped_column(Float)
    avg_attendance_rate: Mapped[float] = mapped_column(Float, default=0.95)
    avg_overtime_hours_monthly: Mapped[Optional[float]] = mapped_column(Float)
    turnover_rate_annual: Mapped[Optional[float]] = mapped_column(Float)
    avg_time_to_hire_days: Mapped[Optional[int]] = mapped_column(Integer)
    automation_potential_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Period & Source
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    data_source: Mapped[Optional[str]] = mapped_column(Text)
    sample_size: Mapped[Optional[int]] = mapped_column(Integer)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.85)
    extended_metrics: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
