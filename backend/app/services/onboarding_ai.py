# -*- coding: utf-8 -*-
"""
PeopleGraph — Semantic Onboarding AI
======================================
Uses YTL AI Labs ILMU-GLM-5.1 to provide a personalized onboarding experience.
The SME owner inputs a semantic description of their business (scale, revenue, needs),
and the AI suggests the most suitable, modularised HR software packages.
"""

import logging
import os
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)

ILMU_API_URL = os.getenv("ILMU_API_URL", "https://api.zai.ytl.com/v1/chat/completions")
ILMU_API_KEY = os.getenv("ILMU_API_KEY", "your-ytl-ilmu-api-key")

def generate_onboarding_packages(semantic_description: str) -> Dict[str, Any]:
    """
    Analyzes the SME's semantic description and recommends tailored modules and pricing.
    """
    prompt = (
        "You are an AI onboarding specialist for PeopleGraph, an HR platform for Malaysian SMEs. "
        "Read the following description of a business and their HR needs. "
        "Recommend a modular subscription package (Base Price RM199 - RM499) with only the modules they need. "
        "Available Modules: Payroll & Statutory (EPF/SOCSO/PCB), Attendance & Time Tracking, "
        "Performance Analytics (Cost-Productivity Matrix), AI DSS (Revenue Prediction & Anomaly Detection), "
        "Employee Sentiment Engine.\n\n"
        "Business Description:\n"
        f"{semantic_description}\n\n"
        "Return a JSON response with:\n"
        "- recommended_tier: 'Basic', 'Growth', or 'Intelligence'\n"
        "- monthly_price_rm: integer\n"
        "- included_modules: list of strings\n"
        "- explanation: short paragraph explaining why this fits their specific needs"
    )

    headers = {
        "Authorization": f"Bearer {ILMU_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "ilmu-glm-5.1",
        "messages": [
            {"role": "system", "content": "You are a helpful SaaS onboarding AI. Always return strict JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        # MOCKING the response for development purposes
        import json
        
        # Simple heuristic based mocking
        desc_lower = semantic_description.lower()
        
        if "ai" in desc_lower or "predict" in desc_lower or "analytics" in desc_lower or "100" in desc_lower:
            return {
                "recommended_tier": "Intelligence",
                "monthly_price_rm": 499,
                "included_modules": [
                    "Payroll & Statutory", 
                    "Attendance & Time Tracking", 
                    "Performance Analytics", 
                    "AI DSS", 
                    "Employee Sentiment Engine"
                ],
                "explanation": "Given your scale and desire for advanced insights, the Intelligence tier provides predictive modeling and anomaly detection to optimize your workforce ROI."
            }
        elif "performance" in desc_lower or "50" in desc_lower:
            return {
                "recommended_tier": "Growth",
                "monthly_price_rm": 299,
                "included_modules": [
                    "Payroll & Statutory", 
                    "Attendance & Time Tracking", 
                    "Performance Analytics"
                ],
                "explanation": "The Growth tier is perfect for your expanding team, adding the Cost-Productivity Matrix to track output value without overwhelming you with AI features."
            }
        else:
            return {
                "recommended_tier": "Basic",
                "monthly_price_rm": 199,
                "included_modules": [
                    "Payroll & Statutory", 
                    "Attendance & Time Tracking"
                ],
                "explanation": "To get you off spreadsheets quickly and easily, the Basic tier handles core compliance (EPF/SOCSO/PCB) and attendance tracking at our most affordable rate."
            }
            
    except Exception as e:
        logger.error(f"Error calling ILMU-GLM-5.1 API for onboarding: {e}")
        return {
            "recommended_tier": "Growth",
            "monthly_price_rm": 299,
            "included_modules": ["Payroll & Statutory", "Attendance & Time Tracking"],
            "explanation": "We recommend our core package to streamline your HR operations."
        }
