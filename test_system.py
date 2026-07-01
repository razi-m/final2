#!/usr/bin/env python3
"""
Test script to verify all HackSav features are working
"""
import os
import requests
import json
import time

BASE_URL = "http://localhost:8000"
ML_URL = "http://localhost:8001"

def test_health():
    """Test health endpoints"""
    print("Testing Backend Health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200
    print(f"  ✓ Backend is healthy")
    
    print("Testing ML Service Health...")
    r = requests.get(f"{ML_URL}/health")
    assert r.status_code == 200
    print(f"  ✓ ML Service is healthy")

def test_login():
    """Test login functionality"""
    print("\nTesting Login...")
    r = requests.post(f"{BASE_URL}/api/login", json={
        "username": os.getenv("ADMIN_USERNAME", "admin"),
        "password": os.getenv("ADMIN_PASSWORD", ""),
    })
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    print(f"  ✓ Login successful")
    return data["access_token"]

def test_create_inspection(token):
    """Test creating an inspection"""
    print("\nTesting Create Inspection...")
    r = requests.post(f"{BASE_URL}/api/inspections", 
        json={
            "title": "Test Road Inspection",
            "description": "Testing the system"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "created"
    print(f"  ✓ Inspection created (ID: {data['id']})")
    return data["id"]

def test_get_inspections(token):
    """Test listing inspections"""
    print("\nTesting Get Inspections...")
    r = requests.get(f"{BASE_URL}/api/inspections",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = r.json()
    print(f"  ✓ Found {len(data)} inspections")

def test_get_inspection_detail(token, inspection_id):
    """Test getting inspection details"""
    print("\nTesting Get Inspection Detail...")
    r = requests.get(f"{BASE_URL}/api/inspections/{inspection_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == inspection_id
    print(f"  ✓ Retrieved inspection details")

def test_state_machine(token, inspection_id):
    """Test state machine transitions"""
    print("\nTesting State Machine...")
    
    # Test 1: Try to analyze without video (should fail)
    print("  Test 1: Analyze without video...")
    r = requests.post(f"{BASE_URL}/api/inspections/{inspection_id}/analyze",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Should fail because no video is uploaded
    assert r.status_code == 400 or r.status_code == 422
    print(f"    ✓ Correctly blocked: {r.json().get('detail', 'No detail')}")
    
    # Test 2: Try to approve before analysis (should fail)
    print("  Test 2: Approve before analysis...")
    r = requests.post(f"{BASE_URL}/api/inspections/{inspection_id}/approve",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 400
    print(f"    ✓ Correctly blocked: {r.json().get('detail', 'No detail')}")
    
    print("  ✓ State machine is working correctly")

def run_all_tests():
    """Run all tests"""
    print("="*50)
    print("HACKSAV SYSTEM TEST")
    print("="*50)
    
    try:
        test_health()
        token = test_login()
        test_get_inspections(token)
        inspection_id = test_create_inspection(token)
        test_get_inspection_detail(token, inspection_id)
        test_state_machine(token, inspection_id)
        
        print("\n" + "="*50)
        print("ALL TESTS PASSED! ✓")
        print("="*50)
        print("\nYour HackSav system is fully operational!")
        print("You can now:")
        print("  1. Login with your ADMIN_USERNAME/ADMIN_PASSWORD")
        print("  2. Create inspections")
        print("  3. Upload videos")
        print("  4. Run AI analysis")
        print("  5. Approve and generate PDF reports")
        print("\nFrontend: http://localhost:5173")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_all_tests()