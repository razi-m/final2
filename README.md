# HackSav - AI Infrastructure Inspection Platform

An end-to-end AI-powered infrastructure inspection system with video upload, ML-based defect detection, admin approval, and Gemini-powered PDF report generation.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  FastAPI        │────▶│  PostgreSQL     │
│  Port: 5173     │     │  Backend :8000  │     │  Port: 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               │ HTTP
                               ▼
                        ┌─────────────────┐
                        │  FastAPI        │
                        │  ML Service     │
                        │  Port: 8001     │
                        └─────────────────┘
                               │
                               │ PyTorch
                               ▼
                        ┌─────────────────┐
                        │  MobileNetV3    │
                        │  Model (.pth)   │
                        └─────────────────┘
```

## Project Structure

```
HackSav/
├── .env                          # Environment variables
├── .gitignore
├── README.md
├── backend/                      # FastAPI Backend (:8000)
│   ├── requirements.txt
│   └── app/
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── auth.py
│       ├── state_machine.py
│       ├── main.py
│       └── routers/
│           ├── auth.py
│           ├── inspections.py
│           └── reports.py
├── ml_service/                   # FastAPI ML Service (:8001)
│   ├── requirements.txt
│   └── ml/
│       ├── config.py
│       ├── inference.py
│       └── main.py
├── frontend/                     # React + Vite (:5173)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/client.js
│       ├── context/AuthContext.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── InspectionDetailPage.jsx
│       │   └── CreateInspectionPage.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── InspectionCard.jsx
│           ├── DefectBadge.jsx
│           ├── StatusBadge.jsx
│           └── LoadingOverlay.jsx
├── uploads/                      # Video storage (gitignored)
└── reports/                      # PDF reports (gitignored)
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- PyTorch MobileNetV3 Small model file (.pth)

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb razidb

# Or using psql
psql -U postgres
CREATE DATABASE razidb;
```

### 2. Environment Configuration

Update `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:REDACTED_DB_PASSWORD@localhost:5432/razidb
GEMINI_API_KEY=REDACTED_GEMINI_KEY
JWT_SECRET=REDACTED_JWT_SECRET
ML_SERVICE_URL=http://localhost:8001
MODEL_PATH=C:\Users\Razi\.gemini\antigravity\scratch\ml\model_multilabel.pth
```

### 3. Backend Setup (Port 8000)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn app.main:app --reload --port 8000
```

### 4. ML Service Setup (Port 8001)

Open a new terminal:

```bash
cd ml_service

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the ML service
uvicorn ml.main:app --reload --port 8001
```

### 5. Frontend Setup (Port 5173)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Default Credentials

- **Username**: admin
- **Password**: admin123

## State Machine Flow

```
created → video_uploaded → analyzing → analysis_completed → approved
           ↓                ↓
         failed          failed
```

No skipping. No reverting. Failure sets status=failed explicitly.

## API Endpoints

### Authentication
- `POST /api/login` - Login with credentials

### Inspections
- `GET /api/inspections` - List all inspections
- `POST /api/inspections` - Create new inspection
- `GET /api/inspections/{id}` - Get inspection details
- `POST /api/inspections/{id}/upload` - Upload video
- `POST /api/inspections/{id}/analyze` - Trigger ML analysis
- `POST /api/inspections/{id}/approve` - Approve inspection

### Reports
- `GET /api/reports/{inspection_id}/download` - Download PDF report

## ML Model Configuration

The ML service uses PyTorch MobileNetV3 Small with the following configuration:

- **Classes**: Pothole, Crack, Manhole, Corrosion
- **Image Size**: 224x224
- **Confidence Threshold**: 0.6
- **Max Frames**: 300
- **Frame Sample Rate**: 1 fps

## Development

### Running Tests

```bash
# Backend state machine tests
cd backend
python -m pytest tests/ -v

# ML service smoke test
cd ml_service
python -c "from ml.main import app; print('ML service imports OK')"
```

### Manual Verification

1. **Login**: Open http://localhost:5173, log in with admin/admin123
2. **Create Inspection**: Click "New Inspection" → fill form
3. **Upload Video**: Click inspection → upload video
4. **Run Analysis**: Click "Analyze" → wait for completion
5. **Approve**: Click "Approve" → wait for report
6. **Download**: Click "Download PDF Report"

## Production Deployment

1. Set `DEBUG=false` in production
2. Use proper secret management (not .env files)
3. Configure proper CORS origins
4. Use HTTPS/TLS
5. Set up proper logging
6. Use production WSGI server (Gunicorn)
7. Set up database connection pooling
8. Configure rate limiting

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure virtual environments are activated
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **Model loading**: Verify MODEL_PATH points to valid .pth file
4. **CORS errors**: Check frontend is running on localhost:5173
5. **File permissions**: Ensure uploads/ and reports/ directories are writable

### Port Conflicts

If ports are in use:
- Backend: Change `--port 8000` to another port
- ML Service: Change `--port 8001` to another port
- Frontend: Change `port: 5173` in vite.config.js

## License

MIT License - Hackathon Project