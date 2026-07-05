# @korda/sdk

TypeScript SDK for Korda, a shared reality engine for AI agents.

Korda helps agent workflows compare agent belief against canonical project truth, detect belief drift, harden stale prompts before execution, reconcile agreed truth, and verify recall after repair.

## Why Korda?

AI agents hallucinate when their context goes stale. In multi-agent systems, this gets worse — one agent updates the project truth, but other agents keep working from outdated beliefs. The result: incompatible code, wrong decisions, and broken workflows.

**Korda is middleware that sits between your agents and the LLM.** It detects when an agent's beliefs have drifted from the team's current truth and rewrites the prompt before the LLM ever sees it.

You don't build drift detection. You don't build reconciliation logic. You call `protectPrompt()` and Korda handles the rest.

## Install

```bash
npm install @korda/sdk
```

For local development in this repository:

```bash
cd sdk/typescript
npm install
npm run build
```

## Quick Start — One Line of Protection

The simplest integration: wrap every LLM call with `protectPrompt()`.

```ts
import { KordaClient } from "@korda/sdk";

const korda = new KordaClient({
  baseUrl: process.env.KORDA_BACKEND_URL!,
  // or: baseUrl: "https://korda.onrender.com"
});

async function runAgent(prompt: string) {
  // Korda checks the prompt against canonical truth and hardens it if stale
  const safePrompt = await korda.protectPrompt(prompt);
  return model.generate(safePrompt);
}
```

If the prompt references stale context, Korda rewrites it. If it's clean, it passes through unchanged. Your agent doesn't know Korda is there.

## Full Integration — Detect, Intercept, Reconcile

For teams that want full control over the drift lifecycle:

```ts
import { KordaClient } from "@korda/sdk";

const korda = new KordaClient({ baseUrl: "https://korda.onrender.com" });

// 1. Record a project decision (e.g. a human or lead agent updates the truth)
await korda.rememberDecision({
  session_id: "global",
  context_type: "Infrastructure",
  old_node_id: "mysql_57",
  old_description: "MySQL 5.7 with mysql2 driver (deprecated)",
  new_node_id: "postgres_16",
  new_description: "PostgreSQL 16 with pg driver. MySQL is decommissioned.",
  update_reason: "Database migration completed.",
});

// 2. Check if an agent's beliefs have drifted
const alignment = await korda.align(
  "agent_b",
  "What database does the project use?",
  { canonicalSessionId: "global" }
);

if (alignment.divergence_detected) {
  console.log(`Drift detected: ${alignment.alignment_score}% aligned`);
  console.log(`Split point: ${alignment.split_point}`);

  // 3. Intercept a stale prompt before it reaches the LLM
  const interception = await korda.intercept(
    "Write a database connection snippet for our project.",
    "agent_b",    // agent session with stale beliefs
    "global"      // canonical session with current truth
  );

  if (interception.detected_drift) {
    console.log("Stale prompt intercepted.");
    console.log("Correction:", interception.correction);
    // Use interception.hardened_prompt instead of the original
  }

  // 4. Reconcile the agent's memory with canonical truth
  await korda.reconcile({
    agent_session_id: "agent_b",
    canonical_session_id: "global",
    consensus_node_id: "postgres_16",
    supersedes_node_id: "mysql_57",
    purge_node_id: "mysql_57",
    context_type: "Infrastructure",
    reconciled_context: "PostgreSQL 16 with pg driver. MySQL is decommissioned.",
    resolution_reason: "mysql_57 confirmed stale after drift detection.",
  });

  // 5. Verify the agent is now aligned
  const recall = await korda.align("agent_b", "What database?", {
    canonicalSessionId: "global",
  });
  console.log(`After repair: ${recall.alignment_score}% aligned`);
}
```

## API Reference

### `new KordaClient(options)`

| Option | Type | Required | Description |
|---|---|---|---|
| `baseUrl` | `string` | ✅ | URL of the Korda backend |
| `fetchImpl` | `typeof fetch` | | Custom fetch implementation (for Node 16 or test mocks) |
| `headers` | `HeadersInit` | | Additional headers for every request |

### `korda.health()`

Check backend connectivity and Cognee status.

### `korda.rememberDecision(payload)`

Record a project truth change. This is how canonical context enters the system.

### `korda.align(agentSessionId, query, options?)`

