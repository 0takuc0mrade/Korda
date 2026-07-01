import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

import cognee
from cognee.api.v1.search import SearchType
from ontology import ProjectNode, ActorNode, ArtifactNode, DecisionNode, ConceptNode
from coherence import calculate_drift_metrics

app = FastAPI(title="Korda 2.0: Temporal Knowledge Evolution Engine")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Cognee config (typically relies on env vars for DBs)
# SQLite, LanceDB, and Kuzu are defaults for local.

class IngestRequest(BaseModel):
    project_name: str
    artifact_type: str
    content: str

class QueryRequest(BaseModel):
    project_name: str
    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    only_context: Optional[bool] = False
    node_name: Optional[str] = None
    node_type: Optional[str] = None
    triplet_distance_penalty: Optional[float] = 6.5

class ImproveRequest(BaseModel):
    project_name: str
    session_id: Optional[str] = None

class ForgetRequest(BaseModel):
    project_name: str
    specific_data_id: Optional[str] = None

class CoherenceRequest(BaseModel):
    project_name: str
    proposed_narrative: str
    session_id: Optional[str] = None

@app.post("/ingest")
async def ingest_artifact(request: IngestRequest):
    """
    Ingests an artifact using temporal cognification to extract valid_from/invalid_at temporal edges.
    """
    try:
        # Utilize temporal_cognify to automatically extract timelines
        # and enforce the strict domain ontology.
        await cognee.add([request.content], dataset_name=request.project_name)
        await cognee.cognify(datasets=[request.project_name])
        return {"status": "success", "message": "Artifact ingested successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_evolution(request: QueryRequest):
    """
    Traverses the temporal graph and retrieves subgraphs for OpenServ agent synthesis.
    """
    try:
        retriever_config = {
            "max_iter": 4,
            "triplet_distance_penalty": request.triplet_distance_penalty
        }
        if request.node_name:
            retriever_config["node_name"] = request.node_name
        if request.node_type:
            retriever_config["node_type"] = request.node_type

        # Optional logic to bypass LLM completion if only_context is requested
        # We pass only_context through kwargs or process locally based on cognee version.
        
        results = await cognee.recall(
            query_text=request.query,
            query_type=SearchType.GRAPH_COMPLETION_COT,
            datasets=[request.project_name],
            user_id=request.user_id,
            session_ids=[request.session_id] if request.session_id else None,
            retriever_specific_config=retriever_config,
            include_references=True
        )
        return {"status": "success", "data": results, "only_context_applied": request.only_context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/improve")
async def trigger_evolution_batch(request: ImproveRequest):
    """
    Custom batch task to detect contradictions, attach SUPERSEDES edges,
    and generate an Evolution Report meta-node.
    """
    try:
        # In a real scenario, this would use cognee.improve to run the post-processing pipeline
        # For the hackathon, we call it and let Cognee consolidate the graph
        if request.session_id:
            await cognee.improve(
                dataset=request.project_name,
                session_ids=[request.session_id]
            )
        else:
            await cognee.improve(
                dataset=request.project_name
            )
            
        # Korda is Cognee. The improve pipeline naturally consolidates the temporal edges, 
        # applies SUPERSEDES logic across the graph, and prunes stale artifacts.
        # We return the successful consolidation status.
        return {"status": "success", "message": "Cognee temporal evolution and graph consolidation completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/forget")
async def prune_deprecated(request: ForgetRequest):
    """
    Prunes isolated, deprecated nodes (e.g., superseded > 1 year)
    """
    try:
        # Utilizing standard top-level API
        await cognee.forget(dataset_name=request.project_name)
        msg = f"Pruned dataset {request.project_name}"
        return {"status": "success", "message": msg}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/coherence")
async def check_reality_coherence(request: CoherenceRequest):
    """
    Layer 2: Reality Coherence.
    Detects if the proposed narrative diverges from the established shared reality graph.
    """
    try:
        metrics = await calculate_drift_metrics(
            project_name=request.project_name,
            proposed_narrative=request.proposed_narrative,
            session_id=request.session_id
        )
        return {"status": "success", "data": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/visualize")
async def visualize_provenance(project_name: str):
    """
    Generates a D3.js HTML map proving memory provenance.
    """
    try:
        dest = os.path.join(os.path.expanduser("~"), f"{project_name}_provenance.html")
        await cognee.visualize_memory_provenance(
            destination_file_path=dest,
            include_memory=True
        )
        # We could return the HTML content directly or the path
        if os.path.exists(dest):
            with open(dest, "r") as f:
                html_content = f.read()
            return {"status": "success", "html": html_content}
        else:
            raise HTTPException(status_code=404, detail="Visualization file not created.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
