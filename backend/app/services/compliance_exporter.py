# -*- coding: utf-8 -*-
"""
PeopleGraph — Compliance Exporter
===================================
Generates formatted compliance receipts and reports for LHDN, EPF, SOCSO.

CRITICAL RULES IMPLEMENTED:
1. Name formatting: '[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]'
   The English name MUST be fully capitalized regardless of input case.

2. Data Fallback Logic (Critical Rule #3):
   If primary data in columns E, F, or H is 0 or blank, the system
   automatically retrieves fallback data from columns N, O, or Q.

   Column mapping (payroll spreadsheet convention):
   E → base_salary      → fallback N (previous_base_salary)
   F → allowances       → fallback O (previous_allowances)
   H → overtime         → fallback Q (previous_overtime)
"""

import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional, List, Dict, Any

from app.services.statutory import StatutoryCalculator

logger = logging.getLogger(__name__)


# ── Column mapping for data fallback ─────────────────────────────────
# Maps primary columns to their fallback columns
FALLBACK_COLUMN_MAP = {
    "E": "N",  # base_salary → previous_base_salary
    "F": "O",  # allowances → previous_allowances
    "H": "Q",  # overtime → previous_overtime
}

# Maps column letters to field names for clarity
COLUMN_FIELD_MAP = {
    "E": "base_salary",
    "F": "allowances",
    "H": "overtime",
    "N": "previous_base_salary",
    "O": "previous_allowances",
    "Q": "previous_overtime",
}


@dataclass
class ComplianceRecord:
    """Single employee record formatted for compliance export."""
    employee_number: str
    formatted_name: str  # '[Number] - [NAME ALL CAPS] [Chinese name]'
    base_salary: float
    allowances: float
    overtime: float
    gross_salary: float
    statutory_breakdown: dict
    net_salary: float
    total_employer_cost: float
    fallback_used: bool
    fallback_details: dict


def _is_empty_or_zero(value: Any) -> bool:
    """Check if a value is None, empty string, 0, or 0.0."""
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, (int, float)) and value == 0:
        return True
    return False


def apply_data_fallback(
    row_data: Dict[str, Any],
) -> tuple[Dict[str, Any], bool, Dict[str, str]]:
    """
    Implements Critical Rule #3: Data Fallback Logic.

    If primary data in columns E, F, or H is 0 or blank,
    automatically retrieve fallback data from columns N, O, or Q.

    Args:
        row_data: Dictionary with column-letter keys and their values.

    Returns:
        Tuple of (corrected_data, fallback_was_used, fallback_details)
    """
    corrected = dict(row_data)
    fallback_used = False
    details = {}

    for primary_col, fallback_col in FALLBACK_COLUMN_MAP.items():
        primary_val = row_data.get(primary_col)

        if _is_empty_or_zero(primary_val):
            fallback_val = row_data.get(fallback_col)

            if not _is_empty_or_zero(fallback_val):
                corrected[primary_col] = fallback_val
                fallback_used = True
                primary_field = COLUMN_FIELD_MAP.get(primary_col, primary_col)
                fallback_field = COLUMN_FIELD_MAP.get(fallback_col, fallback_col)
                details[primary_field] = (
                    f"Primary column {primary_col} ({primary_field}) was "
                    f"{'0' if primary_val == 0 else 'blank'}. "
                    f"Used fallback column {fallback_col} ({fallback_field}) = {fallback_val}"
                )
                logger.warning(
                    "Data fallback triggered: Column %s → %s (value: %s)",
                    primary_col, fallback_col, fallback_val,
                )
            else:
                logger.error(
                    "CRITICAL: Both primary column %s and fallback column %s "
                    "are empty/zero. Manual review required.",
                    primary_col, fallback_col,
                )

    return corrected, fallback_used, details


