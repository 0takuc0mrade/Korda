"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import {
  KordaLogo,
  RunTimeline,
  StatusBadge,
  ThemeName,
  ThemeToggle,
} from "@/components/korda-product";

const nav = ["Overview", "Reality Graph", "Agent Sessions", "Alignment Runs", "Intercepts", "Reconcile", "Sources"];
const agents = [
  ["codegen-agent", "At risk", "stale release policy", "Diverged"],
  ["reviewer-agent", "91%", "minor missing context", "Watch"],
  ["planner-agent", "98%", "aligned", "Healthy"],
];

function statusTone(status: string) {
  if (status === "Diverged") return "bad" as const;
  if (status === "Watch") return "warn" as const;
  return "good" as const;
}

export default function Dashboard() {
  const { theme, setTheme } = useTheme();

  return (
    <main data-theme={theme} className="korda-page min-h-screen overflow-hidden text-[var(--text-primary)]">
      <div className="pointer-events-none fixed -right-40 -top-44 z-0 h-[860px] w-[860px] opacity-80">
        {theme === "light" && (
          <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black blur-[100px]" />
        )}
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          className="h-full w-full scale-125 object-contain mix-blend-screen [&::-webkit-media-controls]:hidden"
          style={{ 
            filter: "hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1)", 
            pointerEvents: "none",
            WebkitMaskImage: "radial-gradient(closest-side, black 40%, transparent 100%)",
            maskImage: "radial-gradient(closest-side, black 40%, transparent 100%)"
          }}
        >
          <source src="https://future.co/images/homepage/glassy-orb/orb-purple.webm" type="video/webm" />
        </video>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 md:px-8">
        <header className="liquid-glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
          <KordaLogo />
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <StatusBadge tone="blue">Launch Systems</StatusBadge>
              <StatusBadge tone="good">Backend connected</StatusBadge>
              <StatusBadge tone="good">Memory online</StatusBadge>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <Link href="/demo" className="rounded-2xl bg-[rgba(0,132,255,0.8)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--glass-highlight)]">Run workflow</Link>
          </div>
        </header>

        <div className="mt-8 grid flex-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)_340px]">
          <aside className="hidden lg:block">
            <div className="liquid-glass sticky top-8 rounded-[24px] p-3">
              {nav.map((item, index) => (
                <button key={item} className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${index === 1 ? "bg-white/50 font-semibold shadow-inner" : "text-[var(--text-secondary)] hover:bg-white/30"}`}>
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <section className="relative flex min-h-[740px] flex-col gap-4 overflow-hidden rounded-[32px] p-4 md:block md:p-0">
            <div className="absolute inset-0 soft-grid opacity-40" />
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 md:absolute md:inset-x-0 md:top-0 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Reality operations</p>
                <h1 className="mt-2 text-5xl font-bold tracking-[-0.05em] md:text-7xl">Split-brain detected.</h1>
              </div>
              <div className="liquid-glass rounded-[24px] px-5 py-4 text-right">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Alignment</div>
                <div className="mt-1 text-5xl font-bold tracking-[-0.06em] text-rose-500">Drift</div>
              </div>
            </div>

            <div className="absolute inset-0 hidden md:block">
              <svg className="h-full w-full">
                <motion.path d="M210 250 C410 145, 560 160, 760 315" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.6 }} />
                <path d="M760 315 C610 450, 510 500, 350 610" fill="none" stroke="rgba(244,63,94,0.35)" strokeWidth="2" strokeDasharray="8 8" />
                <path d="M210 250 C230 420, 260 520, 350 610" fill="none" stroke="rgba(16,185,129,0.35)" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative z-10 w-full md:absolute md:left-[5%] md:top-[24%] md:w-auto">
              <div className="liquid-glass rounded-[28px] px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Canonical signal</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-500">Release gate is locked</div>
                <p className="mt-2 max-w-[220px] text-sm text-[var(--text-secondary)]">The project has moved to approval-first rollout.</p>
              </div>
            </div>

            <div className="relative z-10 w-full md:absolute md:right-[8%] md:top-[34%] md:w-auto">
              <div className="liquid-glass rounded-[28px] px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">codegen-agent memory</div>
                <div className="mt-2 text-2xl font-semibold text-rose-500">Old rollout path</div>
                <p className="mt-2 max-w-[240px] text-sm text-[var(--text-secondary)]">The agent is still optimizing for a deprecated launch rule.</p>
              </div>
            </div>

            <div className="relative z-10 mt-4 w-full md:absolute md:bottom-[8%] md:left-[18%] md:right-[8%] md:mt-0 md:w-auto">
              <div className="liquid-glass rounded-[28px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Correction stream</div>
                    <p className="mt-2 text-lg font-semibold">Old rollout memory is being pulled back to canonical launch policy.</p>
                  </div>
                  <StatusBadge tone="warn">Prompt hardening required</StatusBadge>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {agents.map(([agent, score, split, status]) => (
                    <div key={agent} className="rounded-2xl bg-white/35 p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{agent}</span>
                        <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
                      </div>
                      <div className="mt-3 text-3xl font-bold tracking-[-0.05em]">{score}</div>
                      <div className="mt-1 font-mono text-xs text-[var(--text-muted)]">{split}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="liquid-glass rounded-[28px] p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Inspector</div>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">A belief went out of tune.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Korda caught the agent leaning on an older launch rule and bent the next prompt back toward the project’s current reality.</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-2xl bg-rose-500/10 p-4 text-rose-500">
                  <span className="block text-xs font-semibold uppercase tracking-widest opacity-70">Before</span>
                  “Ship through the old path.”
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600">
                  <span className="block text-xs font-semibold uppercase tracking-widest opacity-70">After</span>
                  “Hold for approved rollout.”
                </div>
              </div>
            </div>
            <div className="liquid-glass rounded-[28px] p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Session field</div>
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex justify-between text-sm"><span>Canonical pull</span><span className="text-emerald-500">strong</span></div>
                  <div className="mt-2 h-2 rounded-full bg-black/5"><div className="h-2 w-[88%] rounded-full bg-emerald-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm"><span>Memory drift</span><span className="text-rose-500">rising</span></div>
                  <div className="mt-2 h-2 rounded-full bg-black/5"><div className="h-2 w-[62%] rounded-full bg-rose-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm"><span>Correction confidence</span><span className="text-[var(--accent)]">ready</span></div>
                  <div className="mt-2 h-2 rounded-full bg-black/5"><div className="h-2 w-[76%] rounded-full bg-[var(--accent)]" /></div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <RunTimeline />
          <div className="liquid-glass rounded-[28px] p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Reconciliation</div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">The agent returns to the project’s center of gravity.</h2>
            <p className="mt-4 text-[var(--text-secondary)]">The old belief is not hidden. It is marked, explained, and replaced with the agreed reality.</p>
            <div className="mt-6 flex flex-wrap items-end gap-8">
              <div><div className="text-sm text-[var(--text-muted)]">Before</div><div className="text-5xl font-bold text-rose-500">Drift</div></div>
              <div className="pb-3 text-3xl text-[var(--text-muted)]">→</div>
              <div><div className="text-sm text-[var(--text-muted)]">After</div><div className="text-5xl font-bold text-emerald-500">Synced</div></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
