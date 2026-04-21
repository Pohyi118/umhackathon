# -*- coding: utf-8 -*-
"""Pydantic schemas for Dashboard analytics endpoints."""

from datetime import date, datetime
from typing import Optional, List, Dict

from pydantic import BaseModel


class FinanceCardData(BaseModel):
    """Data for the Finance Card on the dashboard."""
    next_payout_date: date
    cycle_progress_percent: float
    total_payroll_rm: float
    total_employer_cost_rm: float
    employee_count: int
    last_run_status: str


class HeadcountMetrics(BaseModel):
    """Data for the Headcount & Location card."""
    total_active: int
    growth_percent: float
    office_count: int
    remote_count: int
    hybrid_count: int
    new_hires_this_month: int


class AttendanceHeatmapCell(BaseModel):
    """Single cell in the attendance heatmap grid."""
    date: date
    attendance_rate: float
    total_present: int
    total_employees: int
    anomaly_count: int = 0


class AttendanceHeatmapData(BaseModel):
    """Data for the Attendance Heatmap visualization."""
    cells: List[AttendanceHeatmapCell]
    overall_rate: float
    period_start: date
    period_end: date


class TeamEnergyData(BaseModel):
    """Data for the Team Energy sentiment visualization."""
    energetic_percent: float
    balanced_percent: float
    muted_percent: float
    total_responses: int
    week_start: date
    trend: str  # 'up' | 'stable' | 'down'


class DepartmentSplitItem(BaseModel):
    department_name: str
    employee_count: int
    percentage: float
    color: str


class DepartmentSplitData(BaseModel):
    items: List[DepartmentSplitItem]
    total: int


class PipelineRole(BaseModel):
    role_title: str
    department: str
    days_open: int
    priority: str  # 'high' | 'medium' | 'low'
    candidates_count: int


class PipelineActivityData(BaseModel):
    avg_hire_time_days: float
    open_positions: int
    roles: List[PipelineRole]


class AnomalyAlert(BaseModel):
    employee_id: str
    employee_name: str
    anomaly_type: str
    severity: str
    description: str
    detected_at: datetime


class DashboardOverview(BaseModel):
    """Complete dashboard data payload."""
    finance: FinanceCardData
    headcount: HeadcountMetrics
    attendance_heatmap: AttendanceHeatmapData
    team_energy: TeamEnergyData
    department_split: DepartmentSplitData
    pipeline: PipelineActivityData
    anomaly_alerts: List[AnomalyAlert]
