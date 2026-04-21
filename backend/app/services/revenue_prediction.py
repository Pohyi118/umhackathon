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
    model = _get_ensemble_model()
    
    # Check if model is fitted
    try:
        from sklearn.exceptions import NotFittedError
        # Simple check
        model.predict([[1, 5000, 0.5, 0.5]])
    except NotFittedError:
        # Fallback to a simple heuristic if not trained
        logger.warning("Model not fitted. Using baseline heuristic.")
        total_salary = sum(hire.get("salary", 5000) for hire in proposed_hires)
        # Assume 1.5x to 3x ROI
        return total_salary * 2.2, 0.65
    except Exception as e:
        pass
        
    X_pred = []
    for hire in proposed_hires:
        features = [
            1, # Headcount = 1 per hire
            hire.get("salary", 0),
            hire.get("automation_potential", 0.5),
            0.6, # Default expected sentiment
        ]
        X_pred.append(features)
        
    if not X_pred:
        return 0.0, 0.0
        
    predictions = model.predict(X_pred)
    total_impact = sum(predictions)
    
    # Simple confidence score based on feature variance or data size (mocked for demo)
    confidence_score = 0.85 
    
    return total_impact, confidence_score
