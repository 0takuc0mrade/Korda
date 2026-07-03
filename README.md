# Korda: Proactive Context Interception for Autonomous Agents

> *"When multiple agents need to share state, using per-agent context or per-session embeddings creates fragmentation. Each agent operates on a different slice of truth."* 
> — Cognee Official Documentation

If an AI agent queries a standard vector database for "API documentation," it will likely pull up deprecated version 1 docs because the textual semantic overlap is 95% identical to version 2. Vectors are notoriously terrible at handling temporal state changes (old vs. new).

**Alerting a human that an AI agent hallucinated stale code is a failure. Preventing the hallucination before the LLM prompt executes is the solution.**

Korda isn't trying to reinvent the AI agent. We built Korda because current AI infrastructure has a fatal flaw: **Agents cannot handle temporal state changes.** 

When documentation or components update, vector databases fail because the old and new text look semantically identical. Korda solves this not by guessing with fuzzy vector text search, but by using Cognee to map and traverse deterministic structural states.

## 🟢 What Korda CAN Do (The Hard Engineering Reality)

* **Deterministic State Resolution:** Instead of relying on fuzzy vector similarity (which gets confused when v1 and v2 documents look 95% identical), Korda maps explicit `status="stale"` properties to unique node IDs inside the Cognee graph.
* **Zero-Semantic Edge Traversal:** When an agent attempts to compile code, Korda physically walks the graph from the target `SoftwareComponent` to its dependencies. If an edge hits a stale attribute, it triggers an instant interception.
* **Granular Context Slicing:** It reduces LLM costs by injecting only the specific mutating node properties that changed, completely bypassing the expensive need to re-feed or re-vectorize an entire codebase or rulebook.

## 🔴 What Korda CANNOT Do (Protecting the Architecture)

* **It Cannot Fall Back on Vector Guessing:** If an asset or version is unmapped or lacks an explicit topological relation in the Cognee graph, Korda will intentionally fail closed rather than hallucinating or making an "educated semantic guess."

## Architecture: Cognee as the Core Engine

In a generic hackathon project, Cognee is an "add-on" wrapper. In Korda, **Cognee is the entire infrastructure.** Without Cognee's hybrid graph-vector mapping, this system physically cannot execute.

```text
       [ External Chat / Repo Updates ]
                  │
                  ▼
         [ Korda Ingestion ]
                  │
                  ▼
      ┌───────────────────────┐
      │   COGNEE CORE ENGINE  │
      │                       │
      │  .remember(Ontology)  │ ──► Maps explicit temporal status (active vs stale)
      │                       │
      │  .cognify()           │ ──► Links cross-session dependencies natively
      │                       │
      │  .recall(node_name)   │ ──► Traverses the graph to intercept agent context requests
      └───────────────────────┘
                  │
                  ▼
  [ Korda Context Interceptor ] 
  (Injects Guardrail into Agent Prompt)
                  │
                  ▼
         [ LLM Gateway ]
```

To flawlessly handle real-time environments without locking the underlying Kuzu files, Korda wraps this Core Engine in an isolated `asyncio.Queue` worker.
- **Isolated Ingestion Traffic:** Guarantees immediate HTTP 200 OK responses to source integrations (preventing GitHub/Slack timeouts).
- **Sequential Graph Finalization:** Throttles `cognee.remember()` and `cognee.cognify()` sequentially in the background.
- **Continuous Improvement:** Nightly cron jobs execute `cognee.improve()` to continuously heal and prune stale nodes.

## Live Verification & Demo

To prove the proactive interception engine live for the judges:

1. **Boot the Backend Constraint Layer:**
```bash
cd backend
python3 app.py
```

2. **Trigger the Interceptor Test Suite:**
We provide a local script simulating a LangGraph agent attempting to generate code for a deprecated `v1` endpoint, and Korda physically modifying its prompt to correct it.
```bash
cd backend
python3 test_interceptor.py
```

3. **The Exact Result:**
Korda maps the divergence and outputs a hardened, corrected prompt for the agent to execute safely.