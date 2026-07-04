# Korda — Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                     Next.js 16 (React)                           │
│                                                                  │
│   Landing Page ── Demo Page ── SDK Page ── Dashboard ── Runs     │
│        │               │                                         │
│        │          DemoStepper                                    │
│        │        (six-step loop)                                  │
│        │               │                                         │
│        └───────┬───────┘                                         │
│                │                                                 │
│          korda-api.ts                                            │
│       (frontend API client)                                      │
└────────────────┬─────────────────────────────────────────────────┘
                 │  HTTP / JSON
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    FastAPI (Python)                               │
│                                                                  │
│   app.py ─── graph_diff.py ─── ontology.py ─── coherence.py     │
│     │                                                            │
│     ├── POST /webhook/stream     (ingest telemetry)              │
│     ├── POST /api/v1/align       (divergence scorer)             │
│     ├── POST /api/v1/intercept   (prompt hardener)               │
│     ├── POST /api/v1/reconcile   (memory reconciliation)         │
│     ├── POST /cron/memify        (surgical pruning)              │
│     └── GET  /health             (status check)                  │
│                                                                  │
│   Ingestion Queue (asyncio.Queue)                                │
│   Session Memory Index (in-process)                              │
└────────────────┬─────────────────────────────────────────────────┘
                 │  Cognee SDK
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    COGNEE CLOUD TENANT                            │
│                                                                  │
│   remember()  ──  Ingest nodes, edges, and raw telemetry         │
│   recall()    ──  Session-scoped semantic + graph retrieval       │
│   improve()   ──  Consolidate multi-agent truths (or cognify)    │
│   forget()    ──  Surgically prune contaminated data by UUID     │
│   cognify()   ──  Build relational graph topology                │
└──────────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend — `web/`

| File | Purpose |
| --- | --- |
| `src/lib/korda-api.ts` | Frontend API client; all backend calls route through here |
| `src/components/korda-product.tsx` | Core product UI: DemoStepper, RealityGraph, RunEvidence, ReconciliationVisual, RunSummary |
| `src/app/page.tsx` | Landing page |
| `src/app/demo/page.tsx` | Interactive six-step workflow |
| `src/app/sdk/page.tsx` | SDK documentation page |
| `src/app/dashboard/page.tsx` | Architecture / dashboard view |
| `src/app/runs/[id]/page.tsx` | Run report viewer |

### Backend — `backend/`

| File | Purpose |
| --- | --- |
| `app.py` | FastAPI application, all endpoints, ingestion queue worker, Cognee Cloud lifecycle |
| `graph_diff.py` | Divergence scoring engine — projects Cognee recall results into a graph topology and calculates alignment score |
| `ontology.py` | Pydantic models: `DecisionNode`, `SupersedesEdge` |
| `coherence.py` | Coherence monitoring utilities |

### TypeScript SDK — `sdk/typescript/`

| File | Purpose |
| --- | --- |
| `src/index.ts` | `KordaClient` class wrapping all backend endpoints |
| `package.json` | npm package config (`@korda/sdk`) |

## Endpoints

### `POST /webhook/stream`

Non-blocking telemetry ingestion. Accepts `decision_update` or raw text payloads. Hands off to an async queue that calls `cognee.remember()` and `cognee.cognify()` sequentially.

### `POST /api/v1/align`

Dual-concurrent `cognee.recall()` against canonical and agent sessions. Passes both results through `graph_diff.calculate_graph_divergence()` to produce an alignment score (0–100). Falls back to the in-process session index if Cognee recall errors.

### `POST /api/v1/intercept`

Receives an agent prompt, runs `cognee.recall()` to traverse for stale `DecisionNode` references, and injects a guardrail prefix if drift is detected. Returns the hardened prompt.

### `POST /api/v1/reconcile`

1. Writes consensus truth to the canonical session via `cognee.remember()`.
2. Records a `SupersedesEdge` linking the old node to the new.
3. Runs `improve()` (or `cognify_repair` fallback) on the canonical session.
4. Surgically prunes the contaminated agent memory via `cognee.forget()` (direct delete) or writes a corrective stale mark if no UUID is available.

### `GET /health`

Returns backend status and whether Cognee credentials are loaded.

## The Six-Step Loop

```
  ① Ingest canonical truth          cognee.remember(session_id="global")
           │
  ② Ingest agent belief             cognee.remember(session_id="agent_b")
           │
  ③ Align                           dual cognee.recall() → graph_diff score
           │
  ④ Intercept stale prompt          cognee.recall() → guardrail injection
           │
  ⑤ Reconcile                       cognee.remember() + cognee.forget()
           │
  ⑥ Verify recall                   re-run alignment → confirm healthy score
```

## Divergence Scoring — `graph_diff.py`

The scorer projects raw Cognee recall results (which vary by search mode) into a `GraphProjection`: node IDs, statuses, edges, and text fragments. Divergence is calculated from:

- **Status conflicts** — agent marks a node active that canonical marks stale (or vice versa).
- **Missing active truth** — canonical has active nodes the agent doesn't know about.
- **Edge mismatch** — structural topology differences.
- **Text similarity** — `SequenceMatcher` fallback when graph structure is sparse.

The result is a 0–100 alignment score, where below 80 triggers a divergence alert.

## Deployment

- **Backend:** Render web service (`render.yaml`), Python 3.12, `uvicorn`.
- **Frontend:** Deployed separately (Vercel / Render static).
- **Environment variables:** `COGNEE_SERVICE_URL`, `COGNEE_API_KEY` (backend); `NEXT_PUBLIC_KORDA_API_URL` (frontend).
