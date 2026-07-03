#!/usr/bin/env python3
import argparse
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def print_banner():
    print("="*60)
    print(" KORDA 2.0: Developer CLI (Reasoning Coordination Plane)")
    print("="*60)

def do_query(project: str, query: str):
    print_banner()
    print(f"[*] Querying the Cognee Memory Plane for project '{project}'...")
    print(f"[*] Query: {query}")
    print(f"[*] Strategy: GRAPH_COMPLETION_COT (Deterministic Evidence Mode)\n")
    
    url = f"{BASE_URL}/query"
    data = json.dumps({"project_name": project, "query": query}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            if result.get("status") == "success":
                data_list = result.get("data", [])
                if not data_list:
                    print("[!] No contextual evidence found in the graph.")
                else:
                    print("[+] GRAPH COMPLETION RESULTS:")
                    for item in data_list:
                        # item is usually a string representing the extracted context
                        print(f"\n[Evidence Node]\n{item}\n")
            else:
                print(f"[-] Backend error: {result}")
    except urllib.error.URLError as e:
        print(f"[-] Connection failed. Is Korda backend running? ({e})")
        sys.exit(1)

def do_dsar(project: str, employee_id: str):
    print_banner()
    print(f"[*] Enterprise Compliance: Data Subject Access Request (DSAR)")
    print(f"[*] Project: {project}")
    print(f"[*] Target ID: {employee_id}")
    print(f"[*] Executing surgically targeted `cognee.forget()`...\n")
    
    url = f"{BASE_URL}/dsar"
    data = json.dumps({"project_name": project, "employee_id": employee_id}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            if result.get("status") == "success":
                print(f"[+] SUCCESS: {result.get('message')}")
            else:
                print(f"[-] Backend error: {result}")
    except urllib.error.URLError as e:
        print(f"[-] Connection failed. Is Korda backend running? ({e})")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Korda 2.0 Command Line Interface")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Query command
    query_parser = subparsers.add_parser("query", help="Query the temporal knowledge graph")
    query_parser.add_argument("project", type=str, help="Project name (e.g., Korda-Hackathon)")
    query_parser.add_argument("query", type=str, help="The question to ask the memory plane")
    
    # DSAR command
    dsar_parser = subparsers.add_parser("dsar", help="Execute a Data Subject Access Request (Forget API)")
    dsar_parser.add_argument("project", type=str, help="Project name")
    dsar_parser.add_argument("employee", type=str, help="Employee ID to prune")
    
    args = parser.parse_args()
    
    if args.command == "query":
        do_query(args.project, args.query)
    elif args.command == "dsar":
        do_dsar(args.project, args.employee)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
