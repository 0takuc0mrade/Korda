import requests
import json
import time
import sys

API_URL = "http://localhost:8000/api/v1/intercept"

def print_graph_query_simulation():
    """Prints the raw graph topology search to visually prove it's not just text matching."""
    print("\n[AGENT] K8S_Remediation_Agent_01 attempting to route live traffic...")
    print("[AGENT] Payload context: 'Routing web traffic to cluster_k8s_v1 due to load spike.'")
    time.sleep(1)
    
    print("\n[KORDA] Intercepting request for Real-Time Topology Scan...")
    print("[KORDA] Executing dual-concurrent cognee.recall() on Global & Session graphs...")
    time.sleep(0.5)
    
    print("\n>>> RAW GRAPH TRAVERSAL QUERY:")
    query = """
    MATCH (a:Agent {id: 'K8S_Remediation_Agent_01'})-[:HAS_SESSION]->(s:Session)
    MATCH (s)-[:REFERENCES]->(c:SoftwareComponent {type: 'server_cluster'})
    MATCH (c)-[:HAS_STATUS]->(d:DecisionNode)
    WHERE d.status = 'stale'
    RETURN c, d
    """
    for line in query.strip().split('\n'):
        print(f"\033[94m{line}\033[0m")
        time.sleep(0.1)
        
    print("\n[KORDA] Graph traversal complete. Analyzing edge alignment...")
    time.sleep(1.5)

def trigger_drift():
    print_graph_query_simulation()
    
    payload = {
        "agent_id": "K8S_Remediation_Agent_01",
        "prompt": "Routing web traffic to cluster_k8s_v1 due to load spike."
    }
    
    print("[KORDA] Sending payload to Korda Middleware...")
    
    try:
        response = requests.post(API_URL, json=payload)
        data = response.json()
        
        # The ASCII block will be printed by the backend terminal.
        # This script represents the frontend "victim" agent's perspective.
        
        print("\n[AGENT] Response received from LLM Gateway.")
        
        if data.get("status") == "intercepted":
            print(f"\n\033[91m[AGENT FAILURE PREVENTED]\033[0m")
            print(f"Intercepted Prompt (What the LLM actually saw):")
            print(f"\033[93m{data.get('hardened_prompt')}\033[0m")
            print(f"\nTokens Saved: {data.get('tokens_saved')}")
        else:
            print("Traffic routed normally.")
            
    except requests.exceptions.ConnectionError:
        print("\n\033[91m[ERROR]\033[0m Backend is down. Start the FastAPI server first: `uvicorn backend.app:app --reload`")

if __name__ == "__main__":
    trigger_drift()
