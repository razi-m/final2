import subprocess
import time
import os

project_root = r"C:\Users\Razi\Documents\HackSav"

print("Starting HackSav services...")
print()

# Start Backend
print("1. Starting Backend (Port 8000)...")
subprocess.Popen(
    ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd=os.path.join(project_root, "backend"),
    creationflags=subprocess.CREATE_NEW_CONSOLE
)
time.sleep(3)

# Start ML Service
print("2. Starting ML Service (Port 8001)...")
subprocess.Popen(
    ["python", "-m", "uvicorn", "ml.main:app", "--host", "0.0.0.0", "--port", "8001"],
    cwd=os.path.join(project_root, "ml_service"),
    creationflags=subprocess.CREATE_NEW_CONSOLE
)
time.sleep(3)

# Start Frontend
print("3. Starting Frontend (Port 5173)...")
subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=os.path.join(project_root, "frontend"),
    creationflags=subprocess.CREATE_NEW_CONSOLE
)
time.sleep(3)

print()
print("="*50)
print("All services started!")
print()
print("Backend:    http://localhost:8000")
print("ML Service: http://localhost:8001")
print("Frontend:   http://localhost:5173")
print()
print("Login: admin / admin123")
print("="*50)
print()
print("Press Enter to exit...")
input()