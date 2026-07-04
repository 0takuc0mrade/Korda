import unittest

from graph_diff import calculate_graph_divergence


class GraphDiffTests(unittest.TestCase):
    def test_detects_status_drift_on_same_nodes(self):
        canonical = [
            {
                "node_id": "AUTH_API_V1",
                "description": "The legacy v1 authentication endpoints.",
                "status": "stale",
            },
            {
                "node_id": "AUTH_API_V2",
                "description": "The new v2 JWT authentication system.",
                "status": "active",
            },
            {
                "source_node_id": "AUTH_API_V1",
                "target_node_id": "AUTH_API_V2",
                "relationship_type": "SUPERSEDES",
            },
        ]
        agent = [
            {
                "node_id": "AUTH_API_V1",
                "description": "The legacy v1 authentication endpoints are still active.",
                "status": "active",
            },
            {
                "node_id": "AUTH_API_V2",
                "description": "The v2 JWT authentication system is not available.",
                "status": "stale",
            },
        ]

        diff = calculate_graph_divergence(canonical, agent)

        self.assertLess(diff["alignment_score"], 80.0)
        self.assertTrue(diff["divergence_detected"])
        self.assertEqual(diff["divergence_point"], "AUTH_API_V1")
        self.assertIn("AUTH_API_V1", diff["direct_conflicts"])

    def test_scores_aligned_graphs_highly(self):
        canonical = [
            {
                "node_id": "AUTH_API_V2",
                "description": "The new v2 JWT authentication system.",
                "status": "active",
            }
        ]
        agent = [
            {
                "node_id": "AUTH_API_V2",
                "description": "The new v2 JWT authentication system.",
                "status": "active",
            }
        ]

        diff = calculate_graph_divergence(canonical, agent)

        self.assertEqual(diff["alignment_score"], 100.0)
        self.assertFalse(diff["divergence_detected"])
        self.assertIsNone(diff["divergence_point"])


if __name__ == "__main__":
    unittest.main()