Compare an agent's beliefs against canonical truth. Returns an alignment score and whether divergence was detected.

| Option | Type | Default | Description |
|---|---|---|---|
| `canonicalSessionId` | `string` | `"global"` | Session holding canonical truth |
| `divergenceThreshold` | `number` | `80` | Score below which divergence is flagged |

### `korda.intercept(prompt, agentSessionId?, canonicalSessionId?)`

Analyze a prompt for stale context. If drift is detected, returns a `hardened_prompt` with the correction injected. Pass session IDs for scenario-specific corrections.

### `korda.protectPrompt(prompt, agentSessionId?, canonicalSessionId?)`

Convenience wrapper — returns the hardened prompt string directly, or the original if no drift is found.

### `korda.reconcile(payload)`

Reconcile an agent's memory with canonical truth. Purges stale beliefs and injects the consensus state.

## When to Use Korda

### Multi-agent codegen pipelines
Agent A refactored auth to OAuth2, but Agent B is still generating session-cookie middleware. Korda intercepts Agent B's prompt and injects the correct auth pattern.

### Long-running autonomous agents
An agent has been running for hours. The team deprecated an API endpoint, but the agent's context window still references it. Korda catches the stale belief without restarting the agent.

### DevOps / Infrastructure-as-Code
An AI agent writes Terraform configs. The team moved from EC2 to EKS last week. Korda intercepts the Terraform prompt: *"EC2 is deprecated. Use EKS."*

### Customer support agent fleets
You changed the refund policy yesterday. 50 support agents are still quoting the old policy. One `rememberDecision` call updates the truth — every agent's next prompt is automatically corrected.

### RAG pipelines with stale embeddings
Your vector store has outdated chunks. Korda sits *after* retrieval — even if the retrieved context is stale, Korda's alignment check catches the conflict before the LLM sees it.

### Regulated industries
An AI assistant drafts compliance documents. A regulation changed, but the knowledge base hasn't been re-indexed. Korda provides an auditable interception trail proving every prompt was checked against current truth.

## CLI

The SDK ships with a `korda` command-line tool. Install globally to use it anywhere:

```bash
npm install -g @korda/sdk
```

### Commands

| Command | Description |
|---|---|
| `korda health` | Check backend and Cognee connectivity |
| `korda align <agent_session>` | Check if an agent has drifted from canonical truth |
| `korda intercept "<prompt>"` | Test if a prompt would be intercepted |
| `korda protect "<prompt>"` | Return the hardened prompt (pipe-friendly, no decoration) |
| `korda remember --old-node X --new-node Y --new-desc "..."` | Record a project truth change |
| `korda reconcile <agent> --consensus <node> --context "..."` | Reconcile agent memory with truth |

### Global Options

| Flag | Description |
|---|---|
| `--backend <url>` | Korda backend URL (default: `$KORDA_BACKEND_URL` or `https://korda.onrender.com`) |

### Examples

```bash
# Quick health check
korda health --backend https://korda.onrender.com

# Check if an agent is drifted
korda align agent_b --query "What database do we use?"

# CI/CD gate: fail the build if alignment drops below 80%
korda align agent_b --fail-below 80

# Test if a prompt would be intercepted
korda intercept "Write a MySQL connection snippet"

# Get the hardened prompt for piping into another tool
korda protect "Deploy via SSH to prod" | pbcopy

# Record a truth change
korda remember --old-node mysql_57 --new-node postgres_16 --new-desc "Migrated to PostgreSQL 16"

# Reconcile an agent's memory
korda reconcile agent_b --consensus postgres_16 --context "PostgreSQL 16 is canonical"
```

## Publishing

Before publishing:

1. Confirm the package name and npm scope are available.
2. Update `version` in `package.json`.
3. Run `npm install`.
4. Run `npm run build`.
5. Run `npm pack --dry-run`.
6. Publish:

```bash
npm publish --access public
```

If the `@korda` npm scope is not available to your npm account, rename the package before publishing.

## Runtime Requirements

- Node.js 18+ or any runtime with `fetch`.
- A running Korda backend. The public deployment is at `https://korda.onrender.com`.
- Backend Cognee credentials configured server-side.

The SDK does not talk directly to Cognee Cloud. It calls your Korda backend, which owns session memory, drift scoring, prompt correction, reconciliation, and recall verification.
