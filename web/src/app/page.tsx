"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  GlassNavbar,
  HeroOrbField,
  StatusBadge,
  ThemeName,
} from "@/components/korda-product";

const essentials = [
  ["Compare", "Agent belief is checked against canonical project truth."],
  ["Intercept", "Stale prompts are corrected before they reach the model."],
  ["Reconcile", "Agreed truth is recorded and recall is verified after repair."],
];

export default function LandingPage() {
  const [theme, setTheme] = useState<ThemeName>("light");

  return (
    <main data-theme={theme} className="korda-page min-h-screen overflow-hidden text-[var(--text-primary)]">
      <GlassNavbar theme={theme} setTheme={setTheme} />

      <section className="relative z-10 mx-auto grid max-w-[1600px] gap-10 px-4 pb-16 pt-16 md:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,0.85fr)] lg:items-center lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <StatusBadge tone="blue">Shared reality engine for AI agents</StatusBadge>
          <h1 className="mt-7 max-w-4xl text-[clamp(3.5rem,6vw,4.75rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]">
            Keep every agent anchored to the same truth
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 tracking-[-0.02em] text-[var(--text-secondary)]">
            Korda compares agent belief against canonical project memory, detects drift before execution, corrects stale prompts, and records reconciliation when reality changes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo" className="group inline-flex items-center gap-3 rounded-2xl bg-[rgba(0,132,255,0.8)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--glass-highlight),0_20px_70px_rgba(49,154,255,0.25)] backdrop-blur-sm transition hover:scale-[1.02]">
              Run workflow
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--accent)] transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link href="/sdk" className="liquid-glass rounded-2xl px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:scale-[1.02]">
              Use the SDK
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <HeroOrbField />
        </motion.div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div>
            <StatusBadge tone="warn">Belief drift control</StatusBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">The loop is intentionally small.</h2>
            <p className="mt-4 leading-7 text-[var(--text-secondary)]">
              Korda sits between agent memory and action. It does not replace your agents; it keeps their working context honest.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {essentials.map(([title, copy]) => (
              <div key={title} className="border-l border-[var(--border-strong)] pl-5">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-5 rounded-[28px] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] p-6 backdrop-blur md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Build Korda into real workflows.</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Use the live backend directly today, or wrap it with the included TypeScript client.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sdk" className="rounded-xl bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--background)]">Open SDK</Link>
            <Link href="/dashboard" className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold">View architecture</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
