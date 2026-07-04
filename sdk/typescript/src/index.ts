export type JsonObject = Record<string, unknown>;

export type KordaClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  headers?: HeadersInit;
};

export type KordaRequestMeta = {
  endpoint: string;
  statusCode: number;
  backendUrl: string;
};

export type DecisionUpdate = {
  type?: "decision_update" | "api_update";
  session_id: string;
  context_type?: string | undefined;
  old_node_id: string;
  old_description?: string | undefined;
  new_node_id: string;
  new_description?: string | undefined;
  update_reason?: string | undefined;
};

export type AlignmentResponse = JsonObject & {
  ok?: boolean;
  status: "aligned" | "diverged" | string;
  alignment_score?: number;
  divergence_detected?: boolean;
  split_point?: string | null;
  divergence_point?: string | null;
  agent_session_id?: string;
  canonical_session_id?: string;
  summary?: string;
};

export type InterceptResponse = JsonObject & {
  ok?: boolean;
  status: "intercepted" | "clear" | string;
  original_prompt?: string;
  hardened_prompt?: string;
  correction?: string | null;
  detected_drift?: boolean;
  summary?: string;
};

export type ReconcilePayload = {
  agent_session_id: string;
  canonical_session_id?: string | undefined;
  consensus_node_id: string;
  supersedes_node_id?: string | undefined;
  purge_node_id?: string | undefined;
  context_type?: string | undefined;
  reconciled_context: string;
  resolution_reason?: string | undefined;
};

export type ReconcileResponse = JsonObject & {
  ok?: boolean;
  status: "reconciled" | string;
  reconciled?: boolean;
  method?: string;
  correction_recorded?: boolean;
  recall_verified?: boolean | null;
  agent_session_id?: string;
  canonical_session_id?: string;
  summary?: string;
};

export type HealthResponse = JsonObject & {
  status?: string;
  cognee_service_url_loaded?: boolean;
  cognee_api_key_loaded?: boolean;
  reality_dataset?: string;
  canonical_session_id?: string;
};

export class KordaError extends Error {
  readonly statusCode?: number;
  readonly endpoint: string;
  readonly backendUrl: string;
  readonly body: unknown;

  constructor(message: string, meta: KordaRequestMeta & { body?: unknown }) {
    super(message);
    this.name = "KordaError";
    this.statusCode = meta.statusCode;
    this.endpoint = meta.endpoint;
    this.backendUrl = meta.backendUrl;
    this.body = meta.body;
  }
}

export class KordaClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: HeadersInit | undefined;

  constructor(options: KordaClientOptions) {
    if (!options.baseUrl) {
      throw new Error("KordaClient requires a baseUrl.");
    }

    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.headers = options.headers;
  }

  health(): Promise<HealthResponse> {
    return this.request<HealthResponse>("GET", "/health");
  }

  rememberDecision(payload: DecisionUpdate): Promise<JsonObject> {
    return this.request<JsonObject>("POST", "/webhook/stream", {
      type: payload.type ?? "decision_update",
      ...payload,
    });
  }

  align(
    agentSessionId: string,
    query: string,
    options: { canonicalSessionId?: string | undefined; divergenceThreshold?: number | undefined } = {},
  ): Promise<AlignmentResponse> {
    return this.request<AlignmentResponse>("POST", "/api/v1/align", {
      agent_session_id: agentSessionId,
      canonical_session_id: options.canonicalSessionId ?? "global",
      query,
      ...(options.divergenceThreshold === undefined
        ? {}
        : { divergence_threshold: options.divergenceThreshold }),
    });
  }

  intercept(prompt: string, agentSessionId?: string, canonicalSessionId?: string): Promise<InterceptResponse> {
    return this.request<InterceptResponse>("POST", "/api/v1/intercept", { 
      prompt,
      ...(agentSessionId ? { agent_session_id: agentSessionId } : {}),
      ...(canonicalSessionId ? { canonical_session_id: canonicalSessionId } : {})
    });
  }

  reconcile(payload: ReconcilePayload): Promise<ReconcileResponse> {
    return this.request<ReconcileResponse>("POST", "/api/v1/reconcile", payload);
  }

  async protectPrompt(prompt: string, agentSessionId?: string, canonicalSessionId?: string): Promise<string> {
    const correction = await this.intercept(prompt, agentSessionId, canonicalSessionId);
    return correction.hardened_prompt || prompt;
  }

  private async request<T extends JsonObject>(
    method: "GET" | "POST",
    path: string,
    payload?: JsonObject,
  ): Promise<T> {
    const endpoint = `${method} ${path}`;
    const init: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.headers ?? {}),
      },
    };
    if (payload !== undefined) {
      init.body = JSON.stringify(payload);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, init);

    const body = await parseResponseBody(response);
    if (!response.ok) {
      const message = getErrorMessage(body) || `Korda request failed with HTTP ${response.status}.`;
      throw new KordaError(message, {
        endpoint,
        statusCode: response.status,
        backendUrl: this.baseUrl,
        body,
      });
    }

    return body as T;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const value = (body as JsonObject).detail ?? (body as JsonObject).message;
  return typeof value === "string" ? value : null;
}
