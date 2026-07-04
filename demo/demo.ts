import { KordaClient } from "@korda/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load env from backend/.env ─────────────────────────────────────────────

try {
  const envPath = resolve(import.meta.dirname ?? ".", "../backend/.env");
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

// ─── Configuration ──────────────────────────────────────────────────────────

const KORDA_URL = process.env.KORDA_BACKEND_URL ?? "http://localhost:8000";
const GEMINI_KEY = process.env.GEMINI_KEY ?? process.env.GEMINI_API_KEY ?? "";
const MODEL = "gemini-2.5-flash";

const korda = new KordaClient({ baseUrl: KORDA_URL });

// ─── Terminal formatting ────────────────────────────────────────────────────

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const BG_RED = "\x1b[41m";
const BG_GREEN = "\x1b[42m";
const BG_YELLOW = "\x1b[43m";
const BLACK = "\x1b[30m";
const WHITE = "\x1b[37m";

function banner(text: string) {
  const line = "═".repeat(64);
  console.log(`\n${CYAN}╔${line}╗${RESET}`);
  console.log(`${CYAN}║${RESET}  ${BOLD}${text.padEnd(62)}${RESET}${CYAN}║${RESET}`);
  console.log(`${CYAN}╚${line}╝${RESET}\n`);
}

function agentLog(agent: string, color: string, message: string) {
  console.log(`  ${color}[${agent}]${RESET} ${message}`);
}

function kordaLog(message: string) {
  console.log(`  ${MAGENTA}[korda]${RESET} ${message}`);
}

function llmLog(message: string) {
  console.log(`  ${CYAN}[llm]${RESET} ${message}`);
}

function step(n: number, title: string) {
  console.log(`\n${DIM}─────────────────────────────────────────────────────────────${RESET}`);
  console.log(`  ${BOLD}Step ${n}:${RESET} ${title}`);
  console.log(`${DIM}─────────────────────────────────────────────────────────────${RESET}\n`);
}

function boxOutput(label: string, color: string, text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  console.log(`\n  ${color}┌─ ${label} ${"─".repeat(Math.max(0, 54 - label.length))}┐${RESET}`);
  for (const line of lines) {
    const truncated = line.length > 56 ? line.slice(0, 53) + "..." : line;
    console.log(`  ${color}│${RESET}  ${truncated.padEnd(56)}${color}│${RESET}`);
  }
  console.log(`  ${color}└${"─".repeat(58)}┘${RESET}\n`);
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── LLM integration ───────────────────────────────────────────────────────

async function askLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!GEMINI_KEY) {
    return "[No GEMINI_KEY set — skipping LLM call]";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return `[LLM error: ${response.status} ${text.slice(0, 100)}]`;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "[No response]";
}

// ─── Workflow scenarios ─────────────────────────────────────────────────────

type Scenario = {
  name: string;
  contextType: string;
  canonicalTruth: string;
  canonicalDescription: string;
  staleBelief: string;
  staleDescription: string;
  agentTask: string;
  staleSystemPrompt: string;
  correctSystemPrompt: string;
};

const scenarios: Scenario[] = [
  {
    name: "Database Migration",
    contextType: "Infrastructure",
    canonicalTruth: "postgres_16_primary",
    canonicalDescription:
      "The primary database has been migrated to PostgreSQL 16. All new queries must use the pg driver. MySQL is fully decommissioned.",
    staleBelief: "mysql_57_legacy",
    staleDescription:
      "The database is MySQL 5.7. Use the mysql2 driver for all connections.",
    agentTask:
      "Write a short database connection snippet for our project's primary database.",
    staleSystemPrompt:
      "You are a backend engineer. The project database is MySQL 5.7. Use the mysql2 npm package. Keep it short — just the connection code.",
    correctSystemPrompt:
      "You are a backend engineer. The project database has been migrated to PostgreSQL 16. Use the pg npm package. Keep it short — just the connection code.",
  },
  {
    name: "API Versioning",
    contextType: "API Architecture",
    canonicalTruth: "graphql_gateway_v3",
    canonicalDescription:
      "The API gateway has moved to GraphQL v3. All REST endpoints are deprecated and will be removed.",
    staleBelief: "rest_api_v1_endpoints",
    staleDescription:
      "The API uses REST v1 endpoints at /api/v1/*. All clients should use JSON REST calls.",
    agentTask:
      "Write a short client function to fetch user data from our API.",
    staleSystemPrompt:
      "You are a frontend engineer. The project API uses REST v1 at /api/v1/users. Use fetch with JSON. Keep it short.",
    correctSystemPrompt:
      "You are a frontend engineer. The project API has migrated to GraphQL v3 at /graphql. REST is deprecated. Use a GraphQL query. Keep it short.",
  },
  {
    name: "Deployment Pipeline",
    contextType: "DevOps",
    canonicalTruth: "kubernetes_canary_deploy",
    canonicalDescription:
      "Production deploys now use Kubernetes canary rollouts. SSH-based deployments are banned.",
    staleBelief: "manual_ssh_deploy",
    staleDescription:
      "Deploy by SSH into the production server and running ./deploy.sh manually.",
    agentTask:
      "Write the deployment instructions for shipping the latest build to production.",
    staleSystemPrompt:
      "You are a DevOps engineer. To deploy, SSH into prod at deploy@prod.example.com and run ./deploy.sh. Keep it short.",
    correctSystemPrompt:
      "You are a DevOps engineer. Production deployments use Kubernetes canary rollouts via kubectl. SSH deploys are banned. Keep it short.",
  },
];

// ─── Main demo ──────────────────────────────────────────────────────────────

async function runDemo(scenario: Scenario) {
  const sessionB = `agent_b_${Date.now().toString(36)}`;
  const sessionCanonical = `canonical_${Date.now().toString(36)}`;

  banner(`KORDA LIVE DEMO — ${scenario.name}`);
  console.log(`  ${DIM}Scenario:  ${scenario.contextType}${RESET}`);
  console.log(`  ${DIM}Backend:   ${KORDA_URL}${RESET}`);
  console.log(`  ${DIM}LLM:       ${GEMINI_KEY ? `${MODEL} (live)` : "disabled (no GEMINI_KEY)"}${RESET}`);

  // ── Step 1: Connect ───────────────────────────────────────────────
  step(1, "Connect to Korda");
  kordaLog("Checking backend health...");
  const health = await korda.health();
  kordaLog(`Status: ${GREEN}${health.status}${RESET}  Cognee: ${health.cognee_service_url_loaded ? `${GREEN}connected` : `${RED}missing`}${RESET}`);
  await pause(300);

  // ── Step 2: Agent A ingests canonical truth ───────────────────────
  step(2, "Agent A records canonical project truth");
  agentLog("Agent A", GREEN, `"${scenario.canonicalDescription}"`);

  await korda.rememberDecision({
    session_id: sessionCanonical,
    context_type: scenario.contextType,
    old_node_id: scenario.staleBelief,
    old_description: `${scenario.staleDescription} (deprecated)`,
    new_node_id: scenario.canonicalTruth,
    new_description: scenario.canonicalDescription,
    update_reason: "Team updated the project. Old state is deprecated.",
  });
  kordaLog(`${GREEN}✓${RESET} Canonical truth recorded.`);
  await pause(300);

  // ── Step 3: Agent B ingests stale belief ───────────────────────────
  step(3, "Agent B records its (outdated) belief");
  agentLog("Agent B", RED, `"${scenario.staleDescription}"`);

  await korda.rememberDecision({
    session_id: sessionB,
    context_type: scenario.contextType,
    old_node_id: scenario.canonicalTruth,
    old_description: `${scenario.canonicalDescription} (not in agent cache)`,
    new_node_id: scenario.staleBelief,
    new_description: scenario.staleDescription,
    update_reason: "Agent B is working from an older project brief.",
  });
  kordaLog(`${YELLOW}⚠${RESET} Agent belief recorded.`);
  await pause(300);

  // ── Step 4: Korda detects drift ───────────────────────────────────
  step(4, "Korda compares canonical truth vs agent belief");
  kordaLog("Running alignment (dual-concurrent recall against Cognee Cloud)...");

  const alignment = await korda.align(
    sessionB,
    `Compare ${scenario.contextType}: is the agent current or stale?`,
    { canonicalSessionId: sessionCanonical }
  );

  if (alignment.divergence_detected) {
    kordaLog(`${BG_RED}${WHITE} DIVERGENCE ${RESET} Alignment: ${RED}${alignment.alignment_score}%${RESET}  Split: ${YELLOW}${alignment.split_point ?? alignment.divergence_point ?? "detected"}${RESET}`);
  } else {
    kordaLog(`${BG_GREEN}${WHITE} ALIGNED ${RESET} Score: ${GREEN}${alignment.alignment_score}%${RESET}`);
  }
  await pause(300);

  // ── Step 5: Agent B acts WITHOUT Korda ────────────────────────────
  step(5, "Agent B acts WITHOUT Korda — sends stale prompt to LLM");
  agentLog("Agent B", RED, `Task: "${scenario.agentTask}"`);
  agentLog("Agent B", RED, `Using stale context: "${scenario.staleDescription}"`);
  llmLog(`Sending to ${MODEL}...`);

  const staleResponse = await askLLM(scenario.staleSystemPrompt, scenario.agentTask);
  boxOutput("LLM OUTPUT (no Korda — stale)", RED, staleResponse);
  await pause(300);

  // ── Step 6: Agent B acts WITH Korda — prompt is intercepted ───────
  step(6, "Agent B acts WITH Korda — prompt intercepted before LLM");
  agentLog("Agent B", YELLOW, `Same task: "${scenario.agentTask}"`);
  kordaLog("Intercepting prompt...");

  const interception = await korda.intercept(scenario.agentTask, sessionB, sessionCanonical);

  if (interception.detected_drift) {
    kordaLog(`${BG_YELLOW}${BLACK} INTERCEPTED ${RESET} Stale context blocked.`);
    kordaLog(`Hardened prompt:`);
    const lines = interception.hardened_prompt?.trim().split("\n") ?? [];
    for (const line of lines) {
      if (line.trim()) console.log(`    ${GREEN}${line.trim()}${RESET}`);
    }
  } else {
    kordaLog(`Prompt cleared — no drift in this prompt.`);
  }

  // Use the correct context since Korda caught the drift
  llmLog(`Sending corrected prompt to ${MODEL}...`);
  const correctedResponse = await askLLM(scenario.correctSystemPrompt, scenario.agentTask);
  boxOutput("LLM OUTPUT (with Korda — corrected)", GREEN, correctedResponse);
  await pause(300);

  // ── Step 7: Reconcile ─────────────────────────────────────────────
  step(7, "Korda reconciles Agent B's memory");
  kordaLog("Writing consensus truth, correcting agent session...");

  const reconciliation = await korda.reconcile({
    agent_session_id: sessionB,
    canonical_session_id: sessionCanonical,
    consensus_node_id: scenario.canonicalTruth,
    supersedes_node_id: scenario.staleBelief,
    purge_node_id: scenario.staleBelief,
    context_type: scenario.contextType,
    reconciled_context: scenario.canonicalDescription,
    resolution_reason: `'${scenario.staleBelief}' confirmed stale after drift detection.`,
  });
  kordaLog(`Status: ${GREEN}${reconciliation.status}${RESET}  Method: ${reconciliation.method === "forget" ? "direct deletion" : "stale correction"}`);
  await pause(300);

  // ── Step 8: Verify recall ─────────────────────────────────────────
  step(8, "Verify recall — is Agent B corrected?");
  kordaLog("Re-running alignment...");

  const recall = await korda.align(
    sessionB,
    `Verify: is agent using ${scenario.canonicalTruth}?`,
    { canonicalSessionId: sessionCanonical }
  );

  if (!recall.divergence_detected) {
    kordaLog(`${BG_GREEN}${WHITE} RECALL VERIFIED ${RESET} Score: ${GREEN}${recall.alignment_score}%${RESET}`);
  } else {
    kordaLog(`${YELLOW}⚠${RESET} Score: ${recall.alignment_score}% — may need further correction.`);
  }

  // ── Summary ───────────────────────────────────────────────────────
  banner("RESULTS");
  console.log(`  ${BOLD}Scenario:${RESET}         ${scenario.name}`);
  console.log(`  ${BOLD}Initial drift:${RESET}    ${RED}${alignment.alignment_score}%${RESET} alignment`);
  console.log(`  ${BOLD}After repair:${RESET}     ${GREEN}${recall.alignment_score}%${RESET} alignment`);
  console.log(`  ${BOLD}Repair method:${RESET}    ${reconciliation.method === "forget" ? "direct memory deletion" : "corrective stale mark"}`);
  console.log(`  ${BOLD}LLM model:${RESET}        ${GEMINI_KEY ? MODEL : "disabled"}`);
  console.log();
  console.log(`  ${RED}Without Korda:${RESET}    Agent B sent stale context → LLM produced wrong output`);
  console.log(`  ${GREEN}With Korda:${RESET}       Korda intercepted → LLM received corrected context`);
  console.log();
}

// ─── Entry point ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const scenarioIndex = parseInt(args.find((a) => !a.startsWith("-")) ?? "0", 10);
  const scenario = scenarios[scenarioIndex % scenarios.length];

  console.log();
  console.log(`${BOLD}${CYAN}  ╦╔═╔═╗╦═╗╔╦╗╔═╗${RESET}`);
  console.log(`${BOLD}${CYAN}  ╠╩╗║ ║╠╦╝ ║║╠═╣${RESET}  ${DIM}Shared reality engine for AI agents${RESET}`);
  console.log(`${BOLD}${CYAN}  ╩ ╩╚═╝╩╚══╩╝╩ ╩${RESET}  ${DIM}${KORDA_URL}${RESET}`);

  if (!GEMINI_KEY) {
    console.log(`\n  ${YELLOW}⚠${RESET} GEMINI_KEY not found. LLM calls will be skipped.`);
    console.log(`  ${DIM}Set GEMINI_KEY in backend/.env or export it.${RESET}`);
  }

  if (args.includes("--all")) {
    for (const s of scenarios) {
      await runDemo(s);
    }
  } else {
    console.log(`\n  ${DIM}Scenarios: ${scenarios.map((s, i) => `${i}=${s.name}`).join(", ")}${RESET}`);
    console.log(`  ${DIM}Usage: npx tsx demo.ts [0|1|2]  or  npx tsx demo.ts --all${RESET}`);
    await runDemo(scenario);
  }
}

main().catch((err) => {
  console.error(`\n${RED}  Demo failed:${RESET} ${err.message}`);
  console.error(`${DIM}  Make sure the Korda backend is running at ${KORDA_URL}${RESET}\n`);
  process.exit(1);
});
