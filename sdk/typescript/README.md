# @korda/sdk

TypeScript SDK for Korda, a shared reality engine for AI agents.

Korda helps agent workflows compare agent belief against canonical project truth, detect belief drift, harden stale prompts before execution, reconcile agreed truth, and verify recall after repair.

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

## Quick Start

```ts
import { KordaClient } from "@korda/sdk";

const korda = new KordaClient({
  baseUrl: process.env.KORDA_BACKEND_URL!,
});

const correction = await korda.intercept(
  "Draft the launch steps from the cached rollout plan.",
);

const promptForModel = correction.hardened_prompt ?? correction.original_prompt;
```

## Use Korda Before Agent Action

```ts
async function runAgent(prompt: string) {
  const protectedPrompt = await korda.protectPrompt(prompt);
  return model.generate(protectedPrompt);
}
```

## Remember Project Truth

```ts
await korda.rememberDecision({
  session_id: "global",
  context_type: "Launch Coordination",
  old_node_id: "old rollout path",
  old_description: "The old rollout path is stale.",
  new_node_id: "approved release gate",
  new_description: "The approved release gate is canonical.",
  update_reason: "The team moved to approval-first rollout.",
});
```

## Compare Agent Belief

```ts
const alignment = await korda.align(
  "agent_b",
  "What is the active launch rule?",
);

if (alignment.status === "diverged") {
  console.log("Belief drift detected:", alignment.split_point);
}
```

## Reconcile Truth

```ts
await korda.reconcile({
  agent_session_id: "agent_b",
  canonical_session_id: "global",
  consensus_node_id: "approved release gate",
  supersedes_node_id: "old rollout path",
  purge_node_id: "old rollout path",
  reconciled_context:
    "The approved release gate is canonical. New work should hold for the current launch rule.",
  resolution_reason: "Reconciliation confirmed the old rollout path is stale.",
});
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
- A running Korda backend URL.
- Backend Cognee credentials configured server-side.

The SDK does not talk directly to Cognee Cloud. It calls your Korda backend, which owns session memory, drift scoring, prompt correction, reconciliation, and recall verification.
