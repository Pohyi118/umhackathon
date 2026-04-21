# -*- coding: utf-8 -*-
"""
PeopleGraph — ORM Model Registry
==================================
Import all models here so Alembic and the application can discover them.
"""

from app.models.employee import Employee, Department, SalaryComponent
from app.models.performance import (
    AttendanceLog,
    SentimentScore,
    ProductivityMetric,
    PerformanceSnapshot,
)
from app.models.benchmark import BenchmarkIntelligence
from app.models.payroll import PayrollRun, PayrollLineItem, ComplianceReceipt
from app.models.user import User, Role

__all__ = [
    "Employee",
    "Department",
    "SalaryComponent",
    "AttendanceLog",
    "SentimentScore",
    "ProductivityMetric",
    "PerformanceSnapshot",
    "BenchmarkIntelligence",
    "PayrollRun",
    "PayrollLineItem",
    "ComplianceReceipt",
    "User",
    "Role",
]
