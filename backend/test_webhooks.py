import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_slack_ingestion():
    print("[*] Testing Slack Ingestion (Resolved Thread)...")
    payload = {
        "type": "event_callback",
        "event": {
            "type": "message",
            "text": "The database connection pool was exhausting because of the new metrics exporter. I increased the pool size to 100. [RESOLVED]",
            "channel": "C_INFRA_OPS",
            "user": "U_LEAD_ENG"
        }
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/slack/events",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Slack Ingestion Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Slack Ingestion Failed: {e}")

def test_github_ingestion():
    print("\n[*] Testing GitHub PR Ingestion...")
    payload = {
        "action": "closed",
        "pull_request": {
            "merged": True,
            "title": "Fix memory leak in metrics exporter",
            "body": "Replaced the unbounded queue with a fixed-size ring buffer to prevent OOM kills on the metric exporter sidecar.",
            "html_url": "https://github.com/company/repo/pull/42"
        }
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/webhook/github",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] GitHub Ingestion Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] GitHub Ingestion Failed: {e}")

def test_slack_recall():
    print("\n[*] Testing Slack Recall (@Korda Mention)...")
    payload = {
        "type": "event_callback",
        "event": {
            "type": "app_mention",
            "text": "<@Korda> Why did the metrics exporter crash recently?",
            "channel": "C_INFRA_OPS",
            "user": "U_ONCALL_ENG"
        }
    }
    
    req = urllib.request.Request(
        f"{BASE_URL}/slack/events",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Slack Recall Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Slack Recall Failed: {e}")

def test_diagnostic_route():
    print("\n[*] Testing Diagnostic Topology Route...")
    req = urllib.request.Request(f"{BASE_URL}/diagnostic/graph", method="GET")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[+] Diagnostic Response: {response.read().decode('utf-8')}")
    except Exception as e:
        print(f"[-] Diagnostic Check Failed: {e}")

if __name__ == "__main__":
    print("========================================")
    print(" Korda Native Webhook Testing Suite")
    print("========================================\n")
    test_slack_ingestion()
    test_github_ingestion()
    
    print("\n[*] Waiting 5 seconds for Cognee background ingestion to process...")
    time.sleep(5)
    
    test_diagnostic_route()
    
    test_slack_recall()
    print("\n[+] Testing Complete.")
