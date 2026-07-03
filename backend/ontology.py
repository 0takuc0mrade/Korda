from pydantic import BaseModel
from typing import List, Optional

class SoftwareComponent(BaseModel):
    """
    A core component or microservice in the architecture.
    """
    component_id: str
    description: str

class APIEndpoint(BaseModel):
    """
    A specific API endpoint linked to a SoftwareComponent.
    The status field is critical for mapping temporal validity (e.g., 'active' vs 'stale').
    """
    endpoint_id: str
    endpoint_url: str
    version: str
    status: str
    linked_component: str

class DeveloperTeam(BaseModel):
    """
    The human team or AI agent squad responsible for the component.
    """
    team_name: str
    active_tasks: List[str]
