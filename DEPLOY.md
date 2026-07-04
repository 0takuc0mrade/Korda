# Korda Render Deployment

## Services

### 1. Backend (FastAPI + Cognee)
- **Type:** Web Service
- **Root Directory:** `backend`
- **Runtime:** Python 3.12
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Environment Variables (set in Render Dashboard):
```
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_ENDPOINT=https://api.aimlapi.com/v1
LLM_API_KEY=<your key>
COGNEE_API_KEY=<your key>
COGNEE_SKIP_CONNECTION_TEST=true
EMBEDDING_PROVIDER=openai
EMBEDDING_ENDPOINT=https://api.aimlapi.com/v1
EMBEDDING_MODEL=text-embedding-3-small
GRAPH_PROMPT_PATH=custom_graph_prompt.txt
```

### 2. Frontend (Next.js)
- **Type:** Web Service
- **Root Directory:** `web`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

#### Environment Variables (set in Render Dashboard):
```
NEXT_PUBLIC_API_URL=https://<your-backend-service>.onrender.com
```
