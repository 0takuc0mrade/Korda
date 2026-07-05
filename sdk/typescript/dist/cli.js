#!/usr/bin/env node
import { KordaClient, KordaError } from "./index.js";
// ─── Colors ─────────────────────────────────────────────────────────────────
const isTTY = process.stdout.isTTY ?? false;
const c = {
    reset: isTTY ? "\x1b[0m" : "",
    bold: isTTY ? "\x1b[1m" : "",
    dim: isTTY ? "\x1b[2m" : "",
    red: isTTY ? "\x1b[31m" : "",
    green: isTTY ? "\x1b[32m" : "",
    yellow: isTTY ? "\x1b[33m" : "",
    cyan: isTTY ? "\x1b[36m" : "",
    magenta: isTTY ? "\x1b[35m" : "",
};
// ─── Argument parsing ───────────────────────────────────────────────────────
function parseArgs(argv) {
    const args = argv.slice(2);
    const command = args[0] ?? "help";
    const positional = [];
    const flags = {};
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--")) {
            const eqIdx = arg.indexOf("=");
            if (eqIdx !== -1) {
                flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
            }
            else {
                flags[arg.slice(2)] = args[i + 1] ?? "true";
                if (args[i + 1] && !args[i + 1].startsWith("--"))
                    i++;
            }
        }
        else {
            positional.push(arg);
        }
    }
    return { command, positional, flags };
}
function getBackendUrl(flags) {
    return (flags["backend"] ??
        process.env["KORDA_BACKEND_URL"] ??
        "https://korda.onrender.com");
}
function createClient(flags) {
    return new KordaClient({ baseUrl: getBackendUrl(flags) });
}
// ─── Commands ───────────────────────────────────────────────────────────────
async function cmdHealth(flags) {
    const url = getBackendUrl(flags);
    const korda = createClient(flags);
    console.log(`${c.dim}Checking ${url}...${c.reset}\n`);
    const health = await korda.health();
    console.log(`  ${c.bold}Status:${c.reset}    ${health.status === "ok" ? `${c.green}ok` : `${c.red}${health.status}`}${c.reset}`);
    console.log(`  ${c.bold}Cognee:${c.reset}    ${health.cognee_service_url_loaded ? `${c.green}connected` : `${c.red}not configured`}${c.reset}`);
    console.log(`  ${c.bold}API Key:${c.reset}   ${health.cognee_api_key_loaded ? `${c.green}loaded` : `${c.yellow}missing`}${c.reset}`);
    if (health.reality_dataset) {
        console.log(`  ${c.bold}Dataset:${c.reset}   ${health.reality_dataset}`);
    }
    console.log();
}
async function cmdAlign(positional, flags) {
    const agentSession = positional[0];
    if (!agentSession) {
        console.error(`${c.red}Usage: korda align <agent_session_id> [--query "..."] [--canonical <session>] [--fail-below <score>]${c.reset}`);
        process.exit(1);
    }
    const korda = createClient(flags);
    const query = flags["query"] ?? "Is this agent aligned with canonical truth?";
    const canonical = flags["canonical"];
    const failBelow = flags["fail-below"] ? parseFloat(flags["fail-below"]) : undefined;
    console.log(`${c.dim}Aligning ${agentSession} against ${canonical ?? "global"}...${c.reset}\n`);
    const result = await korda.align(agentSession, query, {
        canonicalSessionId: canonical,
    });
    const score = result.alignment_score ?? 0;
    const scoreColor = score >= 80 ? c.green : score >= 40 ? c.yellow : c.red;
    console.log(`  ${c.bold}Score:${c.reset}       ${scoreColor}${score}%${c.reset}`);
    console.log(`  ${c.bold}Status:${c.reset}      ${result.divergence_detected ? `${c.red}diverged` : `${c.green}aligned`}${c.reset}`);
    if (result.split_point || result.divergence_point) {
        console.log(`  ${c.bold}Split at:${c.reset}    ${c.yellow}${result.split_point ?? result.divergence_point}${c.reset}`);
    }
    if (result.summary) {
        console.log(`  ${c.bold}Summary:${c.reset}     ${result.summary}`);
    }
    console.log();
    if (failBelow !== undefined && score < failBelow) {
        console.error(`${c.red}FAIL: alignment score ${score}% is below threshold ${failBelow}%${c.reset}`);
        process.exit(1);
    }
}
async function cmdIntercept(positional, flags) {
    const prompt = positional[0];
    if (!prompt) {
        console.error(`${c.red}Usage: korda intercept "<prompt>" [--agent <session>] [--canonical <session>]${c.reset}`);
        process.exit(1);
    }
    const korda = createClient(flags);
    const agent = flags["agent"];
    const canonical = flags["canonical"];
    console.log(`${c.dim}Intercepting prompt...${c.reset}\n`);
    const result = await korda.intercept(prompt, agent, canonical);
    if (result.detected_drift) {
        console.log(`  ${c.yellow}${c.bold}INTERCEPTED${c.reset} — stale context detected\n`);
        if (result.correction) {
            console.log(`  ${c.bold}Correction:${c.reset}`);
            for (const line of result.correction.split(/[.\n]/).filter(Boolean)) {
                console.log(`    ${c.green}${line.trim()}${c.reset}`);
            }
            console.log();
        }
        console.log(`  ${c.bold}Hardened prompt:${c.reset}`);
        for (const line of (result.hardened_prompt ?? "").split("\n").filter((l) => l.trim())) {
            console.log(`    ${line.trim()}`);
        }
    }
    else {
        console.log(`  ${c.green}${c.bold}CLEAR${c.reset} — no drift detected in this prompt.`);
    }
    console.log();
}
async function cmdProtect(positional, flags) {
    const prompt = positional[0];
    if (!prompt) {
        console.error(`${c.red}Usage: korda protect "<prompt>" [--agent <session>] [--canonical <session>]${c.reset}`);
        process.exit(1);
    }
    const korda = createClient(flags);
    const agent = flags["agent"];
    const canonical = flags["canonical"];
    const result = await korda.protectPrompt(prompt, agent, canonical);
    // Pipe-friendly: raw output only
    process.stdout.write(result);
    if (isTTY)
        process.stdout.write("\n");
}
async function cmdRemember(positional, flags) {
    const required = ["old-node", "new-node", "new-desc"];
    const missing = required.filter((k) => !flags[k]);
    if (missing.length > 0) {
        console.error(`${c.red}Usage: korda remember --old-node <id> --new-node <id> --new-desc "<description>" [--old-desc "..."] [--context-type "..."] [--reason "..."] [--session <id>]${c.reset}`);
        console.error(`${c.red}Missing: ${missing.map((m) => `--${m}`).join(", ")}${c.reset}`);
        process.exit(1);
    }
    const korda = createClient(flags);
    await korda.rememberDecision({
        session_id: flags["session"] ?? "global",
        context_type: flags["context-type"] ?? undefined,
        old_node_id: flags["old-node"],
        old_description: flags["old-desc"] ?? undefined,
        new_node_id: flags["new-node"],
        new_description: flags["new-desc"] ?? undefined,
        update_reason: flags["reason"] ?? undefined,
    });
    console.log(`${c.green}✓${c.reset} Decision recorded.`);
    console.log(`  ${c.dim}${flags["old-node"]} → ${flags["new-node"]}${c.reset}`);
    console.log();
}
async function cmdReconcile(positional, flags) {
    const agentSession = positional[0];
    if (!agentSession || !flags["consensus"]) {
        console.error(`${c.red}Usage: korda reconcile <agent_session_id> --consensus <node_id> --context "<truth>" [--canonical <session>] [--supersedes <node>] [--purge <node>] [--reason "..."]${c.reset}`);
        process.exit(1);
    }
    const korda = createClient(flags);
    const result = await korda.reconcile({
        agent_session_id: agentSession,
        canonical_session_id: flags["canonical"],
        consensus_node_id: flags["consensus"],
        supersedes_node_id: flags["supersedes"],
        purge_node_id: flags["purge"],
        context_type: flags["context-type"],
        reconciled_context: flags["context"] ?? flags["consensus"],
        resolution_reason: flags["reason"],
    });
    console.log(`  ${c.bold}Status:${c.reset}    ${c.green}${result.status}${c.reset}`);
    console.log(`  ${c.bold}Method:${c.reset}    ${result.method ?? "unknown"}`);
    if (result.summary) {
        console.log(`  ${c.bold}Summary:${c.reset}   ${result.summary}`);
    }
    console.log();
}
function printHelp() {
    console.log(`
${c.bold}${c.cyan}  ╦╔═╔═╗╦═╗╔╦╗╔═╗${c.reset}
${c.bold}${c.cyan}  ╠╩╗║ ║╠╦╝ ║║╠═╣${c.reset}  ${c.dim}Shared reality engine for AI agents${c.reset}
${c.bold}${c.cyan}  ╩ ╩╚═╝╩╚══╩╝╩ ╩${c.reset}  ${c.dim}@korda/sdk${c.reset}

${c.bold}Usage:${c.reset}  korda <command> [options]

${c.bold}Commands:${c.reset}
  ${c.green}health${c.reset}                          Check backend and Cognee connectivity
  ${c.green}align${c.reset} <agent_session>            Check if an agent has drifted from truth
  ${c.green}intercept${c.reset} "<prompt>"             Test if a prompt would be intercepted
  ${c.green}protect${c.reset} "<prompt>"               Return hardened prompt (pipe-friendly)
  ${c.green}remember${c.reset} --old-node X --new-node Y --new-desc "..."
                                    Record a project truth change
  ${c.green}reconcile${c.reset} <agent> --consensus <node> --context "..."
                                    Reconcile agent memory with truth

${c.bold}Global Options:${c.reset}
  ${c.cyan}--backend${c.reset} <url>                  Korda backend URL ${c.dim}(default: $KORDA_BACKEND_URL or https://korda.onrender.com)${c.reset}

${c.bold}Align Options:${c.reset}
  ${c.cyan}--query${c.reset} "..."                    Custom alignment query
  ${c.cyan}--canonical${c.reset} <session>             Canonical session ID ${c.dim}(default: global)${c.reset}
  ${c.cyan}--fail-below${c.reset} <score>              Exit with code 1 if score is below threshold (CI/CD gate)

${c.bold}Intercept / Protect Options:${c.reset}
  ${c.cyan}--agent${c.reset} <session>                 Agent session ID for targeted correction
  ${c.cyan}--canonical${c.reset} <session>             Canonical session ID

${c.bold}Examples:${c.reset}
  ${c.dim}# Quick health check${c.reset}
  korda health --backend https://korda.onrender.com

  ${c.dim}# Check if an agent is drifted${c.reset}
  korda align agent_b --query "What database do we use?"

  ${c.dim}# CI gate: fail if alignment drops below 80%${c.reset}
  korda align agent_b --fail-below 80

  ${c.dim}# Test if a prompt would be intercepted${c.reset}
  korda intercept "Write a MySQL connection snippet"

  ${c.dim}# Get the hardened prompt for piping${c.reset}
  korda protect "Deploy via SSH to prod" | pbcopy

  ${c.dim}# Record a truth change${c.reset}
  korda remember --old-node mysql_57 --new-node postgres_16 --new-desc "Migrated to PostgreSQL 16"

  ${c.dim}# Reconcile an agent${c.reset}
  korda reconcile agent_b --consensus postgres_16 --context "PostgreSQL 16 is canonical"
`);
}
// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
    const { command, positional, flags } = parseArgs(process.argv);
    try {
        switch (command) {
            case "health":
                await cmdHealth(flags);
                break;
            case "align":
                await cmdAlign(positional, flags);
                break;
            case "intercept":
                await cmdIntercept(positional, flags);
                break;
            case "protect":
                await cmdProtect(positional, flags);
                break;
            case "remember":
                await cmdRemember(positional, flags);
                break;
            case "reconcile":
                await cmdReconcile(positional, flags);
                break;
            case "help":
            case "--help":
            case "-h":
                printHelp();
                break;
            case "version":
            case "--version":
            case "-v":
                console.log("@korda/sdk 0.1.1");
                break;
            default:
                console.error(`${c.red}Unknown command: ${command}${c.reset}\n`);
                printHelp();
                process.exit(1);
        }
    }
    catch (err) {
        if (err instanceof KordaError) {
            console.error(`\n${c.red}Korda error:${c.reset} ${err.message}`);
            console.error(`${c.dim}  Endpoint: ${err.endpoint}`);
            console.error(`  Backend:  ${err.backendUrl}${c.reset}\n`);
        }
        else if (err instanceof Error) {
            console.error(`\n${c.red}Error:${c.reset} ${err.message}\n`);
        }
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map