import subprocess
import time
import sys
import os

def start_service(name, cmd, cwd):
    """Start a service and return the process"""
    print(f"Starting {name}...")
    if sys.platform == 'win32':
        process = subprocess.Popen(
            cmd,
            cwd=cwd,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        process = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    return process

if __name__ == "__main__":
    project_root = r"C:\Users\Razi\Documents\HackSav"
    
    # Start all services
    backend = start_service(
        "Backend",
        ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        os.path.join(project_root, "backend")
    )
    
    time.sleep(2)
    
    ml_service = start_service(
        "ML Service",
        ["uvicorn", "ml.main:app", "--host", "0.0.0.0", "--port", "8001"],
        os.path.join(project_root, "ml_service")
    )
    
    time.sleep(2)
    
    frontend = start_service(
        "Frontend",
        ["npm", "run", "dev"],
        os.path.join(project_root, "frontend")
    )
    
    print("\n✅ All services started!")
    print("Backend: http://localhost:8000")
    print("ML Service: http://localhost:8001")
    print("Frontend: http://localhost:5173")
    print("\nPress Ctrl+C to stop all services...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nStopping services...")
        backend.terminate()
        ml_service.terminate()
        frontend.terminate()
        print("Services stopped.")