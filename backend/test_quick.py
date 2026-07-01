import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("Testing inspection creation...")

# Login
response = client.post("/api/login", json={
    "username": os.getenv("ADMIN_USERNAME", "admin"),
    "password": os.getenv("ADMIN_PASSWORD", ""),
})
print(f"Login: {response.status_code}")
token = response.json()["access_token"]

# Create inspection
response = client.post("/api/inspections", 
    json={"title": "Test Inspection", "description": "Test"},
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Create inspection: {response.status_code}")
if response.status_code == 200:
    print(f"Success: {response.json()}")
else:
    print(f"Error: {response.text}")