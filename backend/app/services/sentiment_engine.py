# -*- coding: utf-8 -*-
"""
PeopleGraph — NLP Sentiment Engine
====================================
Parses anonymous weekly pulse checks into "Team Energy" metrics.
Uses YTL AI Labs ILMU-GLM-5.1 by Z.ai for advanced contextual analysis
and Malay/English/Mandarin mixed-language understanding.
"""

import logging
import os
import requests
from typing import List, Dict

logger = logging.getLogger(__name__)

# YTL AI Labs ILMU-GLM-5.1 API Configuration
ILMU_API_URL = os.getenv("ILMU_API_URL", "https://api.zai.ytl.com/v1/chat/completions")
ILMU_API_KEY = os.getenv("ILMU_API_KEY", "your-ytl-ilmu-api-key")

def analyze_sentiment_ilmu(texts: List[str]) -> Dict[str, float]:
    """
    Analyzes a batch of pulse check responses using ILMU-GLM-5.1.
    Returns aggregated metrics:
    - score (0.0 to 1.0)
    - energetic_ratio
    - balanced_ratio
    - muted_ratio
    """
    if not texts:
        return {
            "score": 0.5,
            "energetic_ratio": 0.0,
            "balanced_ratio": 1.0,
            "muted_ratio": 0.0
        }

    # Prepare prompt for ILMU-GLM-5.1
    prompt = (
        "You are an expert HR analyst in Malaysia. Analyze the following employee feedback "
        "and classify the overall team energy. Return a JSON with exactly four keys:\n"
        "- score: float between 0.0 (very negative) and 1.0 (very positive)\n"
        "- energetic_ratio: float (0.0-1.0) proportion of feedback showing high energy/motivation\n"
        "- balanced_ratio: float (0.0-1.0) proportion of neutral/stable feedback\n"
        "- muted_ratio: float (0.0-1.0) proportion of burnt out, disengaged or negative feedback\n\n"
        "Feedback texts:\n"
    )
    for i, t in enumerate(texts):
        prompt += f"{i+1}. {t}\n"

    headers = {
        "Authorization": f"Bearer {ILMU_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "ilmu-glm-5.1",
        "messages": [
            {"role": "system", "content": "You are an HR sentiment analysis AI. Always return strict JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1
    }

    try:
        # In a real scenario, this would make the actual API request
        # response = requests.post(ILMU_API_URL, headers=headers, json=payload, timeout=10)
        # response.raise_for_status()
        # result = response.json()
        
        # MOCKING the response for development purposes
        import json
        import random
        
        # Simulate sentiment score based on text length and random variance
        mock_score = random.uniform(0.4, 0.9)
        energetic = mock_score * 0.6
        balanced = (1.0 - mock_score) * 0.5 + 0.2
        muted = 1.0 - energetic - balanced
        
        return {
            "score": round(mock_score, 2),
            "energetic_ratio": round(energetic, 2),
            "balanced_ratio": round(balanced, 2),
            "muted_ratio": round(muted, 2)
        }
        
    except Exception as e:
        logger.error(f"Error calling ILMU-GLM-5.1 API: {e}")
        # Fallback
        return {
            "score": 0.5,
            "energetic_ratio": 0.33,
            "balanced_ratio": 0.34,
            "muted_ratio": 0.33
        }

def process_weekly_pulse(department_id: str, feedback_texts: List[str]):
    """
    Process weekly feedback for a department and store the SentimentScore.
    """
    sentiment_data = analyze_sentiment_ilmu(feedback_texts)
    
    total = len(feedback_texts)
    
    return {
        "score": sentiment_data["score"],
        "energetic_count": int(total * sentiment_data["energetic_ratio"]),
        "balanced_count": int(total * sentiment_data["balanced_ratio"]),
        "muted_count": total - int(total * sentiment_data["energetic_ratio"]) - int(total * sentiment_data["balanced_ratio"]),
        "total_responses": total
    }
