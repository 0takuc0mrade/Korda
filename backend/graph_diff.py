import json
import re
from dataclasses import dataclass, field
from difflib import SequenceMatcher
from typing import Any


NODE_ID_KEYS = ("node_id", "id", "name", "title", "component_id", "context_id")
STATUS_KEYS = ("status", "state")
DESCRIPTION_KEYS = ("description", "text", "truth", "content", "summary")
SOURCE_KEYS = ("source_node_id", "source", "from", "start_node_id")
TARGET_KEYS = ("target_node_id", "target", "to", "end_node_id")
RELATIONSHIP_KEYS = ("relationship_type", "relationship", "relation", "edge_type", "type")


@dataclass
class GraphProjection:
    nodes: dict[str, dict[str, str]] = field(default_factory=dict)
    edges: set[tuple[str, str, str]] = field(default_factory=set)
    text_fragments: list[str] = field(default_factory=list)

    @property
    def active_nodes(self) -> set[str]:
        return {node_id for node_id, node in self.nodes.items() if node.get("status") == "active"}

    @property
    def stale_nodes(self) -> set[str]:
        return {node_id for node_id, node in self.nodes.items() if node.get("status") == "stale"}

    @property
    def searchable_text(self) -> str:
        return " ".join(self.text_fragments)


def calculate_graph_divergence(canonical_results: Any, agent_results: Any) -> dict[str, Any]:
    """
    Compare two Cognee recall responses and return a deterministic alignment score.

    Cognee recall shapes can vary by search mode, so this scorer first projects the
    response into a simple topology: node ids, node statuses, edges, and text.
    Divergence is then calculated from status conflicts, missing active truth, edge
    mismatch, and a text-similarity fallback when graph structure is sparse.
    """
    canonical = project_recall_results(canonical_results)
    agent = project_recall_results(agent_results)

    status_mismatches: list[dict[str, str]] = []
    missing_from_agent: list[str] = []
    agent_only_nodes: list[str] = []

    canonical_ids = set(canonical.nodes)
    agent_ids = set(agent.nodes)

    for node_id in sorted(canonical_ids & agent_ids):
        canonical_status = canonical.nodes[node_id].get("status")
        agent_status = agent.nodes[node_id].get("status")
        if canonical_status and agent_status and canonical_status != agent_status:
            status_mismatches.append(
                {
                    "node_id": node_id,
                    "canonical_status": canonical_status,
                    "agent_status": agent_status,
                }
            )

    for node_id in sorted(canonical.active_nodes - agent_ids):
        missing_from_agent.append(node_id)

    for node_id in sorted(agent.active_nodes - canonical_ids):
        agent_only_nodes.append(node_id)

    direct_conflicts = sorted(
        (agent.active_nodes & canonical.stale_nodes)
        | (canonical.active_nodes & agent.stale_nodes)
    )

    canonical_edges = canonical.edges
    agent_edges = agent.edges
    if canonical_edges or agent_edges:
        shared_edges = canonical_edges & agent_edges
        edge_similarity = len(shared_edges) / len(canonical_edges | agent_edges)
    else:
        edge_similarity = None

    text_similarity = _text_similarity(canonical.searchable_text, agent.searchable_text)

    graph_evidence_count = len(canonical_ids | agent_ids) + len(canonical_edges | agent_edges)
    if graph_evidence_count:
        node_penalty = (
            (len(status_mismatches) * 35.0)
            + (len(direct_conflicts) * 25.0)
            + (len(missing_from_agent) * 15.0)
            + (len(agent_only_nodes) * 10.0)
        )
        edge_penalty = 0.0
        if edge_similarity is not None:
            edge_penalty = (1.0 - edge_similarity) * 25.0

        raw_score = 100.0 - node_penalty - edge_penalty

        # If topology exists but descriptions are wildly different, let that
        # nudge the score down without overpowering explicit graph conflicts.
        if text_similarity is not None:
            raw_score -= (1.0 - text_similarity) * 10.0
    elif text_similarity is not None:
        raw_score = text_similarity * 100.0
    else:
        raw_score = 100.0

    alignment_score = round(max(0.0, min(100.0, raw_score)), 2)
    divergence_point = _choose_divergence_point(
        direct_conflicts,
        status_mismatches,
        missing_from_agent,
        agent_only_nodes,
    )

    return {
        "alignment_score": alignment_score,
        "divergence_detected": alignment_score < 80.0,
        "divergence_point": divergence_point,
        "canonical_node_count": len(canonical.nodes),
        "agent_node_count": len(agent.nodes),
        "canonical_edge_count": len(canonical.edges),
        "agent_edge_count": len(agent.edges),
        "status_mismatches": status_mismatches,
        "direct_conflicts": direct_conflicts,
        "missing_from_agent": missing_from_agent,
        "agent_only_nodes": agent_only_nodes,
        "edge_similarity": None if edge_similarity is None else round(edge_similarity, 4),
        "text_similarity": None if text_similarity is None else round(text_similarity, 4),
    }


