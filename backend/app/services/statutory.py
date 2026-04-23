# -*- coding: utf-8 -*-
"""
PeopleGraph — Malaysian Statutory Calculator
==============================================
Implements EPF, SOCSO, EIS, and PCB calculations per Malaysian law.

Reference legislation:
- Employees Provident Fund Act 1991 (EPF/KWSP)
- Employees' Social Security Act 1969 (SOCSO/PERKESO)  
- Employment Insurance System Act 2017 (EIS/SIP)
- Income Tax Act 1967 — Monthly Tax Deduction (PCB/MTD)

All rates are loaded from app.config.settings so they can be updated
without code changes when legislation changes.
"""

from dataclasses import dataclass
from typing import Optional

from app.config import settings


@dataclass
class StatutoryBreakdown:
    """Complete statutory deduction breakdown for one employee."""
    # Employee deductions (subtracted from gross salary)
    epf_employee: float
    socso_employee: float
    eis_employee: float
    pcb: float  # Monthly Tax Deduction

    # Employer contributions (added cost, not deducted from salary)
    epf_employer: float
    socso_employer: float
    eis_employer: float

    @property
    def total_employee_deductions(self) -> float:
        return self.epf_employee + self.socso_employee + self.eis_employee + self.pcb

    @property
    def total_employer_contributions(self) -> float:
        return self.epf_employer + self.socso_employer + self.eis_employer

    @property
    def total_labor_cost_above_gross(self) -> float:
        """Additional cost to employer above the gross salary."""
        return self.total_employer_contributions

    def to_dict(self) -> dict:
        return {
            "epf_employee": round(self.epf_employee, 2),
            "socso_employee": round(self.socso_employee, 2),
            "eis_employee": round(self.eis_employee, 2),
            "pcb": round(self.pcb, 2),
            "epf_employer": round(self.epf_employer, 2),
            "socso_employer": round(self.socso_employer, 2),
            "eis_employer": round(self.eis_employer, 2),
            "total_employee_deductions": round(self.total_employee_deductions, 2),
            "total_employer_contributions": round(self.total_employer_contributions, 2),
        }


