# Korda — Limitations

Korda is a **working prototype** — a **demoable MVP** for session-scoped memory alignment between AI agents and canonical project truth.

## What Korda Is

- A session-scoped shared reality engine that compares agent belief against canonical truth.
- A prompt interceptor that hardens stale context before it reaches the model.
- A reconciliation layer with fallback via cognify repair / stale correction when direct forget is unavailable.
- A working six-step interactive workflow running against live Cognee Cloud infrastructure.

## What Korda Is Not

Korda does **not** claim to be:

- **Production-ready.** It is a working prototype suitable for demonstration.
- **A continuous agent monitor.** It does not watch all live agents continuously. Alignment is run on demand, scoped to a session.
- **A complete graph cleanup tool.** Direct deletion only works when Korda has a real data ID/UUID from the ingestion process. Without a UUID, Korda writes a corrective stale mark instead.
- **A perfect memory eraser.** It does not fully delete contaminated memory from arbitrary graph locations — it operates on session-scoped data items it has tracked.
- **A multiplayer truth engine at scale.** Session isolation is in-process; horizontal scaling would require external session storage.

## Technical Caveats

| Area | Detail |
| --- | --- |
| `improve()` endpoint | May be unavailable on the current Cognee Cloud tenant/API. Korda detects the 404 and falls back to `cognify_repair` (re-indexing via `cognify()`). |
| `forget()` scope | Cognee's `forget()` deletes by data UUID. If Korda did not observe the original ingestion (e.g. the data was ingested before this backend process started), it cannot directly delete and instead records a session-scoped stale correction. |
| Session memory | Session isolation (`session_id`) is maintained in-process. Restarting the backend clears the in-memory session index (Cognee Cloud data persists). |
| Backend test coverage | Unit tests cover graph diffing and interceptor logic. `pytest` is not installed; tests run via `python -m unittest`. |

## Language Guide

When describing Korda externally, use:

✅ "demoable MVP"
✅ "working prototype"
✅ "session-scoped memory alignment"
✅ "reconciliation fallback via cognify repair / stale correction"
✅ "direct deletion only when Korda has a real data ID/UUID"

Avoid:

❌ "production-ready"
❌ "fully deletes contaminated memory"
❌ "perfect graph cleanup"
❌ "watches all live agents continuously"
❌ "complete multiplayer truth engine"
