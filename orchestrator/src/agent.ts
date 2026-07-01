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

// A mock function demonstrating the Multi-Agent workflow:
export async function executeEngineeringAnalysisTask(projectName: string, question: string) {
  console.log(`[Orchestrator] Starting task for project: ${projectName}`);
  
  // 1. The agent uses its capabilities to reason over the graph
  // In a real OpenServ deployment, this would be an async process handled via webhooks
  console.log(`[Orchestrator] Querying the semantic memory plane...`);
  
  // For demonstration, we directly invoke the capability
  let queryResult;
  try {
    const rawResult = await queryMemoryCapability.run({
      args: {
        project_name: projectName,
        query: question,
        only_context: false
      }
    } as any);
    queryResult = JSON.parse(rawResult);
  } catch (e) {
    console.error("[Orchestrator] Memory connection failed. Check if FastAPI is running.", e);
    return;
  }

  // 2. Agent forms a novel conclusion based on retrieved graph
  const conclusion = `Based on the graph completion: We must build a Premium product. Premium = Luxury and Speed.`;
  console.log(`[Orchestrator] Conclusion reached:`, conclusion);

  // 3. Reality Coherence Layer: Validate the narrative before syncing
  console.log(`[Orchestrator] Validating narrative coherence...`);
  try {
    const rawCoherence = await checkCoherenceCapability.run({
      args: {
        project_name: projectName,
        proposed_narrative: conclusion
      }
    } as any);
    const coherenceCheck = JSON.parse(rawCoherence);
    
    console.log(`[Coherence Monitor] Score: ${coherenceCheck.data.objective_alignment_score}, Drift Velocity: ${coherenceCheck.data.drift_velocity}`);
    
    if (!coherenceCheck.data.is_coherent) {
      console.warn(`[Coherence Monitor] WARNING: Interpretation divergence detected!`);
      console.warn(`[Coherence Monitor] Origin: ${coherenceCheck.data.divergence_origin}`);
      
      // Korda leverages OpenServ's native requestHumanAssistance to halt and flag drift
      await kordaAgent.requestHumanAssistance({
        workspaceId: 1, // Mock workspace ID for local test
        taskId: 1,      // Mock task ID for local test
        type: 'text',
        question: `Reality Fragmentation Warning: Divergence from established decision "${coherenceCheck.data.divergence_origin}".\n\nThe proposed narrative:\n"${conclusion}"\n\nConflicts with established reality. Recommendation: ${coherenceCheck.data.recommendation}`
      });
      return; // Halt execution, preventing fragmentation until human resolution
    }
  } catch (e) {
    console.error("[Coherence Monitor] Check failed.", e);
    return;
  }

  // 4. Cognitive Coordination: Synchronize this novel state back to the graph 
  // so downstream agents share the exact same reality (Mutual Agentic Reasoning).
  await synchronizeAgentState('Korda-Orchestrator', projectName, conclusion);

  console.log(`[Orchestrator] Task Complete. System state preserved and aligned.`);
}

// Start the agent server if run directly
if (require.main === module) {
  kordaAgent.start();
  console.log('Korda 2.0 Orchestrator Agent is running on OpenServ.');
}
