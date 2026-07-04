import urllib.request
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def inject_decision_update():
    print("[*] Human Developer: Overwriting System Reality via Korda Ingestion...")
    payload = {
        "type": "decision_update",
        "session_id": "global",
        "context_type": "API Spec",
        "old_node_id": "AUTH_API_V1",
        "old_description": "The legacy v1 authentication endpoints.",
        "new_node_id": "AUTH_API_V2",
        "new_description": "The new v2 JWT authentication system.",
        "update_reason": "Deprecated due to critical security vulnerability in v1."
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
        print(f"[-] Interceptor Check Failed: {e}")

def test_align_and_reconcile():
    print("\n[*] Running Korda 2.0 Dual-Tier Reality Alignment Scorer...")
    
    # 1. Check Alignment
    align_payload = {
        "agent_session_id": "AGENT_77",
        "query": "What is the auth endpoint?",
        "force_divergence": True
    }
    req_align = urllib.request.Request(
        f"{BASE_URL}/api/v1/align",
        data=json.dumps(align_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_align) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"[!] DIVERGENCE SCORER: {data.get('message')}")
    except Exception as e:
        print(f"[-] Align Check Failed: {e}")

    # 2. Reconcile and Purge Memory
    print("\n[*] Triggering Surgical Memory Purge via cognee.forget()...")
    reconcile_payload = {
        "agent_session_id": "AGENT_77",
        "consensus_node_id": "AUTH_API_V1",
        "reconciled_context": "The auth system is v2 JWT exclusively."
    }
    req_reconcile = urllib.request.Request(
        f"{BASE_URL}/api/v1/reconcile",
        data=json.dumps(reconcile_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_reconcile) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"[+] RECONCILIATION SUCCESS: {data.get('message')}")
    except Exception as e:
        print(f"[-] Reconcile Failed: {e}")

if __name__ == "__main__":
    print("========================================")
    print(" Korda 2.0: The Structural Truth Engine")
    print("========================================\n")
    
    print("[*] Waiting for Korda Backend to boot...")
    time.sleep(3)
    
    inject_decision_update()
    
    print("\n[*] Waiting 8 seconds for Asynchronous Worker to process & cognify the graph...")
    time.sleep(8)
    
    test_interceptor()
    test_align_and_reconcile()
    
    print("\n[+] Full Korda 2.0 Demonstration Complete.")
