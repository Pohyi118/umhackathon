# -*- coding: utf-8 -*-
"""
PeopleGraph — PerformanceMatrix Models
========================================
Time-series data entities for the DSS analytics layer.

These models feed:
- Attendance Heatmap (daily attendance rates)
- Team Energy sentiment visualization
- Cost-Productivity Matrix scatter plot
- Isolation Forest anomaly detection pipeline

Design note on Isolation Forest integration:
─────────────────────────────────────────────
The anomaly detector runs as a scheduled batch job (via Celery or cron).
It reads from `attendance_logs` and `productivity_metrics`, computes
feature vectors (hours_worked, overtime_ratio, absence_frequency,
productivity_score), and flags outliers by writing `is_anomaly=True`
back to the relevant records. The dashboard then queries for flagged
records to surface alerts.
"""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    String, Float, Date, DateTime, ForeignKey, Text, Integer,
    Boolean, Index, SmallInteger,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON as JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Attendance Log ───────────────────────────────────────────────────
class AttendanceLog(Base):
    """
    Daily attendance record per employee.

    Used by:
    - Attendance Heatmap: aggregated daily rates across all employees
    - Anomaly Detection: irregular patterns (sudden absences, OT spikes)

    Isolation Forest feature vector contribution:
    - `hours_worked` → continuous feature
    - `overtime_hours` → continuous feature (flag if > 104hrs/month per EA1955)
    - `status` → categorical (encode as binary: present=1, absent=0)
    """
    __tablename__ = "attendance_logs"
    __table_args__ = (
        Index("ix_attendance_employee_date", "employee_id", "log_date", unique=True),
        Index("ix_attendance_date", "log_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    clock_in: Mapped[Optional[datetime]] = mapped_column(DateTime)
    clock_out: Mapped[Optional[datetime]] = mapped_column(DateTime)
    hours_worked: Mapped[float] = mapped_column(Float, default=0.0)
    overtime_hours: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="OT hours for this day — feeds into EA1955 compliance check"
    )
    status: Mapped[str] = mapped_column(
        String(20), default="present",
        comment="present | absent | leave | half_day | public_holiday"
    )
    # ── Anomaly Detection flag ───────────────────────────────────────
    is_anomaly: Mapped[bool] = mapped_column(
        Boolean, default=False,
        comment="Set to True by the Isolation Forest batch pipeline"
    )
    anomaly_score: Mapped[Optional[float]] = mapped_column(
        Float, comment="Isolation Forest decision function score (-1 to 1)"
    )
    anomaly_details: Mapped[Optional[dict]] = mapped_column(
        JSONB, comment="Structured explanation of why this was flagged"
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="attendance_logs"
    )

    def __repr__(self) -> str:
        return f"<AttendanceLog {self.employee_id} {self.log_date} {self.status}>"


# ── Sentiment Score ──────────────────────────────────────────────────
class SentimentScore(Base):
    """
    Weekly aggregated sentiment from pulse surveys or NLP analysis.

    Feeds the "Team Energy" visualization:
    - Energetic (score > 0.6)
    - Balanced  (0.3 ≤ score ≤ 0.6)
    - Muted     (score < 0.3)

    NLP Pipeline:
    The sentiment engine uses a lightweight HuggingFace transformer
    (cardiffnlp/twitter-xlm-roberta-base-sentiment) to classify
    anonymous pulse-check responses. Scores are averaged per department
    per week and stored here.
    """
    __tablename__ = "sentiment_scores"
    __table_args__ = (
        Index("ix_sentiment_dept_week", "department_id", "week_start_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False
    )
    week_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    # Score ranges from 0.0 (very negative) to 1.0 (very positive)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    # Breakdown counts for the segmented progress bar
    energetic_count: Mapped[int] = mapped_column(Integer, default=0)
    balanced_count: Mapped[int] = mapped_column(Integer, default=0)
    muted_count: Mapped[int] = mapped_column(Integer, default=0)
    total_responses: Mapped[int] = mapped_column(Integer, default=0)
    raw_texts_sample: Mapped[Optional[dict]] = mapped_column(
        JSONB, comment="Sample anonymized responses for explainability"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<SentimentScore dept={self.department_id} week={self.week_start_date} score={self.score}>"


# ── Productivity Metric ──────────────────────────────────────────────
class ProductivityMetric(Base):
    """
    Project-based or role-based productivity measurement.

    Used by:
    - Cost-Productivity Matrix (Y-axis: Quantified Output Value)
    - Ensemble Forecasting model (feature: historical output per role)
    - Isolation Forest (sudden productivity drops)

    `output_value_rm` quantifies the employee/department contribution
    in MYR terms (revenue generated, cost saved, etc.)
    """
    __tablename__ = "productivity_metrics"
    __table_args__ = (
        Index("ix_productivity_employee_period", "employee_id", "period_start"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    metric_type: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="e.g. 'revenue_generated', 'tasks_completed', 'deals_closed'"
    )
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    output_value_rm: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="Monetized output value in MYR for Cost-Productivity Matrix"
    )
    # ── Anomaly Detection ────────────────────────────────────────────
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_score: Mapped[Optional[float]] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ProductivityMetric {self.metric_type}={self.metric_value}>"


# ── Performance Snapshot (Materialized aggregate) ────────────────────
class PerformanceSnapshot(Base):
    """
    Pre-computed monthly aggregate per employee for fast dashboard queries.
    This is a denormalized view refreshed by a scheduled ETL job.

    Contains the combined feature vector used by the Isolation Forest:
    [attendance_rate, avg_hours, overtime_ratio, productivity_score, sentiment_avg]
    """
    __tablename__ = "performance_snapshots"
    __table_args__ = (
        Index("ix_perf_snapshot_employee_month", "employee_id", "month", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False
    )
    month: Mapped[date] = mapped_column(
        Date, nullable=False, comment="First day of the month"
    )

    # ── Aggregated metrics ───────────────────────────────────────────
    attendance_rate: Mapped[float] = mapped_column(Float, default=0.0)
    total_hours_worked: Mapped[float] = mapped_column(Float, default=0.0)
    total_overtime_hours: Mapped[float] = mapped_column(Float, default=0.0)
    productivity_score: Mapped[float] = mapped_column(Float, default=0.0)
    sentiment_avg: Mapped[Optional[float]] = mapped_column(Float)

    # ── Cost metrics (snapshot of that month's labor cost) ───────────
    total_labor_cost_rm: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="Base + Allowances + EPF_employer + SOCSO_employer + EIS_employer"
    )
    output_value_rm: Mapped[float] = mapped_column(
        Float, default=0.0,
        comment="Total quantified output for Cost-Productivity Matrix"
    )

    # ── Anomaly Detection (composite) ────────────────────────────────
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_score: Mapped[Optional[float]] = mapped_column(Float)
    anomaly_reasons: Mapped[Optional[dict]] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<PerformanceSnapshot emp={self.employee_id} month={self.month}>"
