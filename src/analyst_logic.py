import pandas as pd
import numpy as np
from prophet import Prophet
import xgboost as xgb
import json
from datetime import datetime
import warnings

warnings.filterwarnings('ignore')

# --- LAYER 1 & 2: DATA & FORECASTING (PROPHET) ---
class NadiPekerjaCommander:
    def __init__(self, json_path):
        try:
            with open(json_path, 'r') as f:
                self.workforce = json.load(f)['workforce']
        except FileNotFoundError:
            print(f"Error: Could not find '{json_path}'. Please ensure it is in the same directory.")
            self.workforce = []
        
        self.sales_history = self._generate_malaysian_sales()
        self.strategy_engine = self._initialize_xgboost_engine()

    def _generate_malaysian_sales(self):
        dates = pd.date_range(start='2024-01-01', end='2025-12-31', freq='D')
        base_sales = 50000
        sales = [base_sales + (150000 if (d.month == 4 or (d.month == 11 and d.day == 11)) else np.random.randint(0, 5000)) for d in dates]
        return pd.DataFrame({'ds': dates, 'y': sales})

    def forecast_peaks(self):
        raya_2026 = pd.DataFrame({
            'holiday': 'raya',
            'ds': pd.to_datetime(['2025-03-31', '2026-03-20']),
            'lower_window': -10, 'upper_window': 5,
        })
        model = Prophet(holidays=raya_2026)
        model.fit(self.sales_history)
        future = model.make_future_dataframe(periods=180)
        return model.predict(future)

    # --- LAYER 3: XGBOOST STRATEGY INITIALIZATION ---
    def _initialize_xgboost_engine(self):
        # [DemandMultiplier, ManualRatio, Salary, IsRevGen]
        X_train = np.array([
            [1.0, 0.9, 2500, 0], [4.5, 0.2, 3500, 1], [0.8, 0.1, 5000, 0], 
            [5.0, 0.8, 3000, 1], [1.2, 0.1, 8000, 1]
        ])
        y_train = np.array([1, 2, 3, 2, 0])
        model = xgb.XGBClassifier(objective='multi:softprob', num_class=4, eval_metric='mlogloss')
        model.fit(X_train, y_train)
        return model

    # --- LAYER 4: THE OPERATIONAL STRESS TEST ---
    def analyze_bottlenecks(self, forecast_data):
        raya_peak = forecast_data[(forecast_data['ds'] >= '2026-03-01') & (forecast_data['ds'] <= '2026-03-31')]
        max_daily_demand = raya_peak['yhat'].max()
        avg_demand = forecast_data['yhat'].mean()
        demand_multiplier = max_daily_demand / avg_demand
        
        logistics_staff = [s for s in self.workforce if s['department'] == 'Logistics']
        staff_count = len(logistics_staff) if len(logistics_staff) > 0 else 1 
        daily_capacity = staff_count * 2000 # RM2000 processing power per head
        stress_ratio = max_daily_demand / daily_capacity
        return max_daily_demand, daily_capacity, stress_ratio, demand_multiplier

    # --- LAYER 5: EXECUTIVE Q&A (MARGINS, LIQUIDITY, SCALABILITY) ---
    def generate_executive_qa(self, max_demand, capacity, stress_ratio):
        """Translates ML metrics into hard C-Suite Financial Answers."""
        print("\n" + "="*80)
        print("👑 BOSS CHONG'S EXECUTIVE DECISION DASHBOARD (C-SUITE QA)")
        print("="*80)

        # 1. Scalability (The Ceiling)
        monthly_ceiling = capacity * 30
        projected_monthly_peak = max_demand * 30
        print("\n🏢 1. SCALABILITY & OPERATIONS CEILING")
        print(f"Q: At what revenue number do my operations break?")
        print(f"A: Your current team hits a hard ceiling at RM {monthly_ceiling:,.2f}/month.")
        if projected_monthly_peak > monthly_ceiling:
            print(f"   ⚠️ WARNING: Prophet predicts Raya demand will hit RM {projected_monthly_peak:,.2f}/month. You are under-capacitated by RM {projected_monthly_peak - monthly_ceiling:,.2f}.")

        # 2. Margin Protection (Overtime vs. Lost Sales)
        base_salary = 2200
        hourly_rate = base_salary / 208 # 208 working hours/mo
        ot_rate = hourly_rate * 1.5
        required_extra_hours = ((max_demand - capacity) / 2000) * 8 # 8 hrs per RM2000 gap
        daily_ot_cost = required_extra_hours * ot_rate
        print("\n🛡️ 2. MARGIN PROTECTION (OVERTIME VS HIRE)")
        print(f"Q: Should I just pay OT to existing staff for the Raya rush?")
        if stress_ratio > 1.2:
            print(f"A: NO. To meet the RM {max_demand:,.2f} peak, your OT cost would bleed ~RM {daily_ot_cost * 30:,.2f}/month.")
            print(f"   ✅ It is highly profitable to HIRE 2 contract workers (Cost: RM {(base_salary * 1.13) * 2:,.2f} incl EPF) instead.")
        else:
            print(f"A: YES. Stress is low ({stress_ratio:.2f}x). Pay OT. Do not take on fixed hiring costs.")

        # 3. Capital Reallocation (Fire Cost vs Automate)
        admin_salary = 2500
        years_service = 6
        severance = (admin_salary / 26) * 20 * years_service # Akta Kerja 1955 formula
        print("\n⚖️ 3. CAPITAL REALLOCATION (FIRE VS AUTOMATE)")
        print(f"Q: Can I fire my slow senior Admin and hire a cheaper fresh grad?")
        print(f"A: 🔴 DANGER. Firing a 6-year employee requires a statutory severance of RM {severance:,.2f}.")
        print(f"   ✅ AUTOMATE INSTEAD. Deploy AI-OCR (RM 300/mo) to make them 4x faster. Save the RM 11.5k cash flow.")

        # 4. Liquidity (Cash Flow Timing)
        print("\n💧 4. LIQUIDITY & CASH FLOW TIMING")
        print(f"Q: Do I have the cash flow to afford seasonal hiring?")
        print(f"A: Prophet detects the 'Raya Ramp-up' begins 10 days before peak. ")
        print(f"   Hire in mid-February. You will need to front RM 6,000 for Feb/March payroll before the April marketplace payouts clear. Ensure liquidity reserves.")

        # 5. Cost Avoidance (LHDN ROI)
        true_admin_cost = admin_salary * 1.13 + 70 # EPF + SOCSO
        print("\n🛑 5. COST AVOIDANCE (LHDN E-INVOICING)")
        print(f"Q: How many months until the LHDN AI automation pays for itself?")
        print(f"A: Day 1. Instead of hiring a 2nd Admin (True Cost: RM {true_admin_cost:,.2f}/mo), automation costs RM 300/mo.")
        print(f"   Net cash flow saved: RM {true_admin_cost - 300:,.2f} every month.")
        print("="*80 + "\n")

    # --- LAYER 6: THE HYBRID BLUEPRINT & COMPARATIVE ROI MATRIX ---
    def generate_blueprint(self, demand_multiplier, stress_ratio, max_demand):
        blueprint = []
        strategy_map = {0: "🟢 MAINTAIN", 1: "🔴 AUTOMATE", 2: "🔵 STRATEGIC HIRE", 3: "🟡 OUTSOURCE"}
        departments = list(set(s['department'] for s in self.workforce))
        
        for dept in departments:
            dept_staff = [s for s in self.workforce if s['department'] == dept]
            avg_salary = np.mean([s['monthly_salary_rm'] for s in dept_staff]) if dept_staff else 3000
            
            # 1. Base Feature Calculations
            true_monthly_cost = avg_salary * 1.13 + 70.00 # EPF + SOCSO
            manual_ratio = 0.85 if dept == 'Admin' else 0.15 
            is_rev_gen = 1 if dept in ['Sales', 'Logistics', 'Marketing'] else 0
            
            # 2. Run XGBoost Inference (The 'Winning' Choice)
            features = np.array([[demand_multiplier, manual_ratio, avg_salary, is_rev_gen]])
            prediction = self.strategy_engine.predict(features)[0]
            decision = strategy_map[prediction]

            # 3. Calculate Comparative Market Solutions (The 'Rejected' Choices)
            # We calculate Net Impact = (Revenue Generated or Saved) - (Cost of Solution)
            
            # Option A: Full-Time Hire
            rev_gain_hire = (true_monthly_cost * 4.5) if is_rev_gen else 0
            net_impact_hire = rev_gain_hire - true_monthly_cost
            
            # Option B: Automate / SaaS
            saas_cost = 300 
            rev_gain_auto = (true_monthly_cost * 0.8) # Recovers 80% of human inefficiency
            net_impact_auto = rev_gain_auto - saas_cost
            
            # Option C: Outsource / Agency (Annualized to monthly average)
            agency_premium = true_monthly_cost * 1.5
            active_months = 4 # Only used during peak seasons
            annualized_outsource_cost = (agency_premium * active_months) / 12
            net_impact_outsource = true_monthly_cost - annualized_outsource_cost # Savings vs full-time
            
            # Option D: Cheap Intern / Gig Worker
            intern_cost = 1200
            management_drain = 800 # Hidden cost of training/errors
            net_impact_intern = (rev_gain_hire * 0.4) - (intern_cost + management_drain) # Interns only yield 40% efficiency

            # 4. Format the Output string based on the XGBoost prediction
            if prediction == 1: 
                action = "Deploy AI-OCR for LHDN Compliance."
                roi = f"Saves RM {net_impact_auto:,.0f}/mo net."
            elif prediction == 2: 
                if dept == 'Logistics' and stress_ratio > 1.2:
                    action = "HIRE: Warehouse Coordinator."
                    roi = f"Recovers RM {max_demand * 0.15:,.0f} in blocked fulfillment."
                else:
                    action = f"HIRE: {dept} Growth Agent."
                    roi = f"Net Monthly Profit Gain: RM {net_impact_hire:,.0f}."
            elif prediction == 3: 
                action = "OUTSOURCE: Shift to Gig-Pool/Agency."
                roi = f"Saves RM {net_impact_outsource:,.0f}/mo on average vs Full-Time."
            else:
                action, roi = "Hold capacity.", "Stability maintained."

            # Construct the comprehensive node profile
            blueprint.append({
                "Node": dept, 
                "Decision": decision, 
                "Action": action, 
                "ROI": roi,
                "Comparisons": {
                    "Automate (SaaS)": f"RM {net_impact_auto:,.0f} net value",
                    "Full-Time Hire": f"RM {net_impact_hire:,.0f} net value",
                    "Agency Retainer": f"RM {net_impact_outsource:,.0f} net value",
                    "Hire Intern": f"RM {net_impact_intern:,.0f} net value"
                }
            })
        return blueprint

