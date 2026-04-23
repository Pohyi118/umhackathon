# -*- coding: utf-8 -*-
"""
PeopleGraph — Forensic Data Validation
========================================
Automated auditing layer to detect discrepancies between structured 
(payroll CSVs, HRIS) and unstructured (WhatsApp logs, system activity) data.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ForensicValidator:
    """
    Validates messy SME data before using it for DSS insights.
    Flags discrepancies to protect against fraud or data entry errors.
    """
    
    @staticmethod
    def audit_overtime_claims(employee_id: str, structured_ot_hours: float, unstructured_activity_hours: float) -> Dict[str, Any]:
        """
        Cross-checks OT hours claimed in payroll against actual system/WhatsApp activity.
        """
        discrepancy = structured_ot_hours - unstructured_activity_hours
        
        is_anomalous = False
        warning_ring = False
        reasons = []
        
        # Heuristic: If claimed OT is > 2 hours more than observed activity, flag it.
        if discrepancy > 2.0:
            is_anomalous = True
            warning_ring = True
            reasons.append(f"Structured payroll claims {structured_ot_hours}h OT, but unstructured NLP logs show only {unstructured_activity_hours}h activity.")
            
        return {
            "employee_id": employee_id,
            "is_valid": not is_anomalous,
            "warning_ring_active": warning_ring,
            "reasons": reasons,
            "risk_score": 0.8 if is_anomalous else 0.1
        }
