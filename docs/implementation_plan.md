# HackSav — AI Infrastructure Inspection Platform Implementation Plan

An end-to-end AI-powered infrastructure inspection system with video upload, ML-based defect detection, admin approval, and Gemini-powered PDF report generation.

## User Review Required

> [!IMPORTANT]
> **Model Framework Discrepancy**: Your spec says "TensorFlow/Keras `.h5`", but the actual model at `C:\Users\Razi\.gemini\antigravity\scratch\ml\model_multilabel.pth` is a **PyTorch MobileNetV3 Small** (`.pth` state dict). The inference wrapper will use **PyTorch + torchvision**, NOT TensorFlow. Please confirm this is correct.

> [!IMPORTANT]
> **Authentication Scope**: The spec mentions "Login" in the workflow but doesn't detail auth requirements (JWT, session, OAuth). The plan uses a **simple JWT-based auth** with hardcoded admin credentials for hackathon speed. Please confirm, or specify if you have existing user registration needs.

> [!WARNING]
> **Gemini API Key**: You provided the key directly. It will be placed **only** in `.env` and loaded via `os.getenv()`. It will never be hardcoded in source files, logged, or exposed to the frontend.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Frontend["React Frontend :5173"]
        UI[Cinematic Dark SaaS UI]
    end
    
    subgraph Backend["FastAPI Backend :8000"]
        API[REST API]
        AUTH[JWT Auth]
        SM[State Machine]
        GEMINI[Gemini Reporter]
    end
    
    subgraph ML["FastAPI ML Service :8001"]
        MODEL[MobileNetV3 Small]
        SAMPLER[Frame Sampler]
    end
    
    subgraph Storage
        PG[(PostgreSQL :5432)]
        FS[File System]
    end
    
    UI --> API
    API --> AUTH
    API --> SM
    API --> ML
    API --> PG
    API --> GEMINI
    GEMINI --> FS
    API --> FS
    ML --> MODEL
    ML --> SAMPLER
```

### Status Flow State Machine

```
created → video_uploaded → analyzing → analysis_completed → approved → (PDF generated)
                                  ↘ failed
```
No skipping. No reverting. Failure sets `status=failed` explicitly.

---

## Proposed Changes

### Project Root Structure

```
HackSav/
├── .env                          # All secrets (DB, Gemini key)
├── .gitignore
├── README.md
│
├── backend/                      # FastAPI Backend (:8000)
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py               # FastAPI app, CORS, startup
│       ├── config.py             # Settings from .env
│       ├── database.py           # SQLAlchemy engine + session
│       ├── models.py             # ORM models
│       ├── schemas.py            # Pydantic schemas
│       ├── auth.py               # JWT auth utilities
│       ├── state_machine.py      # Status transition validator
│       └── routers/
│           ├── __init__.py
│           ├── auth.py           # POST /login
│           ├── inspections.py    # CRUD + upload + analyze + approve
│           └── reports.py        # GET /download report
│
├── ml_service/                   # FastAPI ML Service (:8001)
│   ├── requirements.txt
│   └── ml/
│       ├── __init__.py
│       ├── main.py               # FastAPI app, model loading at startup
│       ├── inference.py          # Frame sampling + batch inference
│       └── config.py             # Model path, classes, thresholds
│
├── frontend/                     # React + Vite (:5173)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css             # Cinematic Dark SaaS design system
│       ├── api/
│       │   └── client.js         # Axios instance + interceptors
│       ├── context/
│       │   └── AuthContext.jsx   # JWT auth state
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── InspectionDetailPage.jsx
│       │   └── CreateInspectionPage.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── InspectionCard.jsx
│           ├── DefectBadge.jsx
│           ├── FrameViewer.jsx
│           ├── StatusBadge.jsx
│           └── LoadingOverlay.jsx
│
├── uploads/                      # Video files (gitignored)
└── reports/                      # Generated PDF reports (gitignored)
```

---

### Environment & Configuration

#### [NEW] [.env](file:///c:/Users/Razi/Documents/HackSav/.env)

Secrets file — **never committed**:
- `DATABASE_URL=postgresql://postgres:REDACTED_DB_PASSWORD@localhost:5432/razidb`
- `GEMINI_API_KEY=<loaded from env only>`
- `JWT_SECRET=<random secret>`
- `ML_SERVICE_URL=http://localhost:8001`
- `MODEL_PATH=C:\Users\Razi\.gemini\antigravity\scratch\ml\model_multilabel.pth`

