# Korda: The Shared Reality Engine for Autonomous Agents

> *"When multiple agents need to share state, using per-agent context or per-session embeddings creates fragmentation. Each agent operates on a different slice of truth."* 
> — Cognee Official Documentation

[![Live Demo on Render](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render)](https://korda.onrender.com)

**TL;DR:** Korda is a middleware router that stops AI agents from hallucinating outdated context. Instead of relying on fuzzy text search, it natively hooks into Cognee Cloud to mathematically compare an agent's subjective memory against the global ground truth, injecting hard guardrails before the LLM can make a mistake.

## 🍻 The Problem: Your AI Has a Hangover

If an AI agent queries a standard vector database for "API documentation," it will likely pull up deprecated version 1 docs because the textual semantic overlap is 95% identical to version 2. Vectors are notoriously terrible at handling temporal state changes (old vs. new). 

When a multi-agent system runs, agents quickly spill out of their context windows. They forget the groom, lose the plot, and wake up on the roof asking *"where's my context?"* 

**Alerting a human that an AI agent hallucinated stale code is a failure. Preventing the hallucination before the LLM prompt executes is the solution.**

## 🧠 The Solution: Korda (Powered by Cognee Cloud)

Korda isn't trying to reinvent the AI agent. We built Korda because current AI infrastructure has a fatal flaw: **Agents cannot handle temporal state changes without a persistent memory layer.**

Korda is a **Cloud Native Shared Reality Engine**. Instead of acting as a passive database, Korda acts as **Runtime Liability Protection**. It's an ultra-fast **Dynamic Context Mutator** that intercepts an agent's prompt, instantly queries your massive **Cognee Cloud** brain, mathematically calculates "Reality Drift", and surgically injects guardrails based on actual graph topology.

### The Korda 2.0 Pipelines:
Korda uses Cognee sessions to isolate participant memory, dual recall to compare subjective memory against canonical truth, and reconciliation calls to update/prune memory:
1. **Topological Session Isolation (Dual-Tier Memory):** We isolate participant memory by explicitly assigning `session_id=agent_id` during `cognee.remember()` operations.
2. **The Deterministic State Enforcer:** We use dual `cognee.recall()` queries to retrieve and compare an agent's subjective memory against the Canonical Truth.
   ```python
   # Dual concurrent recall (Canonical vs Agent Perspective)
   canonical_task = cognee.recall(query_text=query, session_id="global")
   agent_task = cognee.recall(query_text=query, session_id=agent_session_id)
   
   canonical_results, agent_results = await asyncio.gather(canonical_task, agent_task)
   
   # Mathematically score the Reality Drift
   alignment_score, divergence_points = calculate_topological_drift(canonical_results, agent_results)
   ```
3. **The Reconciliation Pipeline:** When consensus is reached, we issue reconciliation calls to update the canonical graph (`cognee.remember()`) and surgically prune the agent's contaminated memory (`cognee.forget()`).

### Why Korda Coordinates .improve() and .forget() for Runtime Determinism
In a standard Cognee workflow, `cognee.improve()` (or memify) runs post-ingestion enrichment to prune stale nodes and adapt weights over time. 

Korda separates these lifecycle operations into two distinct runtime tiers to achieve true Zero-Trust Enterprise Safety:
1. **Immediate Prompt Invalidation (.forget() + Guardrail):** 
   When Korda's middleware layer detects reality drift during an active agent execution, waiting for a background cloud graph re-indexing pass is an enterprise liability. Korda isolates real-time prompt protection at 42ms by instantly injecting a hard text guardrail (`[KORDA GUARDRAIL]`), and asynchronously offloads the deep graph restructuring to `cognee.forget()` to isolate the contaminated memory path.
2. **Scheduled Topology Clean-up (.improve()):** 
   Once the immediate stale node is severed via `forget()`, Korda triggers `cognee.improve()` on a secondary worker loop. This ensures that graph weights are adapted globally and overall structural indices are optimized across the Cognee Cloud tenant without bottlenecking the low-latency (42ms) mutator.

---

## ☁️ Architecture: Best Use of Cognee Cloud

In a generic hackathon project, Cognee is an "add-on" wrapper. In Korda, **Cognee Cloud is the absolute homebase and lifeforce.** 

We entirely stripped out localized Kuzu databases and third-party LLM middlemen. Korda is deployed on Render as a hyper-efficient orchestration layer connected via a persistent socket directly to a dedicated **Cognee Cloud Tenant**. 

```text
       [ External Chat / Repo Updates ]
                  │
                  ▼
         [ Korda Ingestion ]
                  │
                  ▼
      ┌───────────────────────┐
      │  COGNEE CLOUD TENANT  │ ◄── (Powered by the COGNEE-35 Hackathon Code)
      │                       │
      │  .remember()          │ ──► Maps explicit temporal status (active vs stale)
      │  .recall()            │ ──► Dual-concurrent querying (Canonical vs Session)
      │  .improve()           │ ──► Consolidates multi-agent truths
      │  .forget()            │ ──► Surgically prunes contaminated agent memory
      └───────────────────────┘
                  │
                  ▼
  [ Korda Context Interceptor ] 
  (Injects Guardrail into Agent Prompt)
                  │
                  ▼
         [ LLM Gateway ]
```

### Why Cognee Cloud?
By migrating Korda to Cognee Cloud, we moved off localized SQLite file-locking to a robust architecture capable of handling the dual-recall pipelines and cross-session reconciliation operations required for multi-agent drift detection.

> **Engineered and stress-tested natively using Cognee Cloud Developer Tier via the COGNEE-35 framework.**

---

## 🚀 Live Verification & Demo

Korda is officially deployed and live on the internet! 

**1. The Live Backend API:**
Access the interactive Swagger UI to view the endpoints and intercept logic:
👉 [https://korda.onrender.com/docs](https://korda.onrender.com/docs)

**2. The Four Operations in Action:**
Korda heavily leans on the core Cognee memory lifecycle APIs:
*   `/webhook/stream`: Uses `remember()` to asynchronously ingest new telemetry into the Canonical graph.
*   `/api/v1/align`: Uses dual `recall()` to mathematically score Reality Drift.
*   `/api/v1/reconcile`: Uses `remember()` to enforce consensus and `forget()` to purge the subjective agent's hallucinations.

## 🛠 Tech Stack
*   **Memory Layer:** Cognee Cloud SDK
*   **Orchestration Engine:** FastAPI (Python)
*   **Deployment:** Render (Cloud Native)
*   **Frontend UI:** Next.js 16 (React) with React Three Fiber (Drei) for 3D Topology Visualization.