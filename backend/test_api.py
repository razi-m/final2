from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login():
    response = client.post("/api/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    print(f"Login successful, token: {data['access_token'][:20]}...")
    return data["access_token"]

def test_create_inspection(token):
    response = client.post("/api/inspections", 
        json={"title": "Test Inspection", "description": "Test"},
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Create inspection status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        data = response.json()
        print(f"Created inspection ID: {data['id']}")
        return data["id"]
    return None

if __name__ == "__main__":
    print("Testing HackSav Backend...")
    token = test_login()
    inspection_id = test_create_inspection(token)
    
    if inspection_id:
        print(f"\nAll tests passed! Inspection ID: {inspection_id}")
    else:
        print("\nFailed to create inspection")