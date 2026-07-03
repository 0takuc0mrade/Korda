import urllib.request
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def inject_api_update():
    print("[*] Human Developer: Updating API Graph Topology in Chat...")
    payload = {
        "type": "api_update",
        "component": "User Authentication Microservice",
        "old_endpoint_id": "AUTH_API_V1",
        "old_endpoint": "/api/v1/auth",
        "old_version": "v1",
        "new_endpoint_id": "AUTH_API_V2",
        "new_endpoint": "/api/v2/auth",
        "new_version": "v2"
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/webhook/stream",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Webhook Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Webhook Failed: {e}")

def test_interceptor():
    print("\n[*] AI Coding Agent: Requesting LLM Generation...")
    
    agent_prompt = (
        "I need to write a Python script to authenticate a user. "
        "I will use the /api/v1/auth endpoint as per the cached documentation."
    )
    
    print(f"    [Agent's Original Intent]: '{agent_prompt}'")
    print("\n[*] Korda: Intercepting LLM Request & Querying Cognee Graph for Stale Dependencies...")
    
    payload = {
        "prompt": agent_prompt
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/api/v1/intercept",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"\n[!] SYSTEM STATUS: {data.get('status').upper()}")
            print(f"[!] METRIC: Tokens Saved: {data.get('tokens_saved', 'N/A')}")
            print("\n==================================================")
            print(" KORDA GUARDRAIL INJECTED (HARDENED LLM PROMPT):")
            print("==================================================\n")
            print(data.get('hardened_prompt'))
            print("==================================================")
            
    except Exception as e:
        print(f"[-] Check Failed: {e}")

if __name__ == "__main__":
    print("========================================")
    print(" Korda: Proactive Context Interceptor Suite")
    print("========================================\n")
    
    inject_api_update()
    
    print("\n[*] Waiting 8 seconds for Asynchronous Worker to process & cognify the graph...")
    time.sleep(8)
    
    test_interceptor()
    print("\n[+] Interception Test Complete.")
