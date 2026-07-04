"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AlignmentScore,
  GlassNavbar,
  ReconciliationPanel,
  RunTimeline,
  StatusBadge,
  ThemeName,
} from "@/components/korda-product";

export default function RunReportPage() {
  const [theme, setTheme] = useState<ThemeName>("light");
  const params = useParams<{ id: string }>();

  return (
    <main data-theme={theme} className="korda-page min-h-screen text-[var(--text-primary)]">
      <GlassNavbar theme={theme} setTheme={setTheme} />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <StatusBadge tone="blue">Run report</StatusBadge>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight">Drift report: {params.id}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
          A compact trace of the launch workflow: stale context detected, prompt hardened, and agent memory reconciled with canonical truth.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <AlignmentScore score={94} label="agent_b after reconciliation" />
            </div>
            <ReconciliationPanel before={42} after={94} />
          </div>
          <RunTimeline />
        </div>
      </section>
    </main>
  );
}
