# -*- coding: utf-8 -*-
"""
PeopleGraph — AI Analytics Router
===================================
Endpoints for Predictive Simulation, Onboarding AI, and Cost-Productivity Matrix.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.revenue_prediction import predict_revenue_impact
from app.services.onboarding_ai import generate_onboarding_packages
from app.middleware.rbac import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/ai", tags=["AI Analytics"])

class ProposedHire(BaseModel):
    role_title: str
    salary: float
    automation_potential: float = 0.5
    department: str

class SimulationRequest(BaseModel):
    proposed_hires: List[ProposedHire]

class SimulationResponse(BaseModel):
    projected_revenue_increase_rm: float
    confidence_score: float

class OnboardingRequest(BaseModel):
    semantic_description: str

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_revenue_impact(
    request: SimulationRequest,
    # Temporarily disabled for demo: user: User = Depends(get_current_user)
):
    """Predicts the revenue impact of proposed new hires using Ensemble Forecasting."""
    hires_data = [hire.dict() for hire in request.proposed_hires]
    impact, confidence = predict_revenue_impact(hires_data)
    
    return SimulationResponse(
        projected_revenue_increase_rm=impact,
        confidence_score=confidence
    )

@router.post("/onboarding/suggest-package")
async def suggest_package(request: OnboardingRequest):
    """Uses YTL AI Labs ILMU-GLM-5.1 to suggest a customized SaaS package."""
    result = generate_onboarding_packages(request.semantic_description)
    return result

@router.get("/cost-productivity-matrix")
async def get_cost_productivity_matrix(user: User = Depends(get_current_user)):
    """
    Returns data for the Cost-Productivity Matrix scatter plot.
    X-axis: Total Labor Cost
    Y-axis: Quantified Output Value
    """
    # MOCK DATA for now. In a real scenario, this queries PerformanceSnapshot.
    return {
        "data": [
            {"id": "dept-1", "name": "Technology", "cost_rm": 150000, "output_value_rm": 450000, "automation_potential": 0.3},
            {"id": "dept-2", "name": "Sales", "cost_rm": 80000, "output_value_rm": 320000, "automation_potential": 0.2},
            {"id": "dept-3", "name": "Operations", "cost_rm": 120000, "output_value_rm": 180000, "automation_potential": 0.6},
            {"id": "dept-4", "name": "Finance", "cost_rm": 40000, "output_value_rm": 90000, "automation_potential": 0.7},
            {"id": "dept-5", "name": "HR", "cost_rm": 30000, "output_value_rm": 60000, "automation_potential": 0.4},
        ]
    }
