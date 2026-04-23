# -*- coding: utf-8 -*-
"""
PeopleGraph — Application Configuration
========================================
Centralized settings management using Pydantic BaseSettings.
All secrets are loaded from environment variables or a .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    For local development, create a .env file in /backend/.
    """

    # ── Application ──────────────────────────────────────────────────
    APP_NAME: str = "PeopleGraph"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "CHANGE-ME-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Database (PostgreSQL) ────────────────────────────────────────
    # Format: postgresql+asyncpg://user:pass@host:port/dbname
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/peoplegraph"
    # Synchronous URL for Alembic migrations
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@localhost:5432/peoplegraph"

    # ── CORS ─────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ── Malaysian Statutory Rates (2024/2025) ────────────────────────
    # These are configurable so they can be updated when legislation changes
    # without redeploying the entire application.
    EPF_EMPLOYEE_RATE_BELOW_60: float = 0.11       # 11% employee contribution
    EPF_EMPLOYER_RATE_SALARY_LTE_5000: float = 0.13  # 13% for salary ≤ RM5000
    EPF_EMPLOYER_RATE_SALARY_GT_5000: float = 0.12   # 12% for salary > RM5000
    SOCSO_EMPLOYER_RATE: float = 0.0175              # 1.75% capped at RM6,000
    SOCSO_EMPLOYEE_RATE: float = 0.005               # 0.5% capped at RM6,000
    SOCSO_SALARY_CAP: float = 6000.0
    EIS_RATE: float = 0.002                          # 0.2% each (employer + employee)
    EIS_SALARY_CAP: float = 6000.0

    # ── Neo4j (Legacy graph for Akta Kerja 1955 rules) ──────────────
    NEO4J_URI: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None

    # ── ML/AI Configuration ──────────────────────────────────────────
    SENTIMENT_MODEL_NAME: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    ANOMALY_CONTAMINATION: float = 0.05  # Isolation Forest contamination param

    model_config = {
        "env_file": ENV_PATH,
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton instance used across the application
settings = Settings()
