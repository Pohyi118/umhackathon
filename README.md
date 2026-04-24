# PeopleGraph

An On-Demand Skill-to-Revenue Orchestrator and AI decision engine for Malaysian SMEs, featuring a Force-Directed Value Graph, predictive modeling, unstructured data ingestion, and compliance features.

## Prerequisites

- **Python**: 3.10+
- **Node.js**: 18+
- **PostgreSQL**: 14+ (with pgvector extension)
- **npm** or **yarn**

## Project Structure

```
umhackathon/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── models/    # SQLAlchemy models
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── schemas/   # Pydantic schemas
│   └── requirements.txt
├── frontend/          # Next.js application
│   ├── app/           # App router pages
│   │   └── components/
│   └── package.json
├── src/               # Utility scripts
└── Data PreprocessingV2/  # Data processing scripts
```

## Backend Setup

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate  # Windows
   # source .venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   Create `.env` in `backend/`:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/peoplegraph
   SECRET_KEY=your-secret-key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. **Setup database**
   ```bash
   # Create database
   psql -U postgres -c "CREATE DATABASE peoplegraph;"
   
   # Run migrations
   alembic upgrade head
   ```

5. **Seed database (optional)**
   ```bash
   python seed.py
   ```

6. **Start backend server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### New AI Endpoint: Cuti Peristiwa Shock

Simulate sudden public holiday operational risk during peak demand:

- `POST /api/v1/ai/simulate-cuti-peristiwa`
- Purpose: Compare statutory Public Holiday wage penalty vs estimated SLA impact from warehouse shutdown.

Example request body:

```json
{
  "max_daily_demand_units": 18000,
  "daily_capacity_units": 12000,
  "logistics_staff_count": 8,
  "ordinary_rate_of_pay_rm": 115.38,
  "profit_per_item_rm": 5,
  "post_holiday_surge_percent": 0.2
}
```

## Features

- **Value Graph (Digital Twin)**: Force-directed visualization mapping revenue directly to human activities using D3.js.
- **Decision Intelligence**: Automated expansion, optimization, and outsourcing blueprints based on forensic data analysis.
- **On-Demand Data Ingestion**: Analyzes unstructured data (WhatsApp logs, sales CSVs, payroll PDFs) to bypass manual KPI tracking.
- **AI Analytics**: Predictive models for hiring and revenue impact using Ensemble Forecasting.
- **NLP & Sentiment**: YTL AI Labs ILMU-GLM-5.1 integration for employee feedback analysis and SaaS onboarding suggestions.
- **Cuti Peristiwa Shock Simulation**: Simulates public holiday operational risk and warehouse SLA impact.
- **Dashboard**: Real-time HR metrics, 30-day attendance heatmaps, and team energy tracking.
- **Compliance**: Automated statutory tracking (EPF/SOCSO/EIS/PCB) with strict formatting and fallback data logic.

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- scikit-learn
- pandas

### Frontend
- Next.js 16
- React 19
- D3.js
- Tailwind CSS 4
