# -*- coding: utf-8 -*-
"""
PeopleGraph — FastAPI Application Entry Point
================================================
Decision-Support HR Platform for Malaysian SMEs.

Mounts all routers, configures CORS, and provides health/seed endpoints.
"""

from contextlib import asynccontextmanager
from datetime import date, datetime
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, async_session_factory
from app.routers import employees, compliance, dashboard, ai_analytics


# ── Lifespan: create tables on startup ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (dev only — use Alembic in prod)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "PeopleGraph — Decision-Support HR Platform for Malaysian SMEs. "
        "Provides workforce analytics, compliance automation (EPF/SOCSO/EIS/PCB), "
        "and AI-powered recommendations."
    ),
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ────────────────────────────────────────────────────
app.include_router(employees.router)
app.include_router(compliance.router)
app.include_router(dashboard.router)
app.include_router(ai_analytics.router)


# ── Health Check ─────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Dev Seed Endpoint ────────────────────────────────────────────────
@app.post("/api/v1/seed", tags=["System"])
async def seed_demo_data():
    """
    Seed the database with demo data for development/demo purposes.
    This should be disabled in production.
    """
    from app.models.employee import Employee, Department
    from app.models.user import User, Role
    from app.models.performance import AttendanceLog, SentimentScore

    async with async_session_factory() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count(Department.id)))).scalar()
        if count > 0:
            return {"message": "Database already seeded", "departments": count}

        # Create roles
        owner_role = Role(
            name="owner", description="Full access",
            can_view_financials=True, can_view_performance_matrix=True,
            can_run_payroll=True, can_manage_employees=True,
            can_view_analytics=True, can_export_compliance=True,
        )
        hr_role = Role(
            name="hr_admin", description="HR administration",
            can_view_financials=False, can_view_performance_matrix=False,
            can_run_payroll=True, can_manage_employees=True,
            can_view_analytics=True, can_export_compliance=True,
        )
        db.add_all([owner_role, hr_role])
        await db.flush()

        # Create departments
        departments = [
            Department(name="Technology", name_bm="Teknologi", name_zh="技术部", cost_center_code="TECH"),
            Department(name="Sales", name_bm="Jualan", name_zh="销售部", cost_center_code="SALES"),
            Department(name="Operations", name_bm="Operasi", name_zh="运营部", cost_center_code="OPS"),
            Department(name="Finance", name_bm="Kewangan", name_zh="财务部", cost_center_code="FIN"),
            Department(name="Human Resources", name_bm="Sumber Manusia", name_zh="人力资源部", cost_center_code="HR"),
        ]
        db.add_all(departments)
        await db.flush()

        # Create sample employees
        sample_employees = [
            ("001", "Danial Diro", "丹尼尔", departments[0].id, "CTO", 12000, "office"),
            ("002", "Siti Aminah", "西蒂", departments[1].id, "Sales Director", 9500, "hybrid"),
            ("003", "Ahmad Bin Ismail", None, departments[2].id, "Operations Manager", 7000, "office"),
            ("004", "Lee Wei Lin", "李伟林", departments[0].id, "Senior Engineer", 8500, "remote"),
            ("005", "Priya Nair", None, departments[3].id, "Finance Executive", 4500, "office"),
            ("006", "Tan Mei Ling", "陈美玲", departments[0].id, "Frontend Developer", 6000, "remote"),
            ("007", "Muhammad Hafiz", None, departments[1].id, "Sales Executive", 3800, "office"),
            ("008", "Nurul Aisyah", None, departments[4].id, "HR Executive", 4200, "office"),
            ("009", "Raj Kumar", None, departments[2].id, "Warehouse Lead", 3500, "office"),
            ("010", "Wong Jia Hui", "黄嘉慧", departments[3].id, "Accountant", 5000, "hybrid"),
        ]

        employees = []
        for num, name_en, name_zh, dept_id, role, salary, loc in sample_employees:
            emp = Employee(
                employee_number=num, name_english=name_en, name_local=name_zh,
                department_id=dept_id, role_title=role,
                hire_date=date(2023, 1, 15), monthly_base_salary=salary,
                work_location=loc,
            )
            db.add(emp)
            employees.append(emp)
        await db.flush()

        # Create attendance logs for the last 30 days
        import random
        random.seed(42)
        for emp in employees:
            for day_offset in range(30):
                log_date = date.today() - __import__("datetime").timedelta(days=day_offset)
                if log_date.weekday() >= 5:
                    continue
                status = random.choices(
                    ["present", "present", "present", "present", "absent", "leave"],
                    weights=[70, 15, 8, 4, 2, 1],
                )[0]
                hours = round(random.uniform(7.5, 10.0), 1) if status == "present" else 0
                ot = max(0, hours - 8) if status == "present" else 0
                db.add(AttendanceLog(
                    employee_id=emp.id, log_date=log_date,
                    hours_worked=hours, overtime_hours=round(ot, 1),
                    status=status,
                ))
        await db.flush()

        # Create sentiment scores
        for dept in departments:
            import random as rng
            for week_offset in range(4):
                week_start = date.today() - __import__("datetime").timedelta(weeks=week_offset)
                week_start = week_start - __import__("datetime").timedelta(days=week_start.weekday())
                score = round(rng.uniform(0.3, 0.85), 2)
                total = rng.randint(8, 25)
                energetic = int(total * rng.uniform(0.3, 0.5))
                balanced = int(total * rng.uniform(0.25, 0.4))
                muted = total - energetic - balanced
                db.add(SentimentScore(
                    department_id=dept.id, week_start_date=week_start,
                    score=score, energetic_count=energetic,
                    balanced_count=balanced, muted_count=muted,
                    total_responses=total,
                ))

        await db.commit()
        return {"message": "Demo data seeded successfully", "employees": len(employees)}
