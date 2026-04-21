import pandas as pd
import numpy as np
from prophet import Prophet
import xgboost as xgb
import json
import os
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
        """Simulates 2 years of sales history with specific Malaysian Peaks."""
        dates = pd.date_range(start='2024-01-01', end='2025-12-31', freq='D')
        base_sales = 50000
        sales = [base_sales + (150000 if (d.month == 4 or (d.month == 11 and d.day == 11)) else np.random.randint(0, 5000)) for d in dates]
        return pd.DataFrame({'ds': dates, 'y': sales})

    def forecast_peaks(self):
        """Phase 1: Prophet Time-Series Forecasting."""
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
        """
        Phase 2: Training the Decision Intelligence Brain.
        Features: [DemandMultiplier, ManualRatio, Salary, IsRevGen]
        """
        X_train = np.array([
            [1.0, 0.9, 2500, 0], [4.5, 0.2, 3500, 1], [0.8, 0.1, 5000, 0], 
            [5.0, 0.8, 3000, 1], [1.2, 0.1, 8000, 1]
        ])
        y_train = np.array([1, 2, 3, 2, 0]) # 0: MAINTAIN, 1: AUTOMATE, 2: HIRE, 3: OUTSOURCE
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
        daily_capacity = staff_count * 2000 
        stress_ratio = max_daily_demand / daily_capacity
        
        return max_daily_demand, daily_capacity, stress_ratio, demand_multiplier

    # --- LAYER 5: 8-DIMENSIONAL C-SUITE EXECUTIVE QA ---
    def generate_executive_qa(self, max_demand, capacity, stress_ratio):
        print("\n" + "="*80)
        print("👑 BOSS CHONG'S EXECUTIVE DECISION DASHBOARD (C-SUITE QA)")
        print("="*80)

        monthly_ceiling = capacity * 30
        projected_monthly_peak = max_demand * 30
        base_salary = 2200
        
        # 1. SCALABILITY
        print("\n🏢 1. SCALABILITY & OPERATIONS CEILING")
        print(f"Q: At what revenue number do my operations break?")
        print(f"A: Your current team hits a hard ceiling at RM {monthly_ceiling:,.2f}/month.")
        if projected_monthly_peak > monthly_ceiling:
            print(f"   ⚠️ WARNING: Prophet predicts Raya demand will hit RM {projected_monthly_peak:,.2f}/month. You are under-capacitated by RM {projected_monthly_peak - monthly_ceiling:,.2f}.")

        # 2. MARGIN PROTECTION
        required_extra_hours = ((max_demand - capacity) / 2000) * 8 
        daily_ot_cost = required_extra_hours * (base_salary / 208 * 1.5)
        print("\n🛡️ 2. MARGIN PROTECTION (OVERTIME VS HIRE)")
        print(f"Q: Should I just pay OT to existing staff for the Raya rush?")
        if stress_ratio > 1.2:
            print(f"A: NO. To meet the RM {max_demand:,.2f} peak, your OT cost would bleed ~RM {daily_ot_cost * 30:,.2f}/month.")
            print(f"   ✅ It is highly profitable to HIRE 2 contract workers (Cost: RM {(base_salary * 1.13) * 2:,.2f} incl EPF) instead.")
        else:
            print(f"A: YES. Stress is low ({stress_ratio:.2f}x). Pay OT. Do not take on fixed hiring costs.")

        # 3. CAPITAL REALLOCATION (TRUE COST OF FIRING - MY EMPLOYMENT ACT 1955)
        admin_salary = 2500
        years_service = 6
        orp = admin_salary / 26 # Ordinary Rate of Pay
        
        if years_service < 2: severance_days = 10
        elif 2 <= years_service <= 5: severance_days = 15
        else: severance_days = 20
        
        severance_total = orp * severance_days * years_service
        unused_leave = 10 # Simulated unused leave balance
        leave_encashment = orp * unused_leave
        total_exit_cost = severance_total + leave_encashment

        print("\n⚖️ 3. CAPITAL REALLOCATION (THE TRUE COST OF FIRING)")
        print(f"Q: Can I fire my slow senior Admin and hire a cheaper fresh grad?")
        print(f"A: 🔴 EXTREMELY EXPENSIVE. Because they have {years_service} years tenure:")
        print(f"   - Statutory Lay-off Benefits: RM {severance_total:,.2f}")
        print(f"   - Annual Leave Encashment:    RM {leave_encashment:,.2f}")
        print(f"   ---------------------------------------------")
        print(f"   💰 TOTAL CASH OUTFLOW:       RM {total_exit_cost:,.2f}")
        print(f"\n   ✅ DECISION: Do not fire. This RM {total_exit_cost:,.2f} could pay for AI-OCR (RM 300/mo) for the next 3 YEARS.")

        # 4. COST AVOIDANCE
        true_admin_cost = admin_salary * 1.13 + 70
        print("\n🛑 4. COST AVOIDANCE (LHDN E-INVOICING)")
        print(f"Q: How many months until the LHDN AI automation pays for itself?")
        print(f"A: Day 1. Instead of hiring a 2nd Admin (True Cost: RM {true_admin_cost:,.2f}/mo), automation costs RM 300/mo.")

        # 5. LIQUIDITY RISK
        starting_cash = 25000
        payout_delay_days = 14
        daily_burn_rate = 1200
        total_upfront_hiring_cost = (base_salary * 1.13) * 2 
        cash_trough = starting_cash - total_upfront_hiring_cost - (daily_burn_rate * payout_delay_days)
        print("\n🌊 5. THE CASH CONVERSION CYCLE (LIQUIDITY RISK)")
        print(f"Q: If I hire 2 temps, will I run out of cash before marketplace payouts clear?")
        if cash_trough < 0:
            print(f"A: 🔴 INSOLVENCY RISK. You will hit a negative cash balance of RM {cash_trough:,.2f} on Day {payout_delay_days}.")
            print(f"   💡 Action Required: Cross-train internal staff or secure a RM {-cash_trough + 10000:,.0f} credit facility today.")
        else:
            print(f"A: 🟢 SAFE. Lowest cash point will be RM {cash_trough:,.2f}. Liquidity is sufficient.")

        # 6. FLIGHT RISK
        consecutive_stress_days = 12 
        flight_risk_prob = min(0.85, (consecutive_stress_days / 20) * (stress_ratio - 1.0)) if stress_ratio > 1 else 0
        replacement_cost = base_salary * 4 
        hidden_burnout_cost = flight_risk_prob * replacement_cost
        print("\n🏃 6. FLIGHT RISK & CORE TALENT RETENTION")
        print(f"Q: What is the hidden cost of forcing my current team to do OT for {consecutive_stress_days} days straight?")
        if flight_risk_prob > 0.3:
            print(f"A: 🔴 CRITICAL RISK. Sustained stress pushes core employee flight risk to {flight_risk_prob*100:.0f}%.")
            print(f"   💡 Action: The RM {hidden_burnout_cost:,.2f} statistical risk of turnover makes hiring temps mathematically cheaper.")
        else:
            print(f"A: 🟢 SAFE. Flight risk is low ({flight_risk_prob*100:.0f}%).")

        # 7. POST-PEAK HANGOVER
        base_return_rate = 0.02
        stress_return_rate = base_return_rate * (stress_ratio ** 1.8) if stress_ratio > 1 else base_return_rate
        avg_order_value = 85
        total_orders = (max_demand * 7) / avg_order_value
        projected_refund_cost = total_orders * stress_return_rate * 30 # RM 30 reverse logistics cost
        print("\n📦 7. POST-PEAK HANGOVER (QUALITY VS. SPEED DECAY)")
        print(f"Q: If I push the warehouse to {stress_ratio:.2f}x stress, what happens to my return rate next month?")
        print(f"A: Rushed packing will increase your error rate from {base_return_rate*100:.1f}% to {stress_return_rate*100:.1f}%.")
        print(f"   ⚠️ WARNING: Expect a delayed refund wave costing RM {projected_refund_cost:,.2f} in reverse logistics 14 days post-peak.")

        # 8. DEAD STOCK TRAP
        inventory_holding_cost = 2.50 # RM per unit per month
        recommended_hedge = 0.75 # Order 75% upfront, 25% Just-In-Time
        safe_inventory_volume = (projected_monthly_peak / avg_order_value) * recommended_hedge
        print("\n🛒 8. INVENTORY CAPITAL (DEAD STOCK TRAP)")
        print(f"Q: Should I order 100% of the Prophet-forecasted inventory upfront?")
        print(f"A: 🔴 NO. A 10% forecast error leaves you paying RM {((projected_monthly_peak/avg_order_value)*0.1) * inventory_holding_cost:,.2f}/mo in dead stock storage.")
        print(f"   💡 Action: Order {safe_inventory_volume:,.0f} units ({recommended_hedge*100:.0f}%) to warehouse. Route the remaining 25% via 3PL Drop-shipping.")
        print("="*80 + "\n")

    # --- LAYER 6: THE HYBRID BLUEPRINT (COMPARATIVE ROI MATRIX) ---
    def generate_blueprint(self, demand_multiplier, stress_ratio, max_demand):
        blueprint = []
        strategy_map = {0: "🟢 MAINTAIN", 1: "🔴 AUTOMATE", 2: "🔵 STRATEGIC HIRE", 3: "🟡 OUTSOURCE"}
        departments = list(set(s['department'] for s in self.workforce))
        
        for dept in departments:
            dept_staff = [s for s in self.workforce if s['department'] == dept]
            avg_salary = np.mean([s['monthly_salary_rm'] for s in dept_staff]) if dept_staff else 3000
            
            true_monthly_cost = avg_salary * 1.13 + 70.00
            manual_ratio = 0.85 if dept == 'Admin' else 0.15 
            is_rev_gen = 1 if dept in ['Sales', 'Logistics', 'Marketing'] else 0
            
            features = np.array([[demand_multiplier, manual_ratio, avg_salary, is_rev_gen]])
            prediction = self.strategy_engine.predict(features)[0]
            decision = strategy_map[prediction]

            # Matrix Calculations
            rev_gain_hire = (true_monthly_cost * 4.5) if is_rev_gen else 0
            net_impact_hire = rev_gain_hire - true_monthly_cost
            net_impact_auto = (true_monthly_cost * 0.8) - 300 # SaaS Cost
            net_impact_outsource = true_monthly_cost - ((true_monthly_cost * 1.5 * 4) / 12) 
            net_impact_intern = (rev_gain_hire * 0.4) - (1200 + 800) # Pay + Mgmt Drain
            net_impact_crosstrain = (rev_gain_hire * (0.7 if dept == 'Logistics' else 0.2)) - 500 # Training bonus

            if prediction == 1: 
                action = "Deploy AI-OCR for LHDN Compliance."
                roi = f"Saves RM {net_impact_auto:,.0f}/mo net."
            elif prediction == 2: 
                if dept == 'Logistics' and stress_ratio > 1.2:
                    action = "HIRE: Warehouse Coordinator OR Cross-Train Admin."
                    roi = f"Recovers RM {max_demand * 0.15:,.0f} in blocked fulfillment."
                else:
                    action = f"HIRE: {dept} Growth Agent."
                    roi = f"Net Monthly Profit Gain: RM {net_impact_hire:,.0f}."
            elif prediction == 3: 
                action = "OUTSOURCE: Shift to Gig-Pool/Agency."
                roi = f"Saves RM {net_impact_outsource:,.0f}/mo on average vs Full-Time."
            else:
                action, roi = "Hold capacity.", "Stability maintained."

            blueprint.append({
                "Node": dept, 
                "Decision": decision, 
                "Action": action, 
                "ROI": roi,
                "Comparisons": {
                    "Automate (SaaS)": f"RM {net_impact_auto:,.0f} net value",
                    "Full-Time Hire": f"RM {net_impact_hire:,.0f} net value",
                    "Cross-Train Staff": f"RM {net_impact_crosstrain:,.0f} net value",
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
        
        # Generates the 8-Dimension C-Suite QA Output
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
                is_chosen = "👉" if (
                    ("AUTOMATE" in b['Decision'] and "Automate" in option) or 
                    ("HIRE" in b['Decision'] and ("Full-Time" in option or "Cross-Train" in option)) or 
                    ("OUTSOURCE" in b['Decision'] and "Agency" in option)
                ) else "  "
                print(f"      {is_chosen} {option:<18} : {value}")
            print("\n")
            