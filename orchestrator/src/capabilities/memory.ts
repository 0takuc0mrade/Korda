import { z } from 'zod';

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://127.0.0.1:8000';

export const ingestMemoryCapability = {
  name: 'ingest_memory',
  description: 'Ingest raw documentation or interactions into the Cognee Semantic Memory Plane using the Extract, Cognify, Load (ECL) pipeline.',
  inputSchema: z.object({
    project_name: z.string().describe('The isolated tenant/project dataset identifier.'),
    artifact_type: z.enum(['ADR', 'SlackTranscript', 'PR', 'Documentation']).describe('The ontological type of the artifact.'),
    content: z.string().describe('The raw text content to be ingested and graphed.')
  }),
  run: async (params: any) => {
    const args = params.args as { project_name: string, artifact_type: string, content: string };
    try {
      const response = await fetch(`${COGNEE_API_URL}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error("Memory Ingestion Error:", error);
      throw new Error(`Failed to ingest memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

export const queryMemoryCapability = {
  name: 'query_memory',
  description: 'Traverse the temporal knowledge graph to retrieve context for complex multi-hop reasoning or fact retrieval.',
  inputSchema: z.object({
    project_name: z.string().describe('The isolated tenant/project dataset identifier.'),
    query: z.string().describe('The analytical question to execute against the graph.'),
    user_id: z.string().optional().describe('Optional ID for multi-tenant isolation.'),
    session_id: z.string().optional().describe('Optional session ID to hit the rapid Redis cache.'),
    only_context: z.boolean().optional().describe('Set to true to bypass Cognee LLM synthesis and return raw topology for OpenServ agents to reason over locally.'),
    node_type: z.string().optional().describe('Optional topological filter for node types.')
  }),
  run: async (params: any) => {
    const args = params.args as { project_name: string, query: string, user_id?: string, session_id?: string, only_context?: boolean, node_type?: string };
    try {
      const payload = {
        ...args,
        triplet_distance_penalty: 6.5 // Hardcoded optimization from blueprint
      };
      const response = await fetch(`${COGNEE_API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error("Memory Query Error:", error);
      throw new Error(`Failed to query memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

export const evolveMemoryCapability = {
  name: 'evolve_memory',
  description: 'Triggers the memify pipeline in Cognee to resolve contradictions, generate Evolution Reports, and apply SUPERSEDES edges without raw re-ingestion.',
  inputSchema: z.object({
    project_name: z.string().describe('The isolated tenant/project dataset identifier.'),
    session_id: z.string().optional().describe('Optional session ID if evolving a specific transient conversation into persistent memory.')
  }),
  run: async (params: any) => {
    const args = params.args as { project_name: string, session_id?: string };
    try {
      const response = await fetch(`${COGNEE_API_URL}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error("Memory Evolution Error:", error);
      throw new Error(`Failed to evolve memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
