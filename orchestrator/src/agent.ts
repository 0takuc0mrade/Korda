import { Agent } from '@openserv-labs/sdk';
import 'dotenv/config';
import { ingestMemoryCapability, queryMemoryCapability, evolveMemoryCapability } from './capabilities/memory';
import { checkCoherenceCapability } from './capabilities/coherence';
import { synchronizeAgentState } from './middleware/sync';

// Define the Korda 2.0 Orchestrator Agent
export const kordaAgent = new Agent({
  systemPrompt: `You are the Korda 2.0 Orchestrator Agent, a Level 3 fully autonomous system.
Your purpose is to navigate the semantic memory graph to assist engineering teams in tracking decision evolution.
You are connected to the Cognee Memory Plane. Do NOT hallucinate. 
If asked to recall a past state, ALWAYS use the 'query_memory' capability first.
If asked to learn a new architecture or decision, ALWAYS use the 'ingest_memory' capability.
If told that a decision supersedes another, trigger the 'evolve_memory' capability.
You utilize Bounded Reasoning. Your outputs are synchronized via the MAR middleware to prevent semantic drift.`
});

// Add capabilities individually per OpenServ v2+ SDK
kordaAgent.addCapability(ingestMemoryCapability);
kordaAgent.addCapability(queryMemoryCapability);
kordaAgent.addCapability(evolveMemoryCapability);
kordaAgent.addCapability(checkCoherenceCapability);


// Start the agent server if run directly
if (require.main === module) {
  kordaAgent.start();
  console.log('Korda 2.0 Orchestrator Agent is running on OpenServ.');
}
