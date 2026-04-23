import asyncio
import pandas as pd
import json
import uuid
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.database import async_session_factory
from app.models.performance import AttendanceLog
from sqlalchemy import text

async def seed_attendance():
    csv_path = r'c:\UMH26\umhackathon\Data PreprocessingV2\Output\cleaned_attendance_nadi_pekerja.csv'
    json_path = r'c:\UMH26\umhackathon\Data PreprocessingV2\Output\nadi_pekerja_ultimate_twin_final.json'
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    person_mapping = {}
    for i, emp in enumerate(data['workforce']):
        person_mapping[f'Person_{i}'] = uuid.UUID(emp['id'])

    print("Loading raw CSV...")
    df = pd.read_csv(csv_path)
    
    # Filter to only employees we have mapped (the 14 employees)
    df = df[df['Employee_ID'].isin(person_mapping.keys())]
    print(f"Filtered to {len(df)} records belonging to the 14 employees.")

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
        except Exception as e:
            continue
            
    print(f"Preparing to insert {len(records)} detailed clock-in/out records...")
    
    chunk_size = 5000
    async with async_session_factory() as db:
        print("Clearing old summary attendance logs...")
        await db.execute(text("DELETE FROM attendance_logs;"))
        await db.commit()
        
        for i in range(0, len(records), chunk_size):
            chunk = records[i:i+chunk_size]
            db.add_all(chunk)
            await db.commit()
            print(f"Inserted chunk {i//chunk_size + 1}/{(len(records)//chunk_size)+1}")
            
    print("✅ Full Time-Series Attendance successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed_attendance())
