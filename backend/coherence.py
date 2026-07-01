import logging
import json
from typing import Dict, Any
import cognee
from cognee.api.v1.search import SearchType

logger = logging.getLogger(__name__)

async def calculate_drift_metrics(project_name: str, proposed_narrative: str, session_id: str = None) -> Dict[str, Any]:
    """
    Reality Coherence Layer.
    Uses Cognee's native graph traversal (recall) to fetch the valid SUPERSEDES chain.
    Then evaluates the proposed narrative against the established reality graph to calculate Drift Velocity.
    """
    logger.info(f"Calculating drift metrics for project {project_name} using Cognee Memory Plane.")
    
    # 1. Traverse the Reality Graph: Recall context related to the narrative
    # This inherently navigates the temporal edges (valid_from, invalid_at) based on the ingest setup.
    recall_results = await cognee.recall(
        query_text=proposed_narrative,
        query_type=SearchType.CHUNKS,
        datasets=[project_name]
    )
    
    established_reality = str(recall_results)
    
    # If the graph is empty for this topic, there's no drift.
    if not established_reality or len(established_reality.strip()) < 10:
        return {
            "is_coherent": True,
            "drift_velocity": 0.0,
            "objective_alignment_score": 100.0,
            "divergence_origin": None,
            "recommendation": "New concept. No historical conflict."
        }
        
    # 2. Compute Drift Velocity using an LLM evaluator against the graph context
    try:
        from litellm import acompletion
        import os
        
        prompt = f"""
        You are the Korda Coherence Engine.
        Established Reality Graph Context:
        {established_reality}
        
        Proposed Narrative from Agent:
        {proposed_narrative}
        
        Task: Does the proposed narrative directly contradict an established, active decision in the reality graph? 
        Respond ONLY with a JSON object in this format:
        {{"contradicts": boolean, "drift_velocity": float (0.0 to 1.0, where 1.0 is total divergence), "diverging_decision_title": "Title of the specific decision it contradicts, or null", "reasoning": "string"}}
        """
        
        response = await acompletion(
            model="openai/" + os.getenv("LLM_MODEL", "gpt-4o"),
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            api_key=os.getenv("LLM_API_KEY"),
            api_base=os.getenv("LLM_ENDPOINT")
        )
        
        result_json = response.choices[0].message.content
        analysis = json.loads(result_json)
        
        is_coherent = not analysis.get("contradicts", False)
        drift = analysis.get("drift_velocity", 0.0)
        
        if not is_coherent:
            return {
                "is_coherent": False,
                "drift_velocity": drift,
                "objective_alignment_score": (1.0 - drift) * 100,
                "divergence_origin": analysis.get("diverging_decision_title", "Unknown Decision"),
                "recommendation": analysis.get("reasoning", "Halt execution. Align interpretations.")
            }
            
        return {
            "is_coherent": True,
            "drift_velocity": drift,
            "objective_alignment_score": (1.0 - drift) * 100,
            "divergence_origin": None,
            "recommendation": analysis.get("reasoning", "Proceed. Narrative aligns with established reality.")
        }
            
    except Exception as e:
        logger.warning(f"Native LLM check failed. Error: {e}")
        return {
            "is_coherent": True,
            "drift_velocity": 0.05,
            "objective_alignment_score": 95.0,
            "divergence_origin": None,
            "recommendation": f"Error during LLM evaluation: {str(e)}"
        }
