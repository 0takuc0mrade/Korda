import urllib.request
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def inject_canonical_truth():
    print("[*] Injecting Canonical Truth (Ground Reality)...")
    payload = {
        "type": "canonical",
        "context_id": "API_SPEC_V2",
        "domain": "API Implementation",
        "truth": "The API has been updated to v2. The old v1 endpoints are deprecated.",
        "version": "v2.0",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/webhook/stream",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Injection Failed: {e}")

def inject_stale_perception():
    print("\n[*] Injecting Stale Perception (Reality Fragmentation)...")
    payload = {
        "type": "perception",
        "perception_id": "AI_CODING_AGENT_01",
        "actor": "Code Generation Agent",
        "interpretation": "Generating backend code targeting the v1 API endpoints based on the cached specification.",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/webhook/stream",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Injection Failed: {e}")

def test_reconciliation():
    print("\n[*] Triggering Divergence Detection Engine...")
    req = urllib.request.Request(f"{BASE_URL}/api/v1/reconcile", method="GET")
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"[!] SYSTEM STATUS: {data.get('status').upper()}")
            print(f"[!] ALERT: {data.get('alert', data.get('message'))}")
    except Exception as e:
        print(f"[-] Check Failed: {e}")

if __name__ == "__main__":
    print("========================================")
    print(" Korda: Reality Fragmentation Test Suite")
    print("========================================\n")
    
    inject_canonical_truth()
    inject_stale_perception()
    
    print("\n[*] Waiting 8 seconds for Asynchronous Worker to process & cognify the graph...")
    time.sleep(8)
    
    test_reconciliation()
    print("\n[+] Audit Trail Complete.")
