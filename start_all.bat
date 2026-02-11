@echo off
echo Starting HackSav Services...
echo.

echo Starting Backend (Port 8000)...
start "HackSav Backend" cmd /k "cd /d C:\Users\Razi\Documents\HackSav\backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 >nul

echo Starting ML Service (Port 8001)...
start "HackSav ML Service" cmd /k "cd /d C:\Users\Razi\Documents\HackSav\ml_service && uvicorn ml.main:app --host 0.0.0.0 --port 8001"
timeout /t 3 >nul

echo Starting Frontend (Port 5173)...
start "HackSav Frontend" cmd /k "cd /d C:\Users\Razi\Documents\HackSav\frontend && npm run dev"
timeout /t 3 >nul

echo.
echo ======================================
echo All services started!
echo.
echo Backend:   http://localhost:8000
echo ML Service: http://localhost:8001
echo Frontend:  http://localhost:5173
echo.
echo Default login: admin / admin123
echo ======================================
echo.
pause