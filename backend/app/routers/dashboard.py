# -*- coding: utf-8 -*-
"""
PeopleGraph — Dashboard Analytics Router
Serves the Overview Dashboard: Finance Card, Attendance Heatmap,
Headcount, Team Energy, Department Split, Pipeline Activity.
"""

from datetime import date, timedelta, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.employee import Employee, Department
from app.models.performance import AttendanceLog, SentimentScore, PerformanceSnapshot
from app.models.payroll import PayrollRun
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverview, FinanceCardData, HeadcountMetrics,
    AttendanceHeatmapData, AttendanceHeatmapCell,
    TeamEnergyData, DepartmentSplitData, DepartmentSplitItem,
    PipelineActivityData, PipelineRole, AnomalyAlert,
)
from app.middleware.rbac import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

# Color palette for department split chart
DEPT_COLORS = [
    "#7C3AED", "#A78BFA", "#C4B5FD", "#DDD6FE",
    "#8B5CF6", "#6D28D9", "#5B21B6", "#4C1D95",
]


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    # Temporarily disabled for demo: user: User = Depends(get_current_user),
):
    """
    Single endpoint for the complete dashboard view.
    Designed to minimize frontend API calls — fetch once, render all cards.
    """
    today = date.today()

    finance = await _get_finance_card(db, today)
    headcount = await _get_headcount(db, today)
    heatmap = await _get_attendance_heatmap(db, today)
    energy = await _get_team_energy(db, today)
    dept_split = await _get_department_split(db)
    pipeline = _get_pipeline_activity()
    alerts = await _get_anomaly_alerts(db)

    return DashboardOverview(
        finance=finance,
        headcount=headcount,
        attendance_heatmap=heatmap,
        team_energy=energy,
        department_split=dept_split,
        pipeline=pipeline,
        anomaly_alerts=alerts,
    )


async def _get_finance_card(db: AsyncSession, today: date) -> FinanceCardData:
    """Build Finance Card data from latest payroll run."""
    result = await db.execute(
        select(PayrollRun).order_by(PayrollRun.run_date.desc()).limit(1)
    )
    last_run = result.scalar_one_or_none()

    # Calculate next payout (assume monthly, last day of current month)
    if today.month == 12:
        next_payout = date(today.year + 1, 1, 25)
    else:
        next_payout = date(today.year, today.month + 1, 25)

    # Cycle progress: days elapsed / total days in cycle
    cycle_start = today.replace(day=1)
    cycle_end = next_payout
    total_days = (cycle_end - cycle_start).days or 1
    elapsed = (today - cycle_start).days
    progress = min(round((elapsed / total_days) * 100, 1), 100)

    return FinanceCardData(
        next_payout_date=next_payout,
        cycle_progress_percent=progress,
        total_payroll_rm=last_run.total_gross_rm if last_run else 0,
        total_employer_cost_rm=(
            last_run.total_gross_rm + last_run.total_employer_statutory_rm
            if last_run else 0
        ),
        employee_count=last_run.employee_count if last_run else 0,
        last_run_status=last_run.status if last_run else "none",
    )


async def _get_headcount(db: AsyncSession, today: date) -> HeadcountMetrics:
    """Build Headcount & Location card data."""
    # Current active counts by location
    result = await db.execute(
        select(
            Employee.work_location,
            func.count(Employee.id),
        )
        .where(Employee.is_active == True)
        .group_by(Employee.work_location)
    )
    location_counts = {row[0]: row[1] for row in result.all()}

    total = sum(location_counts.values())

    # New hires this month
    month_start = today.replace(day=1)
    new_hires_result = await db.execute(
        select(func.count(Employee.id)).where(
            and_(Employee.hire_date >= month_start, Employee.is_active == True)
        )
    )
    new_hires = new_hires_result.scalar() or 0

    # Growth: compare with last month's total (simplified)
    last_month = month_start - timedelta(days=1)
    last_month_start = last_month.replace(day=1)
    prev_result = await db.execute(
        select(func.count(Employee.id)).where(
            Employee.hire_date < month_start
        )
    )
    prev_total = prev_result.scalar() or 1
    growth = round(((total - prev_total) / prev_total) * 100, 1) if prev_total else 0

    return HeadcountMetrics(
        total_active=total,
        growth_percent=growth,
        office_count=location_counts.get("office", 0),
        remote_count=location_counts.get("remote", 0),
        hybrid_count=location_counts.get("hybrid", 0),
        new_hires_this_month=new_hires,
    )


async def _get_attendance_heatmap(
    db: AsyncSession, today: date
) -> AttendanceHeatmapData:
    """Build Attendance Heatmap data for the last 30 days."""
    period_start = today - timedelta(days=29)

    result = await db.execute(
        select(
            AttendanceLog.log_date,
            func.count(AttendanceLog.id).label("total"),
            func.sum(
                case((AttendanceLog.status == "present", 1), else_=0)
            ).label("present"),
            func.sum(
                case((AttendanceLog.is_anomaly == True, 1), else_=0)
            ).label("anomalies"),
        )
        .where(AttendanceLog.log_date.between(period_start, today))
        .group_by(AttendanceLog.log_date)
        .order_by(AttendanceLog.log_date)
    )
    rows = result.all()

    cells = []
    total_rate = 0.0
    for row in rows:
        rate = (row.present / row.total * 100) if row.total > 0 else 0
        total_rate += rate
        cells.append(AttendanceHeatmapCell(
            date=row.log_date,
            attendance_rate=round(rate, 1),
            total_present=row.present or 0,
            total_employees=row.total or 0,
            anomaly_count=row.anomalies or 0,
        ))

    overall = round(total_rate / len(cells), 1) if cells else 0

    return AttendanceHeatmapData(
        cells=cells,
        overall_rate=overall,
        period_start=period_start,
        period_end=today,
    )


async def _get_team_energy(db: AsyncSession, today: date) -> TeamEnergyData:
    """Build Team Energy sentiment data for the current week."""
    week_start = today - timedelta(days=today.weekday())

    result = await db.execute(
        select(
            func.sum(SentimentScore.energetic_count),
            func.sum(SentimentScore.balanced_count),
            func.sum(SentimentScore.muted_count),
            func.sum(SentimentScore.total_responses),
        )
        .where(SentimentScore.week_start_date == week_start)
    )
    row = result.one_or_none()

    if row and row[3] and row[3] > 0:
        total = row[3]
        energetic_pct = round((row[0] or 0) / total * 100, 1)
        balanced_pct = round((row[1] or 0) / total * 100, 1)
        muted_pct = round((row[2] or 0) / total * 100, 1)
    else:
        total = 0
        energetic_pct, balanced_pct, muted_pct = 45.0, 40.0, 15.0

    # Determine trend by comparing with previous week
    trend = "stable"
    prev_week = week_start - timedelta(days=7)
    prev_result = await db.execute(
        select(func.avg(SentimentScore.score))
        .where(SentimentScore.week_start_date == prev_week)
    )
    curr_result = await db.execute(
        select(func.avg(SentimentScore.score))
        .where(SentimentScore.week_start_date == week_start)
    )
    prev_avg = prev_result.scalar()
    curr_avg = curr_result.scalar()
    if prev_avg and curr_avg:
        if curr_avg > prev_avg + 0.05:
            trend = "up"
        elif curr_avg < prev_avg - 0.05:
            trend = "down"

    return TeamEnergyData(
        energetic_percent=energetic_pct,
        balanced_percent=balanced_pct,
        muted_percent=muted_pct,
        total_responses=total,
        week_start=week_start,
        trend=trend,
    )


async def _get_department_split(db: AsyncSession) -> DepartmentSplitData:
    """Build Department Split concentric circle chart data."""
    result = await db.execute(
        select(Department.name, func.count(Employee.id))
        .join(Employee, Employee.department_id == Department.id)
        .where(Employee.is_active == True)
        .group_by(Department.name)
        .order_by(func.count(Employee.id).desc())
    )
    rows = result.all()
    total = sum(r[1] for r in rows) or 1

    items = [
        DepartmentSplitItem(
            department_name=name,
            employee_count=count,
            percentage=round(count / total * 100, 1),
            color=DEPT_COLORS[i % len(DEPT_COLORS)],
        )
        for i, (name, count) in enumerate(rows)
    ]

    return DepartmentSplitData(items=items, total=total)


def _get_pipeline_activity() -> PipelineActivityData:
    """Pipeline data — placeholder for Phase 1 (ATS integration in Phase 3)."""
    return PipelineActivityData(
        avg_hire_time_days=23.5,
        open_positions=7,
        roles=[
            PipelineRole(role_title="Senior Frontend Engineer", department="Tech",
                         days_open=12, priority="high", candidates_count=8),
            PipelineRole(role_title="Operations Manager", department="Operations",
                         days_open=25, priority="high", candidates_count=3),
            PipelineRole(role_title="Sales Executive", department="Sales",
                         days_open=8, priority="medium", candidates_count=15),
        ],
    )


async def _get_anomaly_alerts(db: AsyncSession) -> list:
    """Fetch recent anomaly alerts from PerformanceSnapshot."""
    result = await db.execute(
        select(PerformanceSnapshot, Employee)
        .join(Employee, PerformanceSnapshot.employee_id == Employee.id)
        .where(PerformanceSnapshot.is_anomaly == True)
        .order_by(PerformanceSnapshot.created_at.desc())
        .limit(10)
    )
    rows = result.all()

    alerts = []
    for snapshot, employee in rows:
        reasons = snapshot.anomaly_reasons or {}
        alerts.append(AnomalyAlert(
            employee_id=str(employee.id),
            employee_name=employee.name_english,
            anomaly_type=list(reasons.keys())[0] if reasons else "multivariate",
            severity="high" if (snapshot.anomaly_score or 0) < -0.5 else "medium",
            description="; ".join(reasons.values()) if reasons else "Anomaly detected",
            detected_at=snapshot.created_at,
        ))

    return alerts