class StatutoryCalculator:
    """
    Calculates Malaysian statutory deductions and employer contributions.

    Usage:
        calc = StatutoryCalculator()
        breakdown = calc.compute(gross_salary=5000.0, age=30)
    """

    def __init__(self):
        self.epf_employee_rate = settings.EPF_EMPLOYEE_RATE_BELOW_60
        self.epf_employer_rate_low = settings.EPF_EMPLOYER_RATE_SALARY_LTE_5000
        self.epf_employer_rate_high = settings.EPF_EMPLOYER_RATE_SALARY_GT_5000
        self.socso_employer_rate = settings.SOCSO_EMPLOYER_RATE
        self.socso_employee_rate = settings.SOCSO_EMPLOYEE_RATE
        self.socso_cap = settings.SOCSO_SALARY_CAP
        self.eis_rate = settings.EIS_RATE
        self.eis_cap = settings.EIS_SALARY_CAP

    def compute(
        self,
        gross_salary: float,
        age: int = 30,
        is_citizen: bool = True,
        is_foreign_worker: bool = False,
        pcb_amount: Optional[float] = None,
    ) -> StatutoryBreakdown:
        """
        Compute all statutory deductions for a given gross salary.

        Args:
            gross_salary: Monthly gross salary in MYR
            age: Employee age (EPF rates differ for >60)
            is_citizen: Non-citizens may have different SOCSO treatment
            pcb_amount: Pre-calculated PCB/MTD amount (from LHDN tables)
                        If None, uses a simplified progressive estimate.
        """
        # Ensure minimum wage RM1,700 is met
        if gross_salary < 1700.0:
            raise ValueError("Gross salary cannot be below the mandated minimum wage of RM1,700")

        # ── EPF (KWSP) ──────────────────────────────────────────────
        # Employee: 11% for age < 60, reduced rates for 60+
        epf_employee_rate = self.epf_employee_rate if age < 60 else 0.055
        epf_employee = round(gross_salary * epf_employee_rate, 2)

        # Employer: 13% for salary ≤ RM5000, 12% for salary > RM5000
        # Mandatory EPF contributions for foreign workers logic:
        # Assuming for now foreign workers share the same calculation logic, but explicitly handled here.
        if is_foreign_worker:
            # Foreign workers might have different mandated minimums, 
            # but as of 2026/phased approach, employer contributes.
            epf_employer = round(gross_salary * self.epf_employer_rate_high, 2)
        elif gross_salary <= 5000:
            epf_employer = round(gross_salary * self.epf_employer_rate_low, 2)
        else:
            epf_employer = round(gross_salary * self.epf_employer_rate_high, 2)

        # ── SOCSO (PERKESO) ──────────────────────────────────────────
        # Capped at RM6,000 monthly salary (New ceiling)
        socso_cap = 6000.0
        socso_base = min(gross_salary, socso_cap)
        socso_employer = round(socso_base * self.socso_employer_rate, 2)
        socso_employee = round(socso_base * self.socso_employee_rate, 2)

        # ── EIS (SIP) ───────────────────────────────────────────────
        # 0.2% each from employer and employee, capped at RM6,000
        eis_base = min(gross_salary, self.eis_cap)
        eis_employer = round(eis_base * self.eis_rate, 2)
        eis_employee = round(eis_base * self.eis_rate, 2)

        # ── PCB/MTD (Monthly Tax Deduction) ──────────────────────────
        # Full PCB calculation requires LHDN's MTD schedule.
        # Here we use a simplified progressive estimate.
        if pcb_amount is not None:
            pcb = pcb_amount
        else:
            pcb = self._estimate_pcb(gross_salary, epf_employee)

        return StatutoryBreakdown(
            epf_employee=epf_employee,
            socso_employee=socso_employee,
            eis_employee=eis_employee,
            pcb=pcb,
            epf_employer=epf_employer,
            socso_employer=socso_employer,
            eis_employer=eis_employer,
        )

    @staticmethod
    def _estimate_pcb(gross_salary: float, epf_deduction: float) -> float:
        """
        Simplified PCB estimate using Malaysia's progressive tax brackets.
        For production, integrate with LHDN's official MTD calculator API.

        Chargeable income = annual gross - EPF relief - personal relief (RM9,000)
        Then apply progressive rates and divide by 12.
        """
        annual_gross = gross_salary * 12
        annual_epf = epf_deduction * 12
        personal_relief = 9000.0  # Basic individual relief

        chargeable = max(0, annual_gross - annual_epf - personal_relief)

        # Malaysian progressive tax rates (2024 YA, simplified)
        brackets = [
            (5000, 0.0),
            (15000, 0.01),    # 5,001 - 20,000: 1%
            (15000, 0.03),    # 20,001 - 35,000: 3%
            (15000, 0.06),    # 35,001 - 50,000: 6%  (changed from 8%)
            (20000, 0.11),    # 50,001 - 70,000: 11%
            (30000, 0.19),    # 70,001 - 100,000: 19%
            (150000, 0.25),   # 100,001 - 250,000: 25%
            (150000, 0.25),   # 250,001 - 400,000: 25%
            (float("inf"), 0.30),  # > 400,000: 30%
        ]

        annual_tax = 0.0
        remaining = chargeable
        for width, rate in brackets:
            if remaining <= 0:
                break
            taxable = min(remaining, width)
            annual_tax += taxable * rate
            remaining -= taxable

        return round(annual_tax / 12, 2)

    def compute_total_employer_cost(self, gross_salary: float, **kwargs) -> float:
        """
        Total cost to employer = gross + all employer statutory contributions.
        Used by the Cost-Productivity Matrix (X-axis).
        """
        breakdown = self.compute(gross_salary, **kwargs)
        return round(gross_salary + breakdown.total_employer_contributions, 2)

    def calculate_severance(self, years_of_service: float, daily_wage: float) -> float:
        """
        Calculates severance pay formulas under the Employment Act 1955.
        - Less than 2 years: 10 days' wages per year of service
        - 2 to 5 years: 15 days' wages per year of service
        - 5 years and above: 20 days' wages per year of service
        """
        if years_of_service < 2:
            days_per_year = 10
        elif years_of_service < 5:
            days_per_year = 15
        else:
            days_per_year = 20
            
        return round(years_of_service * days_per_year * daily_wage, 2)
