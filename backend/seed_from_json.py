import asyncio
import json
import uuid
import os
import sys
from datetime import date, datetime, timedelta
import random

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, async_session_factory
from app.models.employee import Employee, Department
from app.models.performance import ProductivityMetric, AttendanceLog

async def seed_data():
    json_path = os.path.join("..", "Data PreprocessingV2", "Output", "nadi_pekerja_ultimate_twin_final.json")
    
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load JSON: {e}")
        return

    async with engine.begin() as conn:
        # Create tables if not exist
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        print("Starting data ingestion from Nadi Pekerja Ultimate Twin...")
        
        # 1. Ingest Departments
        department_cache = {}
        for emp in data.get("workforce", []):
            dept_id = emp["department_id"]
            if dept_id not in department_cache:
                # Use role context to guess department name, or just use a generic name
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
            # Merge to ignore if exists
            await db.merge(dept)
            
        await db.flush()
        
        # 2. Ingest Employees
        for idx, emp_data in enumerate(data.get("workforce", [])):
            emp_id = uuid.UUID(emp_data["id"])
            emp = Employee(
                id=emp_id,
                employee_number=f"EMP-{idx+1:04d}",
                name_english=emp_data["first_name"].upper(),
                department_id=uuid.UUID(emp_data["department_id"]),
                role_title=emp_data["role"],
                hire_date=date(2022, 1, 15), # Mock hire date
                monthly_base_salary=float(emp_data["monthly_salary_rm"]),
                work_location="office" if "warehouse" in emp_data["role"].lower() else "hybrid"
            )
            await db.merge(emp)
            
            # Log OT as AttendanceLogs for the month
            ot_hours = float(emp_data.get("actual_ot_hours_this_month", 0))
            if ot_hours > 0:
                # Create a summary log or distribute over days
                log = AttendanceLog(
                    employee_id=emp_id,
                    log_date=date.today() - timedelta(days=1),
                    hours_worked=8.0,
                    overtime_hours=ot_hours, # Storing total OT in one log for simplicity
                    status="present"
                )
                await db.merge(log)
                
        await db.flush()

        # 3. Ingest Revenue Engine (Sales)
        for sale in data.get("revenue_engine", []):
            emp_id = uuid.UUID(sale["handled_by_employee_id"])
            sale_date = datetime.strptime(sale["order_date"], "%Y-%m-%d").date()
            metric = ProductivityMetric(
                employee_id=emp_id,
                period_start=sale_date,
                period_end=sale_date,
                metric_type="sales_order",
                metric_value=1.0,
                output_value_rm=float(sale["total_amount_rm"])
            )
            db.add(metric)
            
        await db.commit()
        print(f"Successfully ingested {len(data.get('workforce', []))} employees and {len(data.get('revenue_engine', []))} revenue metrics.")

if __name__ == "__main__":
    asyncio.run(seed_data())
