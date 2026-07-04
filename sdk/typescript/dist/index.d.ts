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
    context_type?: string;
    old_node_id: string;
    old_description?: string;
    new_node_id: string;
    new_description?: string;
    update_reason?: string;
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
    canonical_session_id?: string;
    consensus_node_id: string;
    supersedes_node_id?: string;
    purge_node_id?: string;
    context_type?: string;
    reconciled_context: string;
    resolution_reason?: string;
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
export declare class KordaError extends Error {
    readonly statusCode?: number;
    readonly endpoint: string;
    readonly backendUrl: string;
    readonly body: unknown;
    constructor(message: string, meta: KordaRequestMeta & {
        body?: unknown;
    });
}
export declare class KordaClient {
    private readonly baseUrl;
    private readonly fetchImpl;
    private readonly headers;
    constructor(options: KordaClientOptions);
    health(): Promise<HealthResponse>;
    rememberDecision(payload: DecisionUpdate): Promise<JsonObject>;
    align(agentSessionId: string, query: string, options?: {
        canonicalSessionId?: string;
        divergenceThreshold?: number;
    }): Promise<AlignmentResponse>;
    intercept(prompt: string, agentSessionId?: string, canonicalSessionId?: string): Promise<InterceptResponse>;
    reconcile(payload: ReconcilePayload): Promise<ReconcileResponse>;
    protectPrompt(prompt: string, agentSessionId?: string, canonicalSessionId?: string): Promise<string>;
    private request;
}
//# sourceMappingURL=index.d.ts.map