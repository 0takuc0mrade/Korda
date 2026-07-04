"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import {
  GlassNavbar,
  StatusBadge,
  ThemeName,
} from "@/components/korda-product";

const installSnippet = `import { KordaClient } from "@korda/sdk";

const korda = new KordaClient({
  baseUrl: process.env.KORDA_BACKEND_URL!,
});`;

const interceptSnippet = `const correction = await korda.intercept(agentPrompt);

const promptForModel =
  correction.status === "intercepted"
    ? correction.hardened_prompt
    : agentPrompt;

return model.generate(promptForModel);`;

const alignSnippet = `await korda.rememberDecision({
  type: "decision_update",
  session_id: "global",
  context_type: "Launch Coordination",
  old_node_id: "old rollout path",
  new_node_id: "approved release gate",
  update_reason: "Team moved to approval-first rollout."
});

const alignment = await korda.align(
  "agent_b",
  "What is the active launch rule?"
);`;

const steps = [
  ["1", "Remember project truth", "Write canonical decisions and agent-specific belief into Korda sessions."],
  ["2", "Check belief drift", "Compare an agent session against canonical project truth before important work."],
  ["3", "Harden the prompt", "Preserve the user’s original intent while replacing stale context with current reality."],
  ["4", "Record reconciliation", "When humans or agents agree on the truth, write the correction and verify recall."],
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-2xl bg-[var(--surface-muted)] p-5 text-sm leading-7 text-[var(--text-secondary)]">
      <code>{children}</code>
    </pre>
  );
}

export default function SdkPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main data-theme={theme} className="korda-page min-h-screen text-[var(--text-primary)]">
      <GlassNavbar theme={theme} setTheme={setTheme} />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-4xl">
          <StatusBadge tone="blue">SDK integration</StatusBadge>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-6xl">Put Korda in the agent loop.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
            Korda should be used where agent intent turns into action: before model calls, code generation, tool execution, runbooks, and release workflows.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            {steps.map(([number, title, copy]) => (
              <div key={title} className="flex gap-4 border-l border-[var(--border)] pl-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">{number}</div>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="liquid-glass rounded-[28px] p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">TypeScript client</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Current SDK surface</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              The SDK wraps Korda’s live backend endpoints. It is intentionally small so teams can drop it into existing agent runners without adopting a new framework.
            </p>
            <div className="mt-6 space-y-5">
              <CodeBlock>{installSnippet}</CodeBlock>
              <CodeBlock>{interceptSnippet}</CodeBlock>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Memory writes</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Keep canonical and agent sessions separate.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Use `global` for canonical project truth and a stable session id for each agent or collaborator.
            </p>
            <div className="mt-5">
              <CodeBlock>{alignSnippet}</CodeBlock>
            </div>
          </div>

          <div className="rounded-[28px] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] p-6 backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Where it fits</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Korda sits before action.</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--text-secondary)]">
              <p>Before an agent writes code, runs a migration, drafts a release plan, or calls a tool, send the intended prompt through Korda.</p>
              <p>If belief drift is detected, Korda returns a hardened prompt that keeps the original intent but swaps stale assumptions for canonical truth.</p>
              <p>After reconciliation, verify recall so the next agent run starts from repaired memory.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
