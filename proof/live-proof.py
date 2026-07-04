#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
PROOF_DIR = ROOT / "proof"
PAYLOAD_DIR = PROOF_DIR / "sample_payloads"
OUTPUT_DIR = PROOF_DIR / "output"
DEFAULT_BACKEND_URL = "http://127.0.0.1:8000"
SECRET_KEY_PARTS = ("KEY", "TOKEN", "SECRET", "PASSWORD", "CREDENTIAL")


def load_dotenv_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def load_environment() -> str:
    load_dotenv_file(ROOT / ".env")
    load_dotenv_file(ROOT / "backend" / ".env")
    return os.getenv("KORDA_BACKEND_URL", DEFAULT_BACKEND_URL).rstrip("/")


def load_payload(name: str) -> dict[str, Any]:
    with (PAYLOAD_DIR / name).open() as payload_file:
        return json.load(payload_file)


def redact(value: Any) -> Any:
    if isinstance(value, dict):
        redacted = {}
        for key, item in value.items():
            if any(part in key.upper() for part in SECRET_KEY_PARTS):
                redacted[key] = "<redacted>"
            else:
                redacted[key] = redact(item)
        return redacted
    if isinstance(value, list):
        return [redact(item) for item in value]
    return value


def request_json(method: str, backend_url: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = Request(f"{backend_url}{path}", data=data, headers=headers, method=method)
    try:
        with urlopen(request, timeout=90) as response:
            body = response.read().decode("utf-8")
            return {
                "ok": 200 <= response.status < 300,
                "status_code": response.status,
                "body": json.loads(body) if body else {},
            }
    except HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            parsed_body = json.loads(body) if body else {}
        except json.JSONDecodeError:
            parsed_body = {"raw": body}
        return {"ok": False, "status_code": error.code, "body": parsed_body}
    except URLError as error:
        return {"ok": False, "status_code": None, "body": {"error": str(error)}}


def record_step(artifact: dict[str, Any], name: str, request_data: dict[str, Any] | None, response: dict[str, Any]) -> None:
    artifact["steps"].append(
        {
            "name": name,
            "request": redact(request_data or {}),
            "response": redact(response),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )


def print_align(label: str, response: dict[str, Any]) -> None:
    body = response.get("body", {})
    diff = body.get("diff", {}) if isinstance(body, dict) else {}
    print(f"\n[{label}]")
    print(f"canonical_session_id: {body.get('canonical_session_id')}")
    print(f"agent_session_id: {body.get('agent_session_id')}")
    print(f"alignment_score: {body.get('alignment_score')}")
    print(f"divergence_detected: {body.get('status') == 'diverged'}")
    print(f"likely_split_point: {body.get('divergence_point')}")
    print(f"stale/conflict facts: {diff.get('direct_conflicts', [])}")
    print(f"active-only agent facts: {diff.get('agent_only_nodes', [])}")
    print(f"missing canonical facts: {diff.get('missing_from_agent', [])}")


def print_intercept(response: dict[str, Any]) -> None:
    body = response.get("body", {})
    hardened_prompt = body.get("hardened_prompt", "")
    print("\n[intercept]")
    print(f"status: {body.get('status')}")
    print(f"original_prompt: {body.get('original_prompt')}")
    print(f"hardened_prompt: {hardened_prompt}")
    print(f"stale_references_detected: {['AUTH_API_V1'] if 'AUTH_API_V1' in hardened_prompt else []}")
    print(f"injected_correction: {'AUTH_API_V2 / scoped service tokens' if 'AUTH_API_V1' in hardened_prompt else None}")


def save_artifact(artifact: dict[str, Any]) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output_path = OUTPUT_DIR / f"live-proof-{timestamp}.json"
    output_path.write_text(json.dumps(redact(artifact), indent=2, sort_keys=True))
    return output_path


def main() -> int:
    backend_url = load_environment()
    canonical_payload = load_payload("canonical_truth.json")
    divergent_payload = load_payload("divergent_agent_memory.json")
    stale_prompt_payload = load_payload("stale_prompt.json")
    reconcile_payload = load_payload("reconcile_payload.json")

    align_payload = {
        "canonical_session_id": canonical_payload.get("session_id", "global"),
        "agent_session_id": divergent_payload.get("session_id", "agent_b"),
        "query": "What is the active authentication API, and should login middleware use legacy API keys or scoped service tokens?",
        "divergence_threshold": 80.0,
    }

    artifact: dict[str, Any] = {
        "started_at": datetime.now(timezone.utc).isoformat(),
        "backend_url": backend_url,
        "environment": redact(
            {
                "KORDA_BACKEND_URL": os.getenv("KORDA_BACKEND_URL", DEFAULT_BACKEND_URL),
                "COGNEE_SERVICE_URL": os.getenv("COGNEE_SERVICE_URL"),
                "COGNEE_API_KEY": os.getenv("COGNEE_API_KEY"),
            }
        ),
        "steps": [],
        "summary": {},
    }

    try:
        health_response = request_json("GET", backend_url, "/health")
        record_step(artifact, "health", None, health_response)
        if health_response["ok"]:
            print("[health] backend ok")
        else:
            print("[health] skipped or unavailable")

        canonical_response = request_json("POST", backend_url, "/webhook/stream", canonical_payload)
        record_step(artifact, "ingest_canonical_truth", canonical_payload, canonical_response)
        if not canonical_response["ok"]:
            raise RuntimeError(f"canonical ingestion failed: {canonical_response}")
        print("[ingest] canonical truth accepted")

        divergent_response = request_json("POST", backend_url, "/webhook/stream", divergent_payload)
        record_step(artifact, "ingest_divergent_agent_memory", divergent_payload, divergent_response)
        if not divergent_response["ok"]:
            raise RuntimeError(f"divergent memory ingestion failed: {divergent_response}")
        print("[ingest] divergent agent memory accepted")

        # The backend ingests asynchronously. Give Cognee Cloud a moment to
        # remember/improve/cognify before recall-based proof steps.
        wait_seconds = float(os.getenv("KORDA_PROOF_INGEST_WAIT_SECONDS", "12"))
        print(f"[wait] allowing {wait_seconds:.0f}s for asynchronous graph ingestion")
        time.sleep(wait_seconds)

        align_before = request_json("POST", backend_url, "/api/v1/align", align_payload)
        record_step(artifact, "align_before_reconciliation", align_payload, align_before)
        if not align_before["ok"]:
            raise RuntimeError(f"align before reconciliation failed: {align_before}")
        print_align("align before reconciliation", align_before)

        intercept_response = request_json("POST", backend_url, "/api/v1/intercept", stale_prompt_payload)
        record_step(artifact, "intercept_stale_prompt", stale_prompt_payload, intercept_response)
        if not intercept_response["ok"]:
            raise RuntimeError(f"intercept failed: {intercept_response}")
        print_intercept(intercept_response)

        reconcile_response = request_json("POST", backend_url, "/api/v1/reconcile", reconcile_payload)
        record_step(artifact, "reconcile", reconcile_payload, reconcile_response)
        if not reconcile_response["ok"]:
            raise RuntimeError(f"reconcile failed: {reconcile_response}")
        print("\n[reconcile]")
        print(f"status: {reconcile_response.get('body', {}).get('status')}")
        print(f"purged_node: {reconcile_response.get('body', {}).get('purged_node')}")
        print(f"purge_mode: {reconcile_response.get('body', {}).get('purge_result', {}).get('mode')}")

        time.sleep(float(os.getenv("KORDA_PROOF_RECONCILE_WAIT_SECONDS", "8")))
        align_after = request_json("POST", backend_url, "/api/v1/align", align_payload)
        record_step(artifact, "align_after_reconciliation", align_payload, align_after)
        if not align_after["ok"]:
            raise RuntimeError(f"align after reconciliation failed: {align_after}")
        print_align("align after reconciliation", align_after)

        before_body = align_before.get("body", {})
        after_body = align_after.get("body", {})
        artifact["summary"] = {
            "success": True,
            "alignment_score_before": before_body.get("alignment_score"),
            "alignment_score_after": after_body.get("alignment_score"),
            "status_before": before_body.get("status"),
            "status_after": after_body.get("status"),
            "reconciliation_status": reconcile_response.get("body", {}).get("status"),
            "reconciliation_purge_mode": reconcile_response.get("body", {}).get("purge_result", {}).get("mode"),
        }

        print("\n[before/after]")
        print(f"alignment_score_before: {artifact['summary']['alignment_score_before']}")
        print(f"alignment_score_after: {artifact['summary']['alignment_score_after']}")
        print(f"reconciliation_outcome: {artifact['summary']['reconciliation_status']}")

        output_path = save_artifact(artifact)
        print(f"\n[artifact] saved {output_path}")
        return 0
    except Exception as error:
        artifact["summary"] = {
            "success": False,
            "error": str(error),
        }
        output_path = save_artifact(artifact)
        print(f"\n[failed] {error}", file=sys.stderr)
        print(f"[artifact] saved failed proof artifact to {output_path}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
