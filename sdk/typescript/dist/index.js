export class KordaError extends Error {
    statusCode;
    endpoint;
    backendUrl;
    body;
    constructor(message, meta) {
        super(message);
        this.name = "KordaError";
        this.statusCode = meta.statusCode;
        this.endpoint = meta.endpoint;
        this.backendUrl = meta.backendUrl;
        this.body = meta.body;
    }
}
export class KordaClient {
    baseUrl;
    fetchImpl;
    headers;
    constructor(options) {
        if (!options.baseUrl) {
            throw new Error("KordaClient requires a baseUrl.");
        }
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.fetchImpl = options.fetchImpl ?? fetch;
        this.headers = options.headers;
    }
    health() {
        return this.request("GET", "/health");
    }
    rememberDecision(payload) {
        return this.request("POST", "/webhook/stream", {
            type: payload.type ?? "decision_update",
            ...payload,
        });
    }
    align(agentSessionId, query, options = {}) {
        return this.request("POST", "/api/v1/align", {
            agent_session_id: agentSessionId,
            canonical_session_id: options.canonicalSessionId ?? "global",
            query,
            ...(options.divergenceThreshold === undefined
                ? {}
                : { divergence_threshold: options.divergenceThreshold }),
        });
    }
    intercept(prompt, agentSessionId, canonicalSessionId) {
        return this.request("POST", "/api/v1/intercept", {
            prompt,
            ...(agentSessionId ? { agent_session_id: agentSessionId } : {}),
            ...(canonicalSessionId ? { canonical_session_id: canonicalSessionId } : {})
        });
    }
    reconcile(payload) {
        return this.request("POST", "/api/v1/reconcile", payload);
    }
    async protectPrompt(prompt, agentSessionId, canonicalSessionId) {
        const correction = await this.intercept(prompt, agentSessionId, canonicalSessionId);
        return correction.hardened_prompt || prompt;
    }
    async request(method, path, payload) {
        const endpoint = `${method} ${path}`;
        const init = {
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
        return body;
    }
}
async function parseResponseBody(response) {
    const text = await response.text();
    if (!text)
        return {};
    try {
        return JSON.parse(text);
    }
    catch {
        return { message: text };
    }
}
function getErrorMessage(body) {
    if (!body || typeof body !== "object")
        return null;
    const value = body.detail ?? body.message;
    return typeof value === "string" ? value : null;
}
//# sourceMappingURL=index.js.map