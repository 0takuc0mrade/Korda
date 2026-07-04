"use client";

import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import {
  DemoStepper,
  GlassNavbar,
  RealityGraph,
  StatusBadge,
  ThemeName,
} from "@/components/korda-product";

export default function DemoPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main data-theme={theme} className="korda-page min-h-screen text-[var(--text-primary)]">
      <GlassNavbar theme={theme} setTheme={setTheme} />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <StatusBadge tone="blue">Interactive workflow</StatusBadge>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight">Run Korda’s agent drift loop.</h1>
            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
              Run canonical truth ingestion, agent belief comparison, prompt hardening, reconciliation, and recall verification against the live Korda backend.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/dashboard" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold">Open dashboard</Link>
              <Link href="/runs/demo-launch-reconcile" className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">View run report</Link>
            </div>
          </div>
          <RealityGraph compact />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <DemoStepper />
      </section>
    </main>
  );
}