#### [NEW] [.gitignore](file:///c:/Users/Razi/Documents/HackSav/.gitignore)

Ignores `.env`, `uploads/`, `reports/`, `node_modules/`, `__pycache__/`, `*.pyc`

---

### Backend (FastAPI :8000)

#### [NEW] [requirements.txt](file:///c:/Users/Razi/Documents/HackSav/backend/requirements.txt)

`fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `python-dotenv`, `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`, `httpx`, `google-generativeai`, `fpdf2`, `pydantic`

#### [NEW] [config.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/config.py)

Reads `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `ML_SERVICE_URL` from `.env` via `python-dotenv`.

#### [NEW] [database.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/database.py)

- SQLAlchemy `create_engine` with the PostgreSQL URL
- `SessionLocal` factory
- `Base = declarative_base()`
- `get_db()` dependency

#### [NEW] [models.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/models.py)

| Model | Key Columns |
|-------|-------------|
| `User` | id, username, hashed_password, role |
| `Inspection` | id, title, description, status, video_path, created_at, updated_at |
| `Defect` | id, inspection_id (FK), frame_number, frame_path, defect_type, confidence, timestamp |
| `Report` | id, inspection_id (FK), pdf_path, generated_at |

- No raw frame arrays stored
- No Gemini text blobs stored
- Only PDF path stored in `Report`

#### [NEW] [schemas.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/schemas.py)

Pydantic request/response models for all endpoints.

#### [NEW] [auth.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/auth.py)

- `create_access_token()` — JWT creation
- `verify_token()` — JWT validation
- `get_current_user()` — FastAPI dependency
- Password hashing with `passlib`

#### [NEW] [state_machine.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/state_machine.py)

```python
VALID_TRANSITIONS = {
    "created": ["video_uploaded"],
    "video_uploaded": ["analyzing"],
    "analyzing": ["analysis_completed", "failed"],
    "analysis_completed": ["approved", "failed"],
    "approved": [],
    "failed": [],
}
```
- `validate_transition(current, target)` — raises on invalid transitions

#### [NEW] [routers/auth.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/routers/auth.py)

- `POST /api/login` — validates credentials, returns JWT

#### [NEW] [routers/inspections.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/routers/inspections.py)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inspections` | GET | List all inspections |
| `/api/inspections` | POST | Create new inspection (status=created) |
| `/api/inspections/{id}` | GET | Get inspection detail + defects |
| `/api/inspections/{id}/upload` | POST | Upload video (status→video_uploaded) |
| `/api/inspections/{id}/analyze` | POST | Trigger ML analysis (status→analyzing, background task) |
| `/api/inspections/{id}/approve` | POST | Approve (status→approved, triggers async Gemini report) |

- Analysis: calls ML service via `httpx`, stores defects, updates status
- Approval: non-blocking, triggers Gemini PDF generation as FastAPI `BackgroundTask`

#### [NEW] [routers/reports.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/routers/reports.py)

- `GET /api/reports/{inspection_id}/download` — serves PDF file

#### [NEW] [main.py](file:///c:/Users/Razi/Documents/HackSav/backend/app/main.py)

- FastAPI app with CORS (allow `localhost:5173`)
- On startup: `Base.metadata.create_all()`
- Seed default admin user if not exists
- Include all routers

---

### ML Inference Service (FastAPI :8001)

#### [NEW] [requirements.txt](file:///c:/Users/Razi/Documents/HackSav/ml_service/requirements.txt)

`fastapi`, `uvicorn`, `torch`, `torchvision`, `Pillow`, `python-dotenv`, `python-multipart`, `opencv-python-headless`

#### [NEW] [config.py](file:///c:/Users/Razi/Documents/HackSav/ml_service/ml/config.py)

