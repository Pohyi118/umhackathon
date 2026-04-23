# -*- coding: utf-8 -*-
"""
PeopleGraph — Revenue Prediction Service
==========================================
Ensemble Forecasting models for revenue prediction.
Uses historical performance data to predict future revenue impact
of new hires or restructuring decisions.
"""

import logging
from typing import List, Dict, Tuple
import numpy as np

logger = logging.getLogger(__name__)

# Lazy load models
_ensemble_model = None

def _get_ensemble_model():
    """Lazy-load the Ensemble Forecasting model (Random Forest + Gradient Boosting)."""
    global _ensemble_model
    if _ensemble_model is None:
        from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
        from sklearn.ensemble import VotingRegressor
        
        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        gb = GradientBoostingRegressor(n_estimators=100, random_state=42)
        
        _ensemble_model = VotingRegressor(estimators=[('rf', rf), ('gb', gb)])
    return _ensemble_model


def train_predictive_model(historical_data: List[Dict]):
    """
    Train the model using historical data.
    historical_data: list of dicts with features and 'output_value_rm' (target)
    """
    if len(historical_data) < 20:
        logger.warning("Not enough historical data to train the model. Minimum 20 records required.")
        return False
        
    X = []
    y = []
    
    for record in historical_data:
        # Example features: headcount, avg_salary, automation_potential, avg_sentiment
        features = [
            record.get("headcount", 1),
            record.get("avg_salary", 0),
            record.get("automation_potential", 0.5),
            record.get("avg_sentiment", 0.5),
        ]
        X.append(features)
        y.append(record.get("output_value_rm", 0))
        
    model = _get_ensemble_model()
    model.fit(X, y)
    logger.info("Ensemble Forecasting model trained successfully.")
    return True


def predict_revenue_impact(proposed_hires: List[Dict]) -> Tuple[float, float]:
    """
    Predict the revenue increase for a given set of proposed hires.
    Returns:
        predicted_revenue_increase: float
        confidence_score: float (0.0 to 1.0)
    """
    # For demo purposes, use simple heuristic instead of complex ML model
    total_salary = sum(hire.get("salary", 5000) for hire in proposed_hires)
    # Assume 1.5x to 3x ROI based on department and automation potential
    avg_automation = sum(hire.get("automation_potential", 0.5) for hire in proposed_hires) / len(proposed_hires)
    roi_multiplier = 2.2 + (avg_automation * 0.5)  # Higher automation = higher ROI
    
    return total_salary * roi_multiplier, 0.75