def project_recall_results(results: Any) -> GraphProjection:
    projection = GraphProjection()
    _walk(results, projection)
    return projection


def _walk(value: Any, projection: GraphProjection) -> None:
    if value is None:
        return

    if hasattr(value, "model_dump"):
        _walk(value.model_dump(), projection)
        return

    if isinstance(value, dict):
        _capture_dict(value, projection)
        for child in value.values():
            _walk(child, projection)
        return

    if isinstance(value, (list, tuple, set)):
        for item in value:
            _walk(item, projection)
        return

    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return

        parsed = _parse_serialized_value(stripped)
        if parsed is not None:
            _walk(parsed, projection)
            return

        projection.text_fragments.append(stripped)
        _capture_text_node(stripped, projection)
        return

    projection.text_fragments.append(str(value))


def _capture_dict(value: dict[str, Any], projection: GraphProjection) -> None:
    normalized = {_normalize_key(key): item for key, item in value.items()}

    source = _first_value(normalized, SOURCE_KEYS)
    target = _first_value(normalized, TARGET_KEYS)
    relationship = _first_value(normalized, RELATIONSHIP_KEYS)
    if source and target:
        projection.edges.add(
            (
                _clean_identifier(source),
                _clean_identifier(target),
                _clean_identifier(relationship or "RELATED_TO"),
            )
        )

    node_id = _first_value(normalized, NODE_ID_KEYS)
    if not node_id:
        return

    cleaned_id = _clean_identifier(node_id)
    if not cleaned_id:
        return

    node = projection.nodes.setdefault(cleaned_id, {"node_id": cleaned_id})
    status = _normalize_status(_first_value(normalized, STATUS_KEYS))
    description = _first_value(normalized, DESCRIPTION_KEYS)

    if status:
        node["status"] = status
    if description:
        node["description"] = str(description)
        projection.text_fragments.append(str(description))


def _capture_text_node(text: str, projection: GraphProjection) -> None:
    node_ids = set(re.findall(r"\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b", text))
    status = _normalize_status(text)
    for node_id in node_ids:
        node = projection.nodes.setdefault(node_id, {"node_id": node_id})
        if status and "status" not in node:
            node["status"] = status
        if "description" not in node:
            node["description"] = text


def _parse_serialized_value(value: str) -> Any | None:
    if not (value.startswith("{") or value.startswith("[")):
        return None

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        pass

    try:
        import ast

        return ast.literal_eval(value)
    except (ValueError, SyntaxError):
        return None


def _first_value(value: dict[str, Any], keys: tuple[str, ...]) -> Any | None:
    for key in keys:
        normalized_key = _normalize_key(key)
        if normalized_key in value and value[normalized_key] not in (None, ""):
            return value[normalized_key]
    return None


def _normalize_key(key: Any) -> str:
    return str(key).strip().lower()


def _clean_identifier(value: Any) -> str:
    return str(value).strip()


def _normalize_status(value: Any) -> str | None:
    if value is None:
        return None

    normalized = str(value).strip().lower()
    if normalized in {"active", "current", "canonical", "valid", "approved"}:
        return "active"
    if normalized in {"stale", "deprecated", "superseded", "invalid", "obsolete"}:
        return "stale"

    if re.search(r"\b(active|current|canonical|valid|approved)\b", normalized):
        return "active"
    if re.search(r"\b(stale|deprecated|superseded|invalid|obsolete)\b", normalized):
        return "stale"
    return None


def _text_similarity(canonical_text: str, agent_text: str) -> float | None:
    canonical = canonical_text.strip()
    agent = agent_text.strip()
    if not canonical and not agent:
        return None
    if not canonical or not agent:
        return 0.0
    return SequenceMatcher(None, canonical.lower(), agent.lower()).ratio()


def _choose_divergence_point(
    direct_conflicts: list[str],
    status_mismatches: list[dict[str, str]],
    missing_from_agent: list[str],
    agent_only_nodes: list[str],
) -> str | None:
    if direct_conflicts:
        return direct_conflicts[0]
    if status_mismatches:
        return status_mismatches[0]["node_id"]
    if missing_from_agent:
        return missing_from_agent[0]
    if agent_only_nodes:
        return agent_only_nodes[0]
    return None
