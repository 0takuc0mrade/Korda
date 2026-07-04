# Korda Live Proof Harness

This folder contains a repeatable live proof for Korda's backend truth flow. It is meant to produce hackathon evidence from the real FastAPI backend and Cognee Cloud connection, not from frontend-only mock visuals.

## What It Demonstrates

The proof script exercises the full Korda loop:

1. Ingest canonical project truth into the canonical session.
2. Ingest divergent agent memory into a separate agent session.
3. Call `/api/v1/align` to compare the canonical graph against the agent graph.
4. Call `/api/v1/intercept` with a stale prompt that references `AUTH_API_V1`.
5. Call `/api/v1/reconcile` to write the resolved truth and correct/prune the agent session.
6. Call `/api/v1/align` again and save a before/after artifact.

## Required Environment Variables

The backend loads `backend/.env`. The proof script also reads `backend/.env` and root `.env` if present.

Required for the backend:

```bash
COGNEE_SERVICE_URL=
COGNEE_API_KEY=
```

Optional for the proof script:

```bash
KORDA_BACKEND_URL=http://127.0.0.1:8000
KORDA_PROOF_INGEST_WAIT_SECONDS=12
KORDA_PROOF_RECONCILE_WAIT_SECONDS=8
```

Secrets are redacted in the generated proof artifact.

## Start The Backend

From the repo root:

```bash
backend/.venv/bin/uvicorn app:app --app-dir backend --reload
```

Leave that terminal running. Open a second terminal for the proof script.

## Run The Proof

From the repo root:

```bash
backend/.venv/bin/python proof/live-proof.py
```

## Successful Output

A successful run prints:

```text
[health] backend ok
[ingest] canonical truth accepted
[ingest] divergent agent memory accepted
[align before reconciliation]
alignment_score: <number>
divergence_detected: true
[intercept]
status: intercepted
hardened_prompt: ...
[reconcile]
status: reconciled
[align after reconciliation]
alignment_score: <number>
[artifact] saved proof/output/live-proof-<timestamp>.json
```

The exact score can vary because the live proof depends on Cognee Cloud recall output, but the artifact will show the raw responses and the deterministic Korda graph diff.

## Hackathon Evidence Artifact

Each run writes a JSON file to:

```text
proof/output/live-proof-<timestamp>.json
```

Use this artifact as backend evidence. It includes:

- request payloads
- backend responses
- alignment scores before and after reconciliation
- divergence point if returned
- intercept result and hardened prompt
- reconciliation outcome
- redacted environment details

## Known Limitations

- Cognee supports `session_id` for `remember()` and `recall()`, but the installed SDK does not expose direct `forget(node_id, session_id=...)`.
- Korda uses Cognee data IDs for direct memory deletion when available.
- When direct session-specific deletion is unavailable, Korda writes an explicit stale correction into the agent session.
- The dashboard is a visual/demo layer. The backend proof artifact is the source of truth for submission evidence.