def format_compliance_name(
    employee_number: str,
    name_english: str,
    name_local: Optional[str] = None,
) -> str:
    """
    Format employee name per compliance rules:
    '[Number] - [NAME IN ENGLISH ALL CAPS] [Name in Chinese]'

    Critical Rule: English name MUST be fully capitalized regardless of input.

    Examples:
        format_compliance_name("001", "Danial Diro", "丹尼尔")
        → "001 - DANIAL DIRO 丹尼尔"

        format_compliance_name("042", "ahmad bin ismail")
        → "042 - AHMAD BIN ISMAIL"
    """
    formatted = f"{employee_number} - {name_english.upper()}"
    if name_local:
        formatted += f" {name_local}"
    return formatted


class ComplianceExporter:
    """
    Generates compliance-ready payroll exports for LHDN, EPF, SOCSO.
    Integrates statutory calculations and data fallback logic.
    """

    def __init__(self):
        self.calculator = StatutoryCalculator()

    def process_payroll_row(
        self,
        employee_number: str,
        name_english: str,
        name_local: Optional[str],
        row_data: Dict[str, Any],
        age: int = 30,
    ) -> ComplianceRecord:
        """
        Process a single employee's payroll data with fallback logic.

        Args:
            employee_number: e.g. "001"
            name_english: Full English name (will be uppercased)
            name_local: Chinese/BM name for compliance formatting
            row_data: Dict with column keys (E, F, H, N, O, Q)
            age: Employee age for EPF rate determination
        """
        # Step 1: Apply data fallback (Critical Rule #3)
        corrected, fallback_used, fallback_details = apply_data_fallback(row_data)

        # Step 2: Extract corrected values
        base_salary = float(corrected.get("E", 0))
        allowances = float(corrected.get("F", 0))
        overtime = float(corrected.get("H", 0))
        gross_salary = base_salary + allowances + overtime

        # Step 3: Calculate statutory deductions
        breakdown = self.calculator.compute(gross_salary, age=age)

        # Step 4: Compute net and total employer cost
        net_salary = gross_salary - breakdown.total_employee_deductions
        total_employer_cost = gross_salary + breakdown.total_employer_contributions

        # Step 5: Format compliance name (Critical Rule: ALL CAPS English)
        formatted_name = format_compliance_name(
            employee_number, name_english, name_local
        )

        return ComplianceRecord(
            employee_number=employee_number,
            formatted_name=formatted_name,
            base_salary=base_salary,
            allowances=allowances,
            overtime=overtime,
            gross_salary=round(gross_salary, 2),
            statutory_breakdown=breakdown.to_dict(),
            net_salary=round(net_salary, 2),
            total_employer_cost=round(total_employer_cost, 2),
            fallback_used=fallback_used,
            fallback_details=fallback_details,
        )

    def generate_batch_export(
        self,
        employees_data: List[Dict[str, Any]],
    ) -> List[ComplianceRecord]:
        """
        Process an entire payroll batch. Each item in employees_data must have:
        {
            "employee_number": "001",
            "name_english": "Danial Diro",
            "name_local": "丹尼尔",  # optional
            "age": 30,
            "row_data": {"E": 5000, "F": 500, "H": 200, "N": 4800, "O": 500, "Q": 150}
        }
        """
        records = []
        for emp in employees_data:
            record = self.process_payroll_row(
                employee_number=emp["employee_number"],
                name_english=emp["name_english"],
                name_local=emp.get("name_local"),
                row_data=emp["row_data"],
                age=emp.get("age", 30),
            )
            records.append(record)
        return records

    def export_epf_report(self, records: List[ComplianceRecord]) -> List[dict]:
        """Generate EPF contribution report format."""
        return [
            {
                "employee": r.formatted_name,
                "gross_salary": r.gross_salary,
                "epf_employee": r.statutory_breakdown["epf_employee"],
                "epf_employer": r.statutory_breakdown["epf_employer"],
                "total_epf": round(
                    r.statutory_breakdown["epf_employee"]
                    + r.statutory_breakdown["epf_employer"], 2
                ),
            }
            for r in records
        ]

    def export_socso_report(self, records: List[ComplianceRecord]) -> List[dict]:
        """Generate SOCSO contribution report format."""
        return [
            {
                "employee": r.formatted_name,
                "gross_salary": r.gross_salary,
                "socso_employee": r.statutory_breakdown["socso_employee"],
                "socso_employer": r.statutory_breakdown["socso_employer"],
            }
            for r in records
        ]
