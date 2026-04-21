# -*- coding: utf-8 -*-
"""
PeopleGraph — Anomaly Detection Service (Isolation Forest)
============================================================
Detects hidden inefficiencies: irregular overtime claims, sudden
productivity drops, compliance discrepancies.

Integration flow:
1. Scheduled job reads from attendance_logs + productivity_metrics
2. Builds feature vectors per employee per month
3. Runs Isolation Forest (sklearn.ensemble.IsolationForest)
4. Writes anomaly flags back to PerformanceSnapshot
5. Dashboard queries flagged records for alert cards

Feature vector:
[attendance_rate, avg_daily_hours, overtime_ratio,
 productivity_score, absence_frequency, late_clock_in_count]
"""

import logging
from typing import List, Dict, Optional
from dataclasses import dataclass

import numpy as np

logger = logging.getLogger(__name__)

# Scikit-learn is imported lazily to avoid cold-start penalty
# on endpoints that don't need ML inference.
_isolation_forest = None


@dataclass
class AnomalyResult:
    """Result of anomaly detection for one employee-month."""
    employee_id: str
    month: str
    is_anomaly: bool
    anomaly_score: float
    reasons: List[str]
    feature_vector: Dict[str, float]


def _get_isolation_forest(contamination: float = 0.05):
    """Lazy-load the Isolation Forest model."""
    global _isolation_forest
    if _isolation_forest is None:
        from sklearn.ensemble import IsolationForest
        _isolation_forest = IsolationForest(
            n_estimators=200,
            contamination=contamination,
            random_state=42,
            n_jobs=-1,  # Use all CPU cores
        )
    return _isolation_forest


def build_feature_vectors(employee_snapshots: List[Dict]) -> np.ndarray:
    """
    Transform raw employee monthly data into ML feature vectors.

    Expected input format per employee:
    {
        "employee_id": "uuid",
        "month": "2025-04-01",
        "attendance_rate": 0.95,
        "avg_daily_hours": 8.2,
        "total_overtime_hours": 45.0,
        "productivity_score": 0.78,
        "absence_count": 2,
        "late_count": 3,
        "total_working_days": 22,
    }
    """
    features = []
    for snap in employee_snapshots:
        working_days = snap.get("total_working_days", 22)
        total_ot = snap.get("total_overtime_hours", 0)

        feature_vec = [
            snap.get("attendance_rate", 0.0),
            snap.get("avg_daily_hours", 0.0),
            # Overtime ratio: OT hours / total possible hours
            total_ot / (working_days * 8) if working_days > 0 else 0,
            snap.get("productivity_score", 0.0),
            # Absence frequency as fraction of working days
            snap.get("absence_count", 0) / working_days if working_days > 0 else 0,
            snap.get("late_count", 0) / working_days if working_days > 0 else 0,
        ]
        features.append(feature_vec)

    return np.array(features)


FEATURE_NAMES = [
    "attendance_rate",
    "avg_daily_hours",
    "overtime_ratio",
    "productivity_score",
    "absence_frequency",
    "late_frequency",
]

# Thresholds for generating human-readable anomaly reasons
ANOMALY_THRESHOLDS = {
    "overtime_ratio": 0.6,       # OT > 60% of regular hours is suspicious
    "absence_frequency": 0.15,   # Absent > 15% of working days
    "late_frequency": 0.2,       # Late > 20% of working days
    "attendance_rate": 0.85,     # Below 85% attendance
}


def detect_anomalies(
    employee_snapshots: List[Dict],
    contamination: float = 0.05,
) -> List[AnomalyResult]:
    """
    Run Isolation Forest anomaly detection on employee performance data.

    Args:
        employee_snapshots: List of monthly performance dicts
        contamination: Expected proportion of anomalies (default 5%)

    Returns:
        List of AnomalyResult with scores and human-readable reasons
    """
    if len(employee_snapshots) < 10:
        logger.warning(
            "Insufficient data for anomaly detection (%d records). "
            "Minimum 10 required for meaningful results.",
            len(employee_snapshots),
        )
        return []

    # Build feature matrix
    X = build_feature_vectors(employee_snapshots)

    # Fit and predict
    model = _get_isolation_forest(contamination)
    predictions = model.fit_predict(X)       # -1 = anomaly, 1 = normal
    scores = model.decision_function(X)      # Lower = more anomalous

    results = []
    for i, snap in enumerate(employee_snapshots):
        is_anomaly = predictions[i] == -1
        feature_dict = {name: float(X[i][j]) for j, name in enumerate(FEATURE_NAMES)}

        # Generate human-readable reasons for anomalies
        reasons = []
        if is_anomaly:
            if feature_dict["overtime_ratio"] > ANOMALY_THRESHOLDS["overtime_ratio"]:
                reasons.append(
                    f"Excessive overtime ratio: {feature_dict['overtime_ratio']:.1%} "
                    f"(threshold: {ANOMALY_THRESHOLDS['overtime_ratio']:.0%})"
                )
            if feature_dict["absence_frequency"] > ANOMALY_THRESHOLDS["absence_frequency"]:
                reasons.append(
                    f"High absence frequency: {feature_dict['absence_frequency']:.1%}"
                )
            if feature_dict["attendance_rate"] < ANOMALY_THRESHOLDS["attendance_rate"]:
                reasons.append(
                    f"Low attendance rate: {feature_dict['attendance_rate']:.1%}"
                )
            if feature_dict["late_frequency"] > ANOMALY_THRESHOLDS["late_frequency"]:
                reasons.append(
                    f"Frequent late clock-ins: {feature_dict['late_frequency']:.1%}"
                )
            if not reasons:
                reasons.append("Multivariate anomaly detected by Isolation Forest")

        results.append(AnomalyResult(
            employee_id=snap["employee_id"],
            month=snap["month"],
            is_anomaly=is_anomaly,
            anomaly_score=float(scores[i]),
            reasons=reasons,
            feature_vector=feature_dict,
        ))

    anomaly_count = sum(1 for r in results if r.is_anomaly)
    logger.info(
        "Anomaly detection complete: %d/%d flagged (%.1f%%)",
        anomaly_count, len(results), anomaly_count / len(results) * 100,
    )

    return results