# --- EXECUTION LAYER ---
if __name__ == "__main__":
    engine = NadiPekerjaCommander('nadi_pekerja_master_twin.json')
    
    if engine.workforce:
        forecast = engine.forecast_peaks()
        demand, capacity, stress, multiplier = engine.analyze_bottlenecks(forecast)
        
        # Generates the C-Suite QA Output
        engine.generate_executive_qa(demand, capacity, stress)
        
        print("\n📋 STRATEGIC EXPANSION BLUEPRINT (WITH MARKET COMPARISONS):")
        print("-" * 100)
        blueprint = engine.generate_blueprint(multiplier, stress, demand)
        for b in blueprint:
            print(f"[{b['Node']}] -> {b['Decision']}")
            print(f"   📍 Action:  {b['Action']}")
            print(f"   📈 Impact:  {b['ROI']}")
            print(f"   🔍 Alternative Market Solutions (Net Value to Business):")
            for option, value in b['Comparisons'].items():
                # Add an arrow to visually highlight the AI's chosen path
                is_chosen = "👉" if (
                    ("AUTOMATE" in b['Decision'] and "Automate" in option) or 
                    ("HIRE" in b['Decision'] and "Full-Time" in option) or 
                    ("OUTSOURCE" in b['Decision'] and "Agency" in option)
                ) else "  "
                print(f"      {is_chosen} {option:<18} : {value}")
            print("\n")
