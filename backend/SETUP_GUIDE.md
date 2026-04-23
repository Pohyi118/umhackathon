# Backend Setup Guide: PeopleGraph

Follow these steps to set up and run the PeopleGraph FastAPI backend on your local machine.

## Prerequisites
- Python 3.10+
- PostgreSQL database (or an external URL from Supabase / AWS RDS)
- Redis (optional, required if you run Celery/Cron jobs for the Anomaly pipeline)

## Step 1: Install Dependencies

Navigate to the backend directory and create a virtual environment:

```bash
cd c:\UMH26\umhackathon\backend
python -m venv venv
```

Activate the virtual environment:
- **Windows**: `.\venv\Scripts\activate`
- **macOS/Linux**: `source venv/bin/activate`

Install the required Python packages:
```bash
pip install -r requirements.txt
```
*(If you haven't already, ensure packages like `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `scikit-learn`, `numpy`, and `requests` are in the `requirements.txt`)*

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory (you can copy from `.env.example` if it exists):

```env
APP_NAME="PeopleGraph API"
APP_VERSION="1.0.0"
CORS_ORIGINS=["http://localhost:3000"]

# Database Configuration (Update with your PostgreSQL/Supabase URL)
DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/peoplegraph"

# YTL AI Labs ILMU-GLM-5.1 Configuration
ILMU_API_URL="https://api.zai.ytl.com/v1/chat/completions"
ILMU_API_KEY="your-ytl-ilmu-api-key"

# Blockchain Configuration (Optional)
POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"
```

## Step 3: Initialize Database & Seed Data

The application uses SQLAlchemy to automatically create tables on startup (via the lifespan context manager). You can also seed it with demo data.

Run the FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```

Once running, send a POST request to seed the database with departments, employees, and mock metrics:
```bash
curl -X POST "http://localhost:8000/api/v1/seed"
```
*Note: In production, you would use Alembic for database migrations.*

## Step 4: Interacting with the DSS Endpoints

With the server running, you can explore the automatically generated Swagger UI documentation to test the newly implemented endpoints:

Navigate your browser to: **http://localhost:8000/docs**

Key endpoints to test:
- **`GET /api/v1/dashboard/overview`**: Returns the complete payload for the dashboard (Finance, Headcount, Team Energy).
- **`POST /api/v1/ai/simulate`**: Tests the Ensemble Forecasting model.
- **`POST /api/v1/ai/simulate-cuti-peristiwa`**: Simulates sudden public holiday shock (Cuti Peristiwa) and recommends whether to close warehouse or pay PH penalty rates.
- **`POST /api/v1/ai/onboarding/suggest-package`**: Tests the ILMU-GLM-5.1 semantic onboarding.

## Step 5: (Optional) Running the Batch Pipeline

The Isolation Forest anomaly detector and the NLP sentiment analysis are designed to run as batch processes. While in development you can call them directly via Python shell or a mock endpoint, in production you should set up a Celery worker:

```bash
# Example if celery is configured
celery -A app.worker worker --loglevel=info
```
