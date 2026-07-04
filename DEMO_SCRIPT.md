# Korda — Demo Script

> Target length: 2–3 minutes. Speak naturally. Keep it confident but honest.

---

## Opening (15 seconds)

> "Korda is a shared reality engine for AI agents. When multiple agents are working on the same project, they can silently drift into different versions of the truth — and nobody notices until something breaks. Korda catches that drift before it causes damage."

## The Problem (20 seconds)

Open the **landing page**.

> "Here's the core issue. If two agents share a project but one is working from a stale context window, standard vector search can't tell the difference — the semantic overlap between old and new is nearly identical. Korda solves this by comparing canonical project truth against what each agent actually believes, using Cognee Cloud as the shared memory layer."

## Live Workflow (90 seconds)

Navigate to the **demo page**.

### 1. Backend Status

> "First, let's confirm the backend is live and connected to Cognee Cloud."

Click **Check backend health**. Show the green status.

### 2. Ingest Canonical Truth

> "Now we record the team's agreed truth — in this case, that the project has moved to an approval-first rollout process."

Click **Ingest canonical truth**. Show the receipt.

### 3. Ingest Agent Belief

> "But Agent B is still working from an older project brief. It believes the old rollout path is active."

Click **Ingest agent belief**. Show the receipt.

### 4. Align — Detect Drift

> "Korda runs dual-concurrent recall against both sessions and scores the divergence."

Click **Run alignment**. Point out:
- The alignment score (expect it to be below 80%).
- The divergence point / split point.

> "The agent has drifted. Korda caught it."

### 5. Intercept — Harden the Prompt

> "If this agent tries to use the stale context in a prompt, Korda intercepts it."

Click **Intercept prompt**. Show:
- The original prompt referencing the cached rollout plan.
- The hardened prompt with the guardrail injected.

> "The correction is injected before the prompt reaches the model. No hallucination reaches production."

### 6. Reconcile

> "Now we reconcile. Korda updates canonical truth with the consensus and corrects the agent's session memory."

Click **Reconcile**. Show the reconciliation receipt and the method used (forget or corrective stale mark).

### 7. Verify Recall

> "Finally, we re-run alignment to verify the agent's recall is healthy."

Click **Verify recall**. Show the alignment score returning to a healthy range.

## Evidence and Summary (20 seconds)

> "Every step generates a receipt with the exact endpoint, status code, and timestamp. You can expand the Run Evidence panel to see the full audit trail."

Open the **Run Evidence** panel. Scroll through receipts.

> "And the full run summary is available with one click."

Click **Copy run summary**. Mention it captures all scores, session IDs, and corrections.

## SDK (15 seconds)

> "For developers who want to integrate Korda into their own agent workflows, there's a TypeScript SDK."

Navigate to the **SDK page** (or mention the `/sdk` route).

> "It wraps the same endpoints the frontend uses — `align`, `intercept`, `reconcile`, `protectPrompt` — so you can drop Korda into any agent pipeline with a few lines of code."

## Close (10 seconds)

> "Korda is a working prototype. It's session-scoped today, not yet continuous monitoring. But the core loop — compare, intercept, reconcile, verify — is live and hitting real Cognee Cloud infrastructure right now. Thanks."
