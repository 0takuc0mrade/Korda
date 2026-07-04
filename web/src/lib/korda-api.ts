export const API_BASE = process.env.NEXT_PUBLIC_KORDA_API_URL ?? "http://localhost:8000";

export type KordaApiResult = {
  ok: true;
  endpoint: string;
  backendUrl: string;
  statusCode: number;
  timestamp: string;
  body: Record<string, unknown>;
};

export type BackendErrorDetails = {
  endpoint: string;
  backendUrl: string;
  statusCode?: number;
  message: string;
  likelyFixes: string[];
};

export class BackendRequestError extends Error {
  details: BackendErrorDetails;

  constructor(details: BackendErrorDetails) {
    super(details.message);
    this.name = "BackendRequestError";
    this.details = details;
  }
}

const likelyFixes = [
  "Check that the backend is running and reachable.",
  "Check NEXT_PUBLIC_KORDA_API_URL in the frontend environment.",
  "Check backend CORS settings.",
  "Check Cognee credentials on the backend.",
];

async function parseBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

async function request(path: string, options: RequestInit = {}): Promise<KordaApiResult> {
  const backendUrl = API_BASE;
  const endpoint = `${options.method ?? "GET"} ${path}`;

  try {
    const response = await fetch(`${backendUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const body = await parseBody(response);

    if (!response.ok) {
      const detail = body.detail || body.message || response.statusText;
      throw new BackendRequestError({
        endpoint,
        backendUrl,
        statusCode: response.status,
        message: String(detail || "Backend request failed."),
        likelyFixes,
      });
    }

    return {
      ok: true,
      endpoint,
      backendUrl,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      body,
    };
  } catch (error) {
    if (error instanceof BackendRequestError) {
      throw error;
    }

    throw new BackendRequestError({
      endpoint,
      backendUrl,
      message: error instanceof Error ? error.message : "Backend is unavailable.",
      likelyFixes,
    });
  }
}

function post(path: string, payload: Record<string, unknown>): Promise<KordaApiResult> {
  return request(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const canonicalTruthPayload = {
  type: "decision_update",
  session_id: "global",
  context_type: "Launch Coordination",
  old_node_id: "old rollout path",
  old_description: "The old rollout path is stale. New work must wait for the approved release gate.",
  new_node_id: "approved release gate",
  new_description: "The approved release gate is active. New work must follow the current launch rule.",
  update_reason: "The team moved from fast-path launch to approval-first rollout.",
};

export const divergentAgentPayload = {
  type: "decision_update",
  session_id: "agent_b",
  context_type: "Launch Coordination",
  old_node_id: "approved release gate",
  old_description: "The approved release gate is missing from the agent cache.",
  new_node_id: "old rollout path",
  new_description: "The old rollout path is still active in stale agent memory.",
  update_reason: "Agent B continued from an older project brief.",
};

export const stalePromptPayload = {
  prompt: "Draft the launch steps from the cached rollout plan.",
  agent_session_id: "agent_b",
  canonical_session_id: "global",
};

export const alignPayload = {
  canonical_session_id: "global",
  agent_session_id: "agent_b",
  query: "What is the active launch rule, and should the agent use the cached rollout plan?",
  divergence_threshold: 80,
};

export const reconcilePayload = {
  agent_session_id: "agent_b",
  canonical_session_id: "global",
  consensus_node_id: "approved release gate",
  supersedes_node_id: "old rollout path",
  purge_node_id: "old rollout path",
  context_type: "Launch Coordination",
  reconciled_context: "The approved release gate is canonical. New work should hold for the current launch rule instead of the cached rollout plan.",
  resolution_reason: "Reconciliation confirmed the old rollout path is stale.",
};

export type CustomWorkflowInputs = {
  canonicalTruth: string;
  agentBelief: string;
  stalePrompt: string;
  contextType: string;
};

export const exampleInputs: CustomWorkflowInputs = {
  canonicalTruth: "The approved release gate is active. New work must follow the current launch rule.",
  agentBelief: "The old rollout path is still active. Ship through the fast-path launch.",
  stalePrompt: "Draft the launch steps from the cached rollout plan.",
  contextType: "Launch Coordination",
};

function slugify(text: string): string {
  return text.slice(0, 48).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "node";
}

export function buildCustomPayloads(inputs: CustomWorkflowInputs) {
  const canonicalSlug = slugify(inputs.canonicalTruth);
  const agentSlug = slugify(inputs.agentBelief);
  const sessionId = `agent_${Date.now().toString(36)}`;

  const canonical = {
    type: "decision_update",
    session_id: "global",
    context_type: inputs.contextType || "Custom Workflow",
    old_node_id: agentSlug,
    old_description: `${inputs.agentBelief} (marked stale — canonical truth has changed)`,
    new_node_id: canonicalSlug,
    new_description: inputs.canonicalTruth,
    update_reason: "Canonical truth was updated by the user.",
  };

  const divergent = {
    type: "decision_update",
    session_id: sessionId,
    context_type: inputs.contextType || "Custom Workflow",
    old_node_id: canonicalSlug,
    old_description: `${inputs.canonicalTruth} (missing from agent cache)`,
    new_node_id: agentSlug,
    new_description: inputs.agentBelief,
    update_reason: "Agent continued from an older project belief.",
  };

  const align = {
    canonical_session_id: "global",
    agent_session_id: sessionId,
    query: `Compare: canonical says "${inputs.canonicalTruth}" vs agent believes "${inputs.agentBelief}"`,
    divergence_threshold: 80,
  };

  const intercept = {
    prompt: inputs.stalePrompt,
    agent_session_id: sessionId,
    canonical_session_id: "global",
  };

  const reconcile = {
    agent_session_id: sessionId,
    canonical_session_id: "global",
    consensus_node_id: canonicalSlug,
    supersedes_node_id: agentSlug,
    purge_node_id: agentSlug,
    context_type: inputs.contextType || "Custom Workflow",
    reconciled_context: inputs.canonicalTruth,
    resolution_reason: `Agent belief '${agentSlug}' was confirmed stale after reconciliation.`,
  };

  return { canonical, divergent, align, intercept, reconcile, sessionId };
}

export function buildCustomApi(inputs: CustomWorkflowInputs) {
  const payloads = buildCustomPayloads(inputs);
  return {
    health: () => request("/health"),
    ingestCanonical: () => post("/webhook/stream", payloads.canonical),
    ingestDivergent: () => post("/webhook/stream", payloads.divergent),
    alignBefore: () => post("/api/v1/align", payloads.align),
    intercept: () => post("/api/v1/intercept", payloads.intercept),
    reconcile: () => post("/api/v1/reconcile", payloads.reconcile),
    alignAfter: () => post("/api/v1/align", payloads.align),
    payloads,
  };
}

export const kordaApi = {
  health: () => request("/health"),
  ingestCanonical: () => post("/webhook/stream", canonicalTruthPayload),
  ingestDivergent: () => post("/webhook/stream", divergentAgentPayload),
  alignBefore: () => post("/api/v1/align", alignPayload),
  intercept: () => post("/api/v1/intercept", stalePromptPayload),
  reconcile: () => post("/api/v1/reconcile", reconcilePayload),
  alignAfter: () => post("/api/v1/align", alignPayload),
};
