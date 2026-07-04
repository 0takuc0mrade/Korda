from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SoftwareComponent(BaseModel):
    """
    A core component or microservice in the architecture.
    """
    component_id: str
    description: str

class DecisionNode(BaseModel):
    """
    A specific decision, fact, or piece of shared context in the Reality Graph.
    This replaces the narrow APIEndpoint concept for the broader Korda 2.0 engine.
    """
    node_id: str
    context_type: str # e.g., "Architecture Decision", "API Spec", "Business Rule"
    description: str
    status: str # 'active' or 'stale'
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SupersedesEdge(BaseModel):
    """
    The structural backbone of Korda 2.0.
    Maps exactly WHY and WHEN a new decision replaced an old one.
    """
    source_node_id: str
    target_node_id: str
    relationship_type: str = "SUPERSEDES"
    resolution_reason: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ParticipantAgent(BaseModel):
    """
    Represents an autonomous agent or human interacting with the system.
    """
    agent_id: str
    role: str
