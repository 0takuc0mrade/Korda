# Korda: The Shared Reality Engine for Autonomous Agents

> *"When multiple agents need to share state, using per-agent context or per-session embeddings creates fragmentation. Each agent operates on a different slice of truth."* 
> — Cognee Official Documentation

[![Live Demo on Render](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render)](https://korda.onrender.com)

## 🍻 The Problem: Your AI Has a Hangover

If an AI agent queries a standard vector database for "API documentation," it will likely pull up deprecated version 1 docs because the textual semantic overlap is 95% identical to version 2. Vectors are notoriously terrible at handling temporal state changes (old vs. new). 

When a multi-agent system runs, agents quickly spill out of their context windows. They forget the groom, lose the plot, and wake up on the roof asking *"where's my context?"* 

**Alerting a human that an AI agent hallucinated stale code is a failure. Preventing the hallucination before the LLM prompt executes is the solution.**

## 🧠 The Solution: Korda (Powered by Cognee Cloud)

Korda isn't trying to reinvent the AI agent. We built Korda because current AI infrastructure has a fatal flaw: **Agents cannot handle temporal state changes without a persistent memory layer.**

Korda is a **Cloud Native Shared Reality Engine**. Instead of acting as a passive database, Korda acts as an ultra-fast middleware router that intercepts an agent's prompt, instantly queries your massive **Cognee Cloud** brain, mathematically calculates "Reality Drift", and surgically injects guardrails based on actual graph topology.

### The Korda 2.0 Pipelines:
1. **Topological Session Isolation (Dual-Tier Memory):** Instead of one messy global bucket, Korda wraps `cognee.remember(..., session_id=agent_id)`. Multiple agents have their own subjective, isolated experiences mapped in the cloud.
2. **The Reality Alignment Scorer:** Korda actively diffs an agent's subjective sub-graph against the Canonical Graph using dual-concurrent `cognee.recall()` queries to mathematically calculate their divergence.
3. **The Reconciliation Pipeline:** We actively heal the graph using `cognee.remember()` (Canonical Truth) and surgically purge the agent's contaminated memory using `cognee.forget()`.

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
      │  COGNEE CLOUD TENANT  │ ◄── (14M Prepaid Tokens handled natively)
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
By migrating Korda natively to Cognee Cloud, we resolved the local database locking and concurrency crashing issues found in standard SQLite implementations. Korda can safely execute high-concurrency graph diffing and memory pruning across dozens of active agents without breaking a sweat.

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