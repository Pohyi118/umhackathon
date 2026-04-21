import asyncio
import json
import uuid
import os
import sys
import pandas as pd
from datetime import date, datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, async_session_factory
from app.models.employee import Employee, Department
from app.models.performance import ProductivityMetric, AttendanceLog
from sqlalchemy import text

async def seed_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, "Data PreprocessingV2", "Output", "nadi_pekerja_ultimate_twin_final.json")
    csv_path = os.path.join(base_dir, "Data PreprocessingV2", "Output", "cleaned_attendance_nadi_pekerja.csv")
    
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load JSON: {e}")
        return

    # Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        print("Starting comprehensive data ingestion (Departments, Employees, Metrics, Time-Series Attendance)...")
        
        # ── 1. Ingest Departments ───────────────────────────────────────
        department_cache = {}
        for emp in data.get("workforce", []):
            dept_id = emp["department_id"]
            if dept_id not in department_cache:
                role = str(emp.get("role", "")).lower()
                if "warehouse" in role or "dispatch" in role:
                    dept_name = f"Warehouse & Logistics ({dept_id[:4]})"
                elif "sales" in role:
                    dept_name = f"Sales & Marketing ({dept_id[:4]})"
                elif "account" in role or "admin" in role:
                    dept_name = f"Admin & Finance ({dept_id[:4]})"
                else:
                    dept_name = f"Operations ({dept_id[:4]})"
                    
                department_cache[dept_id] = dept_name
                
        for dept_id, dept_name in department_cache.items():
            dept = Department(
                id=uuid.UUID(dept_id),
                name=dept_name,
                cost_center_code=dept_name[:3].upper()
            )
            await db.merge(dept)
            
        await db.flush()
        
        # ── 2. Ingest Employees ─────────────────────────────────────────
        person_mapping = {}
        for idx, emp_data in enumerate(data.get("workforce", [])):
            emp_id = uuid.UUID(emp_data["id"])
            person_mapping[f'Person_{idx}'] = emp_id
            
            emp = Employee(
                id=emp_id,
                employee_number=f"EMP-{idx+1:04d}",
                name_english=emp_data["first_name"].upper(),
                department_id=uuid.UUID(emp_data["department_id"]),
                role_title=emp_data["role"],
                hire_date=date(2022, 1, 15),
                monthly_base_salary=float(emp_data["monthly_salary_rm"]),
                work_location="office" if "warehouse" in emp_data["role"].lower() else "hybrid"
            )
            await db.merge(emp)
                
        await db.flush()

        # ── 3. Ingest Revenue Engine (Sales) ────────────────────────────
        for sale in data.get("revenue_engine", []):
            emp_id = uuid.UUID(sale["handled_by_employee_id"])
            sale_date = datetime.strptime(sale["order_date"], "%Y-%m-%d").date()
            metric = ProductivityMetric(
                id=uuid.uuid4(),
                employee_id=emp_id,
                period_start=sale_date,
                period_end=sale_date,
                metric_type="sales_order",
                metric_value=1.0,
                output_value_rm=float(sale["total_amount_rm"])
            )
            await db.merge(metric)
            
        await db.commit()
        print(f"Successfully ingested {len(person_mapping)} employees, {len(department_cache)} departments, and {len(data.get('revenue_engine', []))} revenue metrics.")

        # ── 4. Ingest Raw Time-Series Attendance ────────────────────────
        print("Processing raw time-series attendance CSV...")
        try:
            df = pd.read_csv(csv_path)
            # Filter to our 14 target employees
            df = df[df['Employee_ID'].isin(person_mapping.keys())]
            
            records = []
            for _, row in df.iterrows():
                dt_str = row['Date']
                try:
                    c_in = None
                    if pd.notna(row['Clock_In']) and ":" in str(row['Clock_In']):
                        c_in = datetime.strptime(f"{dt_str} {row['Clock_In']}", "%Y-%m-%d %H:%M")
                    c_out = None
                    if pd.notna(row['Clock_Out']) and ":" in str(row['Clock_Out']):
                        c_out = datetime.strptime(f"{dt_str} {row['Clock_Out']}", "%Y-%m-%d %H:%M")
                        
                    records.append(
                        AttendanceLog(
                            id=uuid.uuid4(),
                            employee_id=person_mapping[row['Employee_ID']],
                            log_date=datetime.strptime(dt_str, "%Y-%m-%d").date(),
                            clock_in=c_in,
                            clock_out=c_out,
                            hours_worked=float(row['Total_Hours']),
                            overtime_hours=float(row['OT_Hours']),
                            status='present'
                        )
                    )
                except Exception:
                    continue
                    
            print(f"Preparing to chunk insert {len(records)} detailed clock-in/out records...")
            
            chunk_size = 5000
            # Clear old attendance logs before massive re-seed
            await db.execute(text("DELETE FROM attendance_logs;"))
            await db.commit()
            
            for i in range(0, len(records), chunk_size):
                chunk = records[i:i+chunk_size]
                db.add_all(chunk)
                await db.commit()
                print(f"Inserted attendance chunk {i//chunk_size + 1} of {(len(records)//chunk_size)+1}")
                
            print("Full Time-Series Attendance successfully seeded!")
            
        except Exception as e:
            print(f"Failed to load or insert CSV attendance data: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
