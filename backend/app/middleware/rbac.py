# -*- coding: utf-8 -*-
"""
PeopleGraph — RBAC Middleware
===============================
Enforces strict Role-Based Access Control on all API endpoints.
Critical Rule #4: Cost-Productivity Matrix and PerformanceMatrix
data is restricted to authorized roles only.
"""

from functools import wraps
from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User, Role

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from JWT token."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(
        select(User).where(User.id == user_id).options()
    )
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exception

    # Eagerly load role
    await db.refresh(user, ["role"])
    return user


def require_permissions(*permissions: str):
    """
    Decorator/dependency factory for endpoint-level RBAC.

    Usage:
        @router.get("/analytics/cost-matrix")
        async def cost_matrix(user: User = Depends(require_permissions("can_view_financials", "can_view_performance_matrix"))):
            ...

    This enforces that the user's role has ALL specified permission flags set to True.
    """
    async def permission_checker(
        user: User = Depends(get_current_user),
    ) -> User:
        role = user.role
        missing = []

        for perm in permissions:
            if not getattr(role, perm, False):
                missing.append(perm)

        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "Insufficient permissions",
                    "missing_permissions": missing,
                    "your_role": role.name,
                },
            )

        return user

    return permission_checker


# ── Pre-built dependency shortcuts ───────────────────────────────────
require_financial_access = require_permissions("can_view_financials")
require_performance_access = require_permissions("can_view_performance_matrix")
require_payroll_access = require_permissions("can_run_payroll")
require_employee_management = require_permissions("can_manage_employees")
require_analytics_access = require_permissions("can_view_analytics")
require_compliance_export = require_permissions("can_export_compliance")

# For the Cost-Productivity Matrix — requires BOTH financial and performance access
require_cost_matrix_access = require_permissions(
    "can_view_financials", "can_view_performance_matrix"
)
