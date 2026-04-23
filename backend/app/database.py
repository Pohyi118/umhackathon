# -*- coding: utf-8 -*-
"""
PeopleGraph — Database Engine & Session Management
====================================================
Async SQLAlchemy engine with session dependency injection for FastAPI.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# ── Async Engine ─────────────────────────────────────────────────────
# pool_size=20 is tuned for SME workloads (< 50 concurrent users).
# For hackathon/dev, SQLite can be swapped in via DATABASE_URL.
# If using Supabase Transaction Pooler (port 6543), we disable SQLAlchemy's internal pool
is_pooler = "6543" in settings.DATABASE_URL

engine_kwargs = {
    "echo": settings.DEBUG,
    "pool_pre_ping": True,
}

if is_pooler:
    # Disable SQLAlchemy pooling because Supabase is already pooling connections
    engine_kwargs["poolclass"] = NullPool
    # Disable asyncpg prepared statement cache for transaction poolers
    engine_kwargs["connect_args"] = {"statement_cache_size": 0, "prepared_statement_cache_size": 0}
else:
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 10

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

# ── Session Factory ──────────────────────────────────────────────────
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Declarative Base ─────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── FastAPI Dependency ───────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """
    Yields an async database session for each request.
    Automatically commits on success and rolls back on exception.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
