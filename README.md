# ARIADOS

**An end-to-end AI platform for autonomous infrastructure inspection using drones, computer vision, and intelligent report generation.**

Built for [HackSavvy 2026](https://hacksavvy.com) — inspectors upload drone footage, the platform detects structural defects using YOLOv8, and automatically generates professional PDF maintenance reports for authorized review and approval.

---

## The Problem

Traditional infrastructure inspections are expensive, slow, and heavily dependent on manual visual assessments. Cracks, corrosion, and potholes go undetected until failures occur — creating safety risks and costly emergency repairs.

## The Solution

ARIADOS modernizes the inspection workflow end-to-end. Drone footage is uploaded through a secure web interface, processed by a locally deployed computer vision pipeline, and turned into a structured engineering report — complete with defect classifications, severity ratings, and photographic evidence — ready for administrator review and PDF export.

---

## Features

### AI Defect Detection
Frame-by-frame YOLOv8 analysis of drone inspection videos detecting crack, corrosion, and pothole defects. Each detection includes defect type, frame number, confidence score, timestamp, and severity classification.

### Intelligent Report Generation
Automatically generates professional inspection reports via Google Gemini, covering executive summary, inspection information, defect findings, severity analysis, condition assessment, maintenance recommendations, and photographic evidence references. Exported as PDF.

### Authentication & Authorization
JWT-based authentication with bcrypt password hashing and role-based access control for Inspector and Administrator roles.

### Mission Dashboard
Inspection statistics, processing queue, defect analytics, confidence metrics, review workflow, and report history in a single control surface.

### Video Processing Pipeline
Drag-and-drop MP4/MOV upload, background AI processing, progress tracking, frame sampling, and automatic result storage.

### Admin Panel
User management, report approval workflow, inspection history, role management, and system monitoring.

---

## Architecture

```
Drone Inspection Video
        │
        ▼
React Frontend (Vite)
        │
        ▼
FastAPI Backend (REST API)
        │
┌───────┼────────────────┐
▼       ▼                ▼
JWT   PostgreSQL     File Storage
Auth   (Inspections)  (Videos/Reports)
        │
        ▼
ML Inference Service
(YOLOv8 + OpenCV + PyTorch)
        │
        ▼
Defect Detection Results
        │
        ▼
AI Report Generation (Gemini)
        │
        ▼
Professional PDF Inspection Report
        │
        ▼
Admin Review & Approval
```

---

## Inspection Workflow

1. Inspector logs in and creates a new inspection mission
2. Uploads drone video (MP4 / MOV)
3. Backend stores the video and triggers the ML service
4. YOLOv8 processes footage frame-by-frame
5. Defect detections are stored with confidence scores and severity
6. Gemini generates a structured engineering report
7. Administrator reviews findings and approves
8. Final PDF report is archived

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, React Router, Axios |
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL, JWT, Passlib (bcrypt), Pydantic |
| **ML** | YOLOv8, PyTorch, OpenCV, NumPy |
| **AI Reports** | Google Gemini API, Structured Prompt Engineering, Markdown → PDF |
| **Storage** | PostgreSQL, Local file storage for videos, results, and PDFs |

---

## Project Structure

```
ARIADOS/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   ├── uploads/
│   ├── results/
│   └── requirements.txt
├── ml_service/
│   ├── ml/
│   ├── models/
│   ├── training_workspace/
│   └── requirements.txt
├── docs/
├── start_all.bat
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### ML Service

```bash
cd ml_service
pip install -r requirements.txt
python main.py
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
# Database — SQLite by default; swap in a PostgreSQL URL for production
DATABASE_URL=sqlite:///./hacksav.db
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
MODEL_PATH=path/to/model.pt
ML_SERVICE_URL=http://localhost:8001

# Admin bootstrap — no default password is created; set these to seed an admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose_a_strong_password
```

> **Security note:** The backend no longer auto-creates a default `admin/admin123`
> account. An admin is only created when `ADMIN_PASSWORD` is set. Never commit
> your `.env` file or the SQLite database — both are gitignored.

---

## Roadmap

- [x] Secure JWT authentication and role-based access
- [x] Drone video upload pipeline
- [x] YOLOv8 AI defect detection (cracks, corrosion, potholes)
- [x] PostgreSQL integration
- [x] Professional PDF report generation
- [x] Admin approval workflow
- [ ] Live drone video streaming
- [ ] Real-time detection
- [ ] GPS defect mapping
- [ ] Infrastructure health scoring
- [ ] Predictive maintenance
- [ ] Cloud deployment

---

## License

MIT

---

## Team

**Mohammed Raziullah** — AI/ML & Full-Stack Development

HackSavvy 2026