# PeopleGraph

An AI-powered HR analytics platform with predictive modeling, sentiment analysis, anomaly detection, and compliance features.

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

## Features

- **Dashboard**: Real-time HR metrics and KPIs
- **Employees**: Employee management with performance tracking
- **AI Analytics**: Predictive models and sentiment analysis
- **Anomaly Detection**: Identify unusual patterns in HR data
- **Blockchain**: Immutable audit trails
- **NLP**: Natural language processing for employee feedback
- **Compliance**: Statutory compliance tracking and reporting
- **Predictive Simulation**: Workforce planning simulations

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