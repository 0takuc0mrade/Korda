# Korda — Submission

> **Korda is a shared reality engine for AI agents.**

## Problem

Agents can silently drift into different versions of project truth. When multiple agents share state through per-session embeddings or per-agent context windows, each operates on a different slice of reality. Standard vector search cannot distinguish stale knowledge from current knowledge — the semantic overlap is near-identical.

Alerting a human that an AI agent hallucinated stale context is a failure. Preventing the hallucination before the LLM prompt executes is the solution.

## Solution

Korda compares canonical truth against agent belief, detects drift, hardens prompts, reconciles memory, and verifies recall.

It sits between agent memory and action as a middleware layer powered by [Cognee Cloud](https://www.cognee.ai/). Korda does not replace your agents — it keeps their working context honest.

### The Six-Step Loop

1. **Ingest canonical truth** — record the team's agreed project state.
2. **Ingest agent belief** — record what the agent currently believes.
3. **Align** — score how far the agent's belief has diverged from canonical truth.
4. **Intercept** — catch stale prompts and harden them before they reach the model.
5. **Reconcile** — update canonical truth and surgically correct the agent's memory.
6. **Verify recall** — re-run alignment to confirm the agent is back in sync.

## What Works

| Capability | Status |
| --- | --- |
| Session-scoped canonical and agent memory | ✅ Live |
| Cognee Cloud ingestion via `remember()` | ✅ Live |
| Live alignment endpoint (`POST /api/v1/align`) | ✅ Live |
| Live intercept endpoint (`POST /api/v1/intercept`) | ✅ Live |
| Live reconcile endpoint (`POST /api/v1/reconcile`) | ✅ Live |
| Verify recall (post-reconciliation alignment) | ✅ Live |
| Frontend six-step interactive workflow | ✅ Live |
| Custom user-defined workflow inputs | ✅ Live |
| Run Evidence receipts with copy-to-clipboard | ✅ Live |
| Publishable TypeScript SDK (`@korda/sdk`) | ✅ Built |

## What Is Limited

| Limitation | Detail |
| --- | --- |
| Not production-ready | Demoable MVP / working prototype |
| No long-running autonomous monitoring | Session-scoped alignment, not continuous agent surveillance |
| No full arbitrary graph deletion | Direct `forget()` only works when Korda has a real data ID/UUID |
| `improve()` availability | May be unavailable on current Cognee Cloud tenant/API; Korda falls back to `cognify_repair` |

See [LIMITATIONS.md](LIMITATIONS.md) for precise language.

## Links

| Resource | Path |
| --- | --- |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Demo Script | [DEMO_SCRIPT.md](DEMO_SCRIPT.md) |
| Live Proof Checklist | [LIVE_PROOF.md](LIVE_PROOF.md) |
| Limitations | [LIMITATIONS.md](LIMITATIONS.md) |
| TypeScript SDK | [SDK.md](SDK.md) |
| Validation Checklist | [CHECKLIST.md](CHECKLIST.md) |

## Tech Stack

- **Frontend:** Next.js 16 (React)
- **Backend:** FastAPI (Python)
- **Memory Layer:** Cognee Cloud SDK
- **Divergence Logic:** Custom graph projection + topological diff
- **SDK:** TypeScript, publishable to npm
- **Deployment:** Render
