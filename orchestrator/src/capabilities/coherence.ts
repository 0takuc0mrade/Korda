import { z } from 'zod';

const COGNEE_API_URL = process.env.COGNEE_API_URL || 'http://127.0.0.1:8000';

export const checkCoherenceCapability = {
  name: 'check_coherence',
  description: 'Reality Coherence Layer check. Analyzes a proposed narrative against the established graph to detect interpretation divergence and return a Drift Velocity score.',
  inputSchema: z.object({
    project_name: z.string().describe('The isolated tenant/project dataset identifier.'),
    proposed_narrative: z.string().describe('The narrative or conclusion the agent wishes to commit.'),
    session_id: z.string().optional()
  }),
  run: async (params: any) => {
    const args = params.args as { project_name: string, proposed_narrative: string, session_id?: string };
    try {
      const response = await fetch(`${COGNEE_API_URL}/coherence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return JSON.stringify(json);
    } catch (error) {
      console.error("Coherence Check Error:", error);
      throw new Error(`Failed to check coherence: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