- `MODEL_PATH` from env
- `CLASSES = ["Pothole", "Crack", "Manhole", "Corrosion"]`
- `IMG_SIZE = 224`
- `CONFIDENCE_THRESHOLD = 0.6`
- `MAX_FRAMES = 300`
- `FRAME_SAMPLE_RATE = 1` (1 frame per second, configurable)

#### [NEW] [main.py](file:///c:/Users/Razi/Documents/HackSav/ml_service/ml/main.py)

- Load model **once at startup** into global variable
- `GET /health` — health check
- `POST /analyze` — accepts video file path, returns defect list
- `POST /reload-model` — reloads model from disk

#### [NEW] [inference.py](file:///c:/Users/Razi/Documents/HackSav/ml_service/ml/inference.py)

- `extract_frames(video_path, fps=1, max_frames=300)` — uses OpenCV, samples at configured rate
- `run_inference(frames)` — batch runs through model, applies sigmoid, thresholds at 0.6
- Returns list of `{ frame_number, defect_type, confidence }` — **no bounding boxes**

---

### Frontend (React + Vite :5173)

#### [NEW] React project via Vite

Initialized with `npx create-vite@latest ./ --template react`

#### [NEW] [index.css](file:///c:/Users/Razi/Documents/HackSav/frontend/src/index.css)

Cinematic Dark SaaS design system:
- Background: `#0B1120` / `#0F172A`
- Accent: `#00E5FF`
- Glass surfaces: `rgba(255,255,255,0.05)`
- Alternate dark mode accent: `#6366F1`
- Google Fonts (Inter)
- Micro-animations, glassmorphism

#### [NEW] [api/client.js](file:///c:/Users/Razi/Documents/HackSav/frontend/src/api/client.js)

Axios instance with base URL `http://localhost:8000/api`, JWT interceptor.

#### [NEW] [context/AuthContext.jsx](file:///c:/Users/Razi/Documents/HackSav/frontend/src/context/AuthContext.jsx)

JWT state management, login/logout, token persistence in localStorage.

#### [NEW] Pages

| Page | Features |
|------|----------|
| `LoginPage.jsx` | Cinematic login form, JWT auth |
| `DashboardPage.jsx` | Inspection list, status badges, create button |
| `CreateInspectionPage.jsx` | Form → create inspection |
| `InspectionDetailPage.jsx` | Video upload, analysis trigger, defect viewer (frame highlights + badges), approve button, report download |

#### [NEW] Components

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | App navigation + logout |
| `InspectionCard.jsx` | Dashboard card with status badge |
| `DefectBadge.jsx` | Defect type + confidence display |
| `FrameViewer.jsx` | Highlighted frame display (no bounding boxes) |
| `StatusBadge.jsx` | Color-coded status indicator |
| `LoadingOverlay.jsx` | Async operation loading state |

---

## Verification Plan

### Automated Tests

**Backend state machine unit test** (in `backend/tests/test_state_machine.py`):
```bash
cd c:\Users\Razi\Documents\HackSav\backend
python -m pytest tests/test_state_machine.py -v
```
- Valid transitions succeed
- Invalid transitions (skip, revert) raise errors

**ML service smoke test**:
```bash
cd c:\Users\Razi\Documents\HackSav\ml_service
python -c "from ml.main import app; print('ML service imports OK')"
```

### Manual Verification (Browser)

1. **Start all services**:
   - Terminal 1: `cd backend && uvicorn app.main:app --reload --port 8000`
   - Terminal 2: `cd ml_service && uvicorn ml.main:app --reload --port 8001`
   - Terminal 3: `cd frontend && npm run dev`

2. **Login flow**: Open `http://localhost:5173`, log in with admin credentials → verify JWT stored, dashboard loads

3. **Create inspection**: Click "New Inspection" → fill form → verify inspection appears in list with status `created`

4. **Upload video**: Click inspection → upload a short video → verify status changes to `video_uploaded`

5. **Run analysis**: Click "Analyze" → verify status changes to `analyzing` → wait → verify defects appear + status = `analysis_completed`

6. **Approve + report**: Click "Approve" → verify status = `approved` → wait for report generation → download PDF

7. **Error cases**: Verify invalid state transitions are blocked (e.g., try to approve before analysis)
