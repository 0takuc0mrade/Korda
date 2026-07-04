# Korda — TypeScript SDK

The Korda TypeScript SDK wraps the Korda backend API so you can integrate belief drift detection, prompt hardening, and reconciliation into any agent workflow.

**Package path:** `sdk/typescript`
**Package name:** `@korda/sdk`
**Version:** `0.1.0`

> **Note:** Publishing to npm requires access to the `@korda` npm scope. If the scope is unavailable to your npm account, rename the package in `package.json` before publishing (e.g. `korda-sdk` or `@your-scope/korda-sdk`).

## Install

```bash
npm install @korda/sdk
```

For local development:

```bash
cd sdk/typescript
npm install
npm run build
```

## Quick Start

```ts
import { KordaClient } from "@korda/sdk";

const korda = new KordaClient({
  baseUrl: "https://korda.onrender.com",
});

// Check backend health
const status = await korda.health();

// Protect a prompt before sending to the model
const safePrompt = await korda.protectPrompt(
  "Draft the launch steps from the cached rollout plan."
);
```

## Methods

### `health()`

Check backend status and Cognee Cloud connection.

```ts
const status = await korda.health();
// { status: "ok", cognee_service_url_loaded: true, ... }
```

### `rememberDecision(payload)`

Ingest a project state change into Cognee Cloud memory.

```ts
await korda.rememberDecision({
  session_id: "global",
  context_type: "Launch Coordination",
  old_node_id: "old rollout path",
  old_description: "The old rollout path is stale.",
  new_node_id: "approved release gate",
  new_description: "The approved release gate is canonical.",
  update_reason: "Team moved to approval-first rollout.",
});
```

### `align(agentSessionId, query, options?)`

Compare agent belief against canonical truth and get a divergence score.

```ts
const result = await korda.align(
  "agent_b",
  "What is the active launch rule?",
  { canonicalSessionId: "global", divergenceThreshold: 80 }
);

if (result.divergence_detected) {
  console.log("Drift detected at:", result.split_point);
  console.log("Alignment score:", result.alignment_score);
}
```

### `intercept(prompt)`

Send a prompt for drift analysis. Returns the original and hardened prompt.

```ts
const result = await korda.intercept(
  "Draft the launch steps from the cached rollout plan."
);

if (result.detected_drift) {
  console.log("Hardened prompt:", result.hardened_prompt);
}
```

### `protectPrompt(prompt)`

Convenience method — intercepts and returns the hardened prompt (or the original if no drift detected).

```ts
const safePrompt = await korda.protectPrompt(userPrompt);
const response = await model.generate(safePrompt);
```

### `reconcile(payload)`

Update canonical truth and correct the agent's session memory.

```ts
await korda.reconcile({
  agent_session_id: "agent_b",
  canonical_session_id: "global",
  consensus_node_id: "approved release gate",
  supersedes_node_id: "old rollout path",
  purge_node_id: "old rollout path",
  reconciled_context: "The approved release gate is canonical.",
  resolution_reason: "Old rollout path confirmed stale.",
});
```

## Build and Publish

```bash
cd sdk/typescript

# Install dependencies
npm install

# Build TypeScript
npm run build

# Preview package contents
npm pack --dry-run --ignore-scripts

# Publish (only if @korda scope is available)
npm publish --access public
```

Do not publish automatically — confirm scope availability first.

## Runtime Requirements

- Node.js 18+ or any runtime with a global `fetch`.
- A running Korda backend URL.
- Backend Cognee credentials are configured server-side; the SDK does not talk to Cognee Cloud directly.

## Error Handling

The SDK throws `KordaError` for non-2xx responses:

```ts
import { KordaClient, KordaError } from "@korda/sdk";

try {
  await korda.align("agent_b", "query");
} catch (err) {
  if (err instanceof KordaError) {
    console.error(err.statusCode, err.endpoint, err.body);
  }
}
```
