# Korda — Live Proof Checklist

Use this checklist when recording the final evidence run for submission.

## Pre-Flight

- [ ] **Restart the backend** before the proof run to clear in-process session state.
- [ ] Confirm backend environment variables are set:
  - `COGNEE_SERVICE_URL` — your Cognee Cloud tenant URL
  - `COGNEE_API_KEY` — your Cognee Cloud API key
  - `KORDA_REALITY_DATASET` (optional, defaults to `reality_matrix`)
  - `KORDA_CANONICAL_SESSION_ID` (optional, defaults to `global`)
- [ ] Confirm frontend environment variable is set:
  - `NEXT_PUBLIC_KORDA_API_URL` — the backend URL (e.g. `https://korda.onrender.com`)

## Start Services

### Backend (local)

```bash
cd backend
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### Backend (deployed)

If using Render, confirm the service is live at `https://korda.onrender.com/health`.

### Frontend (local)

```bash
cd web
npm run dev
```

### Frontend (deployed)

Navigate to your deployed frontend URL.

## Six-Step Browser Workflow

Run each step in order on the `/demo` page:

| Step | Action | What to Capture |
| --- | --- | --- |
| 1 | **Check backend health** | Green status, Cognee credentials loaded |
| 2 | **Ingest canonical truth** | Receipt showing `POST /webhook/stream` success |
| 3 | **Ingest agent belief** | Receipt showing divergent agent ingestion |
| 4 | **Run alignment** | Alignment score, divergence detected, split point |
| 5 | **Intercept prompt** | Original prompt → hardened prompt with guardrail |
| 6 | **Reconcile** | Reconciliation receipt, purge method |
| 7 | **Verify recall** | Post-reconciliation alignment score |

## Screenshots / Video to Capture

- [ ] Backend connected (health check green)
- [ ] Alignment result showing divergence score and split point
- [ ] Intercept correction showing hardened prompt
- [ ] Reconciliation result showing method (forget or corrective stale mark)
- [ ] Verify recall result showing healthy alignment
- [ ] Run Evidence panel expanded with all receipts
- [ ] Final copied run summary (paste into a text file as proof)

## Recording the Demo

1. Use screen recording (OBS, QuickTime, or Loom).
2. Keep the browser tab visible throughout.
3. Speak through each step (see [DEMO_SCRIPT.md](DEMO_SCRIPT.md)).
4. After the workflow, open the Run Evidence panel and scroll through.
5. Click "Copy run summary" and paste into a document.
6. Optionally visit `/sdk` to show the SDK page.

## Post-Recording

- [ ] Verify the video is clear and captures all six steps.
- [ ] Save the copied run summary as a text artifact.
- [ ] Confirm no error states appeared during the run.
- [ ] If any step errored, restart the backend and re-run — Cognee Cloud state may need a clean session.
