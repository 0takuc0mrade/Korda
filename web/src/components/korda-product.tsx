/* eslint-disable */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  API_BASE,
  BackendErrorDetails,
  BackendRequestError,
  KordaApiResult,
  CustomWorkflowInputs,
  buildCustomApi,
  canonicalTruthPayload,
  divergentAgentPayload,
  exampleInputs,
  kordaApi,
  reconcilePayload,
  stalePromptPayload,
} from "@/lib/korda-api";
import { useTheme } from "./ThemeProvider";

export type ThemeName = "light" | "dark";

type ThemeProps = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const navItems = [
  ["Product", "/#product"],
  ["Demo", "/demo"],
  ["Architecture", "/dashboard"],
  ["SDK", "/sdk"],
];

const timeline = [
  ["13:41", "Ingest", "Canonical truth updated", "A new launch rule became the project source of truth."],
  ["13:42", "Session", "Agent memory sampled", "One agent continued from a stale working belief."],
  ["13:43", "Align", "Divergence detected", "The session drifted below the safe alignment threshold."],
  ["13:44", "Intercept", "Prompt hardened", "A deprecated implementation path was blocked before execution."],
  ["13:45", "Reconcile", "Reality reconciled", "The correction was written back with provenance."],
  ["13:46", "Verify", "Recall verified", "The agent returned to healthy alignment."],
];

const sessions = [
  ["codegen-agent", "agent_b", "High", "old rollout path", "2m ago", "Diverged"],
  ["reviewer-agent", "agent_review", "91%", "minor missing context", "4m ago", "Watch"],
  ["planner-agent", "agent_plan", "98%", "aligned", "7m ago", "Healthy"],
];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function KordaLogo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Korda home">
      <div className="relative h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
        <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
        <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[var(--positive)]" />
        <span className="absolute left-[15px] top-[15px] h-2 w-2 rounded-full bg-[var(--warning)]" />
        <span className="absolute left-[11px] top-[13px] h-px w-4 rotate-45 bg-[var(--border-strong)]" />
        <span className="absolute left-[14px] top-[20px] h-px w-4 -rotate-45 bg-[var(--border-strong)]" />
      </div>
      <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Korda</span>
    </Link>
  );
}

export function ThemeToggle({ theme, setTheme }: ThemeProps) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
      aria-label="Toggle theme"
    >
      <span className={cx("h-2 w-2 rounded-full", isDark ? "bg-[var(--accent)]" : "bg-[var(--warning)]")} />
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "blue" }) {
  const toneClass = {
    neutral: "border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)]",
    good: "border-emerald-500/20 text-emerald-500 bg-emerald-500/10",
    warn: "border-amber-500/25 text-amber-500 bg-amber-500/10",
    bad: "border-rose-500/25 text-rose-500 bg-rose-500/10",
    blue: "border-blue-500/25 text-[var(--accent)] bg-blue-500/10",
  }[tone];

  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", toneClass)}>
      {children}
    </span>
  );
}

export function EndpointBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

export function GlassNavbar({ theme, setTheme }: ThemeProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <KordaLogo />
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(([label, href]) => (
            <Link key={label} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <Link href="/demo" className="group hidden items-center gap-2 rounded-xl bg-[rgba(0,132,255,0.8)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--glass-highlight)] transition hover:scale-[1.02] md:inline-flex">
            Run workflow
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[var(--accent)] transition group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function CapabilityBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="liquid-glass flex h-16 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-[var(--text-secondary)]">
      {children}
    </div>
  );
}

export function RealitySyncCard() {
  return (
    <div className="relative w-full max-w-[430px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Reality Sync</p>
          <h3 className="mt-1 text-xl font-semibold">Launch Systems</h3>
        </div>
        <StatusBadge tone="bad">Diverged</StatusBadge>
      </div>
      <div className="mt-5 grid gap-3">
        <div className="border-l-2 border-emerald-400 bg-emerald-500/5 py-3 pl-4">
          <div className="text-xs font-semibold text-emerald-500">Canonical Signal</div>
          <div className="mt-1 text-sm font-semibold">Release gate is locked</div>
        </div>
        <div className="relative border-l-2 border-rose-400 bg-rose-500/5 py-3 pl-4">
          <motion.span className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[var(--accent)]" animate={{ scale: [1, 1.7, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 1.8, repeat: Infinity }} />
          <div className="text-xs font-semibold text-rose-500">Agent Memory</div>
          <div className="mt-1 text-sm font-semibold">Old rollout path</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[var(--text-muted)]">Drift Pressure</div>
          <div className="mt-1 text-3xl font-semibold text-rose-500">High</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-muted)]">Correction</div>
          <div className="mt-2 text-sm font-semibold">Pull to source</div>
        </div>
      </div>
    </div>
  );
}

export function HeroOrbField() {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-[560px] overflow-visible">
      <div 
        className="pointer-events-none absolute -right-24 -top-16 h-[700px] w-[700px]"
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 68%)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 68%)"
        }}
      >
        <motion.video
          ref={(el) => { if (el) { el.defaultMuted = true; el.muted = true; } }}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          className={`h-full w-full object-contain [&::-webkit-media-controls]:hidden ${theme === 'light' ? 'mix-blend-multiply' : 'mix-blend-screen'}`}
          style={{ 
            filter: theme === 'light' 
              ? 'hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1) invert(1) hue-rotate(180deg)' 
              : 'hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1)' 
          }}
          animate={{ y: [0, -16, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <source src="https://future.co/images/homepage/glassy-orb/orb-purple.webm" type="video/webm" />
          <source src="https://future.co/images/homepage/glassy-orb/orb-purple.mp4" type="video/mp4" />
        </motion.video>
      </div>
      <div className="pointer-events-none absolute -right-24 top-8 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(96,177,255,0.22),transparent_64%)] blur-3xl" />
      <motion.div
        className="absolute left-0 top-24 hidden w-[72%] md:block"
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <svg viewBox="0 0 560 260" className="h-[260px] w-full overflow-visible">
          <motion.path d="M22 198 C150 92, 302 96, 522 38" fill="none" stroke="rgba(49,154,255,0.7)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.1 }} />
          <path d="M22 198 C178 172, 292 166, 512 190" fill="none" stroke="rgba(244,63,94,0.34)" strokeWidth="2" strokeDasharray="8 9" />
          <circle cx="22" cy="198" r="8" fill="var(--positive)" />
          <circle cx="522" cy="38" r="8" fill="var(--accent)" />
          <circle cx="512" cy="190" r="8" fill="var(--critical)" />
        </svg>
      </motion.div>
      <div className="absolute bottom-10 left-2 max-w-[390px] text-[var(--text-primary)] md:left-8">
        <RealitySyncCard />
      </div>
    </div>
  );
}

export function GlassyOrbHero() {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-[560px] overflow-visible">
      <div 
        className="pointer-events-none absolute -right-16 -top-12 h-[640px] w-[640px]"
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 68%)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 68%)"
        }}
      >
        <motion.video
          ref={(el) => { if (el) { el.defaultMuted = true; el.muted = true; } }}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          className={`h-full w-full object-contain [&::-webkit-media-controls]:hidden ${theme === 'light' ? 'mix-blend-multiply' : 'mix-blend-screen'}`}
          style={{ 
            filter: theme === 'light' 
              ? 'hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1) invert(1) hue-rotate(180deg)' 
              : 'saturate(200%) brightness(1.15) contrast(1.1)' 
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <source src="https://future.co/images/homepage/glassy-orb/orb-blue.webm" type="video/webm" />
          <source src="https://future.co/images/homepage/glassy-orb/orb-blue.mp4" type="video/mp4" />
        </motion.video>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(96,177,255,0.24),transparent_34rem)]" />
      <div className="absolute bottom-8 left-3 right-3 md:left-8 md:right-auto">
        <RealitySyncCard />
      </div>
    </div>
  );
}

export function FeatureCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="liquid-glass rounded-[24px] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(49,154,255,0.16)]">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">✦</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-[var(--text-secondary)]">{copy}</p>
    </div>
  );
}

export function DashboardPreview() {
  const { theme } = useTheme();
  return (
    <div className="liquid-glass relative min-h-[720px] overflow-hidden rounded-[32px] p-5 shadow-[0_40px_140px_rgba(49,154,255,0.18)]">
      <video
        ref={(el) => { if (el) { el.defaultMuted = true; el.muted = true; } }}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        className={cx("pointer-events-none absolute -right-28 -top-36 h-[760px] w-[760px] scale-125 object-contain opacity-90 [&::-webkit-media-controls]:hidden", theme === "light" ? "mix-blend-darken" : "mix-blend-screen")}
        style={{ 
          filter: theme === "light" ? "hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1) invert(1) hue-rotate(180deg)" : "hue-rotate(-55deg) saturate(250%) brightness(1.2) contrast(1.1)", 
          pointerEvents: "none",
          WebkitMaskImage: "radial-gradient(circle at center, black 35%, transparent 65%)",
          maskImage: "radial-gradient(circle at center, black 35%, transparent 65%)"
        }}
      >
        <source src="https://future.co/images/homepage/glassy-orb/orb-purple.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 soft-grid opacity-35" />
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <KordaLogo />
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="blue">Launch Systems</StatusBadge>
          <StatusBadge tone="good">Backend connected</StatusBadge>
          <StatusBadge tone="good">Memory online</StatusBadge>
        </div>
      </div>
      <div className="relative z-10 mt-12 grid gap-8 lg:grid-cols-[220px_1fr_300px]">
        <div className="hidden lg:block">
          <div className="liquid-glass rounded-[24px] p-3">
            {["Overview", "Reality Graph", "Agent Sessions", "Alignment Runs", "Intercepts", "Reconcile"].map((item, index) => (
              <div key={item} className={cx("rounded-2xl px-4 py-3 text-sm", index === 1 ? "bg-white/45 font-semibold text-[var(--text-primary)] shadow-inner" : "text-[var(--text-secondary)]")}>{item}</div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[500px]">
          <div className="absolute left-[8%] top-[8%]">
            <div className="liquid-glass rounded-[24px] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Canonical signal</div>
              <div className="mt-1 text-lg font-semibold text-emerald-500">Release gate is locked</div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">The source of truth has moved forward.</div>
            </div>
          </div>
          <div className="absolute right-[10%] top-[30%]">
            <div className="liquid-glass rounded-[24px] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">codegen-agent</div>
              <div className="mt-1 text-lg font-semibold text-rose-500">Old rollout path</div>
              <div className="mt-2 text-sm text-[var(--text-secondary)]">The session is still planning from a prior decision.</div>
            </div>
          </div>
          <div className="absolute bottom-[12%] left-[25%]">
            <div className="liquid-glass rounded-[24px] px-6 py-5">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Drift pressure</div>
              <div className="mt-1 text-6xl font-bold tracking-[-0.06em] text-rose-500">High</div>
              <div className="mt-2 text-xs text-[var(--text-muted)]">split: launch policy</div>
            </div>
          </div>
          <svg className="absolute inset-0 h-full w-full">
            <motion.path d="M130 95 C260 160, 360 165, 520 220" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8 }} />
            <path d="M520 220 C420 310, 325 340, 250 410" fill="none" stroke="rgba(244,63,94,0.35)" strokeWidth="2" strokeDasharray="7 7" />
          </svg>
        </div>
        <div className="liquid-glass self-start rounded-[24px] p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Inspector</div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">A belief went out of tune.</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Korda bent the next action back toward the project&apos;s current reality.</p>
          <div className="mt-5 space-y-3 text-xs">
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-500">Ship through the old path</div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">Hold for approved rollout</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({ label, value, caption, tone = "neutral" }: { label: string; value: string; caption: string; tone?: "neutral" | "good" | "warn" | "bad" | "blue" }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</span>
        <StatusBadge tone={tone}>{tone}</StatusBadge>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{caption}</p>
    </div>
  );
}

export function AlignmentScore({ score = 42, label = "agent_b" }: { score?: number; label?: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="9" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={score < 80 ? "var(--critical)" : "var(--positive)"}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold leading-none tracking-tight text-[var(--text-primary)]">
          <span className="mt-0.5">{score}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Alignment signal</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{label} compared against canonical truth.</p>
        <div className="mt-3"><StatusBadge tone={score < 80 ? "bad" : "good"}>{score < 80 ? "Diverged" : "Aligned"}</StatusBadge></div>
      </div>
    </div>
  );
}

export function RealityGraph({ compact = false }: { compact?: boolean }) {
  const nodes = [
    { id: "canonical", x: "50%", y: "14%", label: "Canonical truth", tone: "blue" },
    { id: "agentA", x: "16%", y: "60%", label: "Agent A", tone: "good" },
    { id: "agentB", x: "84%", y: "60%", label: "Agent B", tone: "bad" },
    { id: "stale", x: "78%", y: "36%", label: "Stale policy", sub: "deprecated", tone: "warn" },
    { id: "current", x: "22%", y: "36%", label: "Current policy", sub: "active", tone: "good" },
  ];

  return (
    <div className={cx("relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]", compact ? "h-[440px]" : "h-[540px]")}>
      <div className="absolute inset-0 soft-grid opacity-60" />
      <svg className="absolute inset-0 h-full w-full">
        <line x1="50%" y1="14%" x2="22%" y2="36%" stroke="var(--border-strong)" strokeWidth="1.5" />
        <line x1="50%" y1="14%" x2="78%" y2="36%" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="5 5" />
        <line x1="22%" y1="36%" x2="16%" y2="60%" stroke="var(--positive)" strokeOpacity="0.45" strokeWidth="1.5" />
        <line x1="78%" y1="36%" x2="84%" y2="60%" stroke="var(--critical)" strokeOpacity="0.55" strokeWidth="1.5" />
        <motion.line x1="22%" y1="36%" x2="84%" y2="60%" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
      </svg>
      <div className="absolute left-[50%] top-[36%] z-10 -translate-x-1/2 -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)] shadow-sm">
        superseded_by
      </div>
      {nodes.map((node) => (
        <div key={node.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: node.x, top: node.y }}>
          <div className={cx(
            "min-w-32 rounded-xl border bg-[var(--surface-elevated)] px-3 py-2 shadow-lg",
            node.tone === "bad" && "border-rose-500/30",
            node.tone === "warn" && "border-amber-500/30",
            node.tone === "good" && "border-emerald-500/30",
            node.tone === "blue" && "border-blue-500/30"
          )}>
            <div className="text-xs font-semibold text-[var(--text-primary)]">{node.label}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{node.sub ?? "source_of_truth"}</div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] p-3 backdrop-blur">
        <AlignmentScore score={42} label="agent_b" />
        <div className="hidden text-right md:block">
          <EndpointBadge>Align</EndpointBadge>
          <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">Korda traced the split to an old launch decision.</p>
        </div>
      </div>
    </div>
  );
}

export function AgentSessionTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid grid-cols-6 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        <span>Agent</span><span>Session</span><span>Score</span><span className="col-span-2">Divergence</span><span>Status</span>
      </div>
      {sessions.map(([agent, session, score, divergence, recall, status]) => (
        <div key={session} className="grid grid-cols-6 items-center border-b border-[var(--border)] px-4 py-4 text-sm last:border-b-0">
          <span className="font-medium text-[var(--text-primary)]">{agent}</span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">{session}</span>
          <span className={cx("font-semibold", status === "Diverged" ? "text-rose-500" : status === "Watch" ? "text-amber-500" : "text-emerald-500")}>{score}</span>
          <span className="col-span-2 text-[var(--text-secondary)]">{divergence}<span className="ml-2 text-xs text-[var(--text-muted)]">{recall}</span></span>
          <StatusBadge tone={status === "Diverged" ? "bad" : status === "Watch" ? "warn" : "good"}>{status}</StatusBadge>
        </div>
      ))}
    </div>
  );
}

export function PromptInterceptConsole() {
  const [prompt, setPrompt] = useState(stalePromptPayload.prompt);
  const [result, setResult] = useState("No correction requested yet.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BackendErrorDetails | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const response = await kordaApi.intercept();
      setResult(String(response.body.hardened_prompt ?? "Backend did not return a corrected prompt."));
    } catch (requestError) {
      if (requestError instanceof BackendRequestError) {
        setError(requestError.details);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Prompt intercept console</h3>
          <p className="text-sm text-[var(--text-secondary)]">Check stale facts before the prompt reaches the model.</p>
        </div>
        <StatusBadge tone={error ? "bad" : "good"}>{error ? "Backend error" : "Live backend"}</StatusBadge>
      </div>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={run} disabled={loading} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Checking..." : "Harden prompt"}</button>
        <button onClick={() => navigator.clipboard?.writeText(result)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">Copy corrected prompt</button>
      </div>
      {error && <BackendErrorPanel error={error} />}
      <pre className="mt-4 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--text-secondary)]">{result}</pre>
    </div>
  );
}

export function ReconciliationPanel({ before = 42, after = 94 }: { before?: number; after?: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Reality reconciliation</h3>
          <p className="text-sm text-[var(--text-secondary)]">Consensus truth is written back while stale memory is corrected.</p>
        </div>
        <EndpointBadge>Reconcile</EndpointBadge>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-rose-500">Before</div>
          <div className="mt-2 text-3xl font-semibold">{before}%</div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Agent believes the stale policy is still active.</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-500">After</div>
          <div className="mt-2 text-3xl font-semibold">{after}%</div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Stale correction written, canonical truth preserved.</p>
        </div>
      </div>
    </div>
  );
}

export function RunTimeline() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="font-semibold text-[var(--text-primary)]">Run timeline</h3>
      <div className="mt-5 space-y-4">
        {timeline.map(([time, endpoint, title, detail], index) => (
          <div key={title} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              {index < timeline.length - 1 && <div className="mt-1 h-12 w-px bg-[var(--border)]" />}
            </div>
            <div className="min-w-0 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">{time}</span>
                <EndpointBadge>{endpoint}</EndpointBadge>
              </div>
              <div className="mt-1 font-medium text-[var(--text-primary)]">{title}</div>
              <p className="text-sm text-[var(--text-secondary)]">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type BackendStatus = "checking" | "connected" | "unavailable" | "unknown";

type WorkflowStep = {
  title: string;
  receiptTitle: string;
  endpoint: string;
  payload: Record<string, unknown>;
  action: () => Promise<KordaApiResult>;
};

const latestRunStorageKey = "korda.latestRunEvidence.v1";

function formatTime(timestamp?: string) {
  if (!timestamp) return "Not returned by backend";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function bodyValue(body: Record<string, unknown> | undefined, key: string) {
  const value = body?.[key];
  return value === undefined || value === null || value === "" ? "Not returned by backend" : String(value);
}

function alignmentScore(result?: KordaApiResult) {
  const value = result?.body.alignment_score;
  return typeof value === "number" ? `${value}%` : "Not returned by backend";
}

function evidenceSummary(title: string, result: KordaApiResult) {
  const body = result.body;
  if (title === "Alignment completed" || title === "Recall verified") {
    const drift = body.status === "diverged" || body.divergence_detected === true ? "detected" : "not detected";
    return `Score: ${bodyValue(body, "alignment_score")}% · Divergence: ${drift}`;
  }
  if (title === "Prompt intercepted") {
    return body.status === "intercepted" ? "Stale prompt hardened before execution." : "Prompt cleared by backend.";
  }
  if (title === "Reconciliation completed") {
    const purge = body.purge_result as Record<string, unknown> | undefined;
    const method = purge?.mode === "forget" ? "direct memory deletion" : "stale correction recorded";
    return `Status: ${bodyValue(body, "status")} · Method: ${method}`;
  }
  return body.message ? String(body.message) : "Backend accepted the step.";
}

function buildRunSummary(results: Array<KordaApiResult | undefined>) {
  const alignBefore = results[2];
  const intercept = results[3];
  const reconcile = results[4];
  const alignAfter = results[5];
  const completed = results.filter(Boolean).length;
  const driftDetected = alignBefore?.body.status === "diverged" || alignBefore?.body.divergence_detected === true;
  const promptHardened = intercept?.body.status === "intercepted";

  return [
    "Agent realignment complete",
    `Canonical session: ${bodyValue(alignAfter?.body ?? alignBefore?.body, "canonical_session_id")}`,
    `Agent session: ${bodyValue(alignAfter?.body ?? alignBefore?.body, "agent_session_id")}`,
    `Initial alignment score: ${alignmentScore(alignBefore)}`,
    `Final alignment score: ${alignmentScore(alignAfter)}`,
    `Drift detected: ${driftDetected ? "yes" : "no"}`,
    `Prompt hardened: ${promptHardened ? "yes" : "no"}`,
    `Reconciliation status: ${bodyValue(reconcile?.body, "status")}`,
    `Recall verified: ${alignAfter?.body.status === "aligned" ? "yes" : "no"}`,
    `Total backend steps completed: ${completed}`,
  ].join("\n");
}

export function BackendErrorPanel({ error }: { error: BackendErrorDetails }) {
  return (
    <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-semibold text-rose-500">Backend request failed</div>
        <StatusBadge tone="bad">{error.statusCode ? `HTTP ${error.statusCode}` : "Unavailable"}</StatusBadge>
      </div>
      <div className="mt-3 grid gap-2 text-[var(--text-secondary)] md:grid-cols-2">
        <div><span className="font-semibold text-[var(--text-primary)]">Endpoint:</span> {error.endpoint}</div>
        <div><span className="font-semibold text-[var(--text-primary)]">Backend:</span> {error.backendUrl}</div>
      </div>
      <p className="mt-3 text-[var(--text-primary)]">{error.message}</p>
      <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Likely fix</div>
      <ul className="mt-2 grid gap-1 text-[var(--text-secondary)] md:grid-cols-2">
        {error.likelyFixes.map((fix) => <li key={fix}>- {fix}</li>)}
      </ul>
    </div>
  );
}

function RunEvidence({ steps, results }: { steps: WorkflowStep[]; results: Array<KordaApiResult | undefined> }) {
  const completed = results.map((result, index) => ({ result, step: steps[index] })).filter((item): item is { result: KordaApiResult; step: WorkflowStep } => Boolean(item.result));

  return (
    <section className="liquid-glass rounded-[28px] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Run Evidence</div>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">Backend receipts for this run.</h3>
        </div>
        <StatusBadge tone={completed.length === steps.length ? "good" : "blue"}>{completed.length}/{steps.length} completed</StatusBadge>
      </div>
      <div className="mt-6 space-y-3">
        {completed.length === 0 && <p className="text-sm text-[var(--text-secondary)]">Run a backend step to start the audit trail.</p>}
        {completed.map(({ result, step }) => (
          <details key={`${step.title}-${result.timestamp}`} className="group rounded-2xl bg-white/35 p-4 backdrop-blur-sm dark:bg-white/5">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{step.receiptTitle}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <EndpointBadge>{step.endpoint}</EndpointBadge>
                  <span>{formatTime(result.timestamp)}</span>
                </div>
              </div>
              <StatusBadge tone="good">HTTP {result.statusCode}</StatusBadge>
            </summary>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{evidenceSummary(step.receiptTitle, result)}</p>
            <pre className="mt-3 max-h-[320px] w-full overflow-auto rounded-xl bg-[var(--surface-muted)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">{JSON.stringify(result.body, null, 2)}</pre>
          </details>
        ))}
      </div>
    </section>
  );
}

function ReconciliationVisual({ results }: { results: Array<KordaApiResult | undefined> }) {
  const before = results[2];
  const reconcile = results[4];
  const after = results[5];
  const purge = reconcile?.body.purge_result as Record<string, unknown> | undefined;
  const method = purge?.mode === "forget" ? "Direct memory deletion" : reconcile ? "Stale correction recorded" : "Not returned by backend";

  return (
    <section className="liquid-glass rounded-[28px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Reconciliation</div>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">Belief drift repaired without losing intent.</h3>
        </div>
        <StatusBadge tone={after?.body.status === "aligned" ? "good" : "warn"}>{after?.body.status === "aligned" ? "Recall verified" : "Awaiting recall"}</StatusBadge>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="border-l-2 border-rose-400 pl-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-rose-500">Before</div>
          <p className="mt-2 font-semibold">Agent belief drifted from canonical truth.</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Initial alignment: {alignmentScore(before)}</p>
        </div>
        <div className="border-l-2 border-[var(--accent)] pl-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Canonical</div>
          <p className="mt-2 font-semibold">Approved project reality.</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Current implementation path preserved as canonical project truth.</p>
        </div>
        <div className="border-l-2 border-emerald-400 pl-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-500">After</div>
          <p className="mt-2 font-semibold">Agent session corrected.</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Final alignment: {alignmentScore(after)}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
        <div><span className="text-[var(--text-muted)]">Correction:</span> {bodyValue(reconcile?.body, "message")}</div>
        <div><span className="text-[var(--text-muted)]">Repair method:</span> {method}</div>
        <div><span className="text-[var(--text-muted)]">Recall:</span> {after?.body.status === "aligned" ? "verified" : "Not returned by backend"}</div>
      </div>
    </section>
  );
}

function RunSummary({ results }: { results: Array<KordaApiResult | undefined> }) {
  const complete = results.filter(Boolean).length === 6;
  const summary = buildRunSummary(results);

  if (!complete) return null;

  return (
    <section className="liquid-glass rounded-[28px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Run summary</div>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">Agent realignment complete</h3>
        </div>
        <button onClick={() => navigator.clipboard?.writeText(summary)} className="rounded-xl bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-[var(--background)]">Copy run summary</button>
      </div>
      <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-[var(--surface-muted)] p-4 text-sm leading-7 text-[var(--text-secondary)]">{summary}</pre>
    </section>
  );
}

function WorkflowSetup({ onStart }: { onStart: (inputs: CustomWorkflowInputs) => void }) {
  const [inputs, setInputs] = useState<CustomWorkflowInputs>({
    canonicalTruth: "",
    agentBelief: "",
    stalePrompt: "",
    contextType: "",
  });

  const canStart = inputs.canonicalTruth.trim() && inputs.agentBelief.trim() && inputs.stalePrompt.trim();

  function fillExample() {
    setInputs({ ...exampleInputs });
  }

  return (
    <div className="space-y-6">
      <div className="liquid-glass rounded-[28px] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Your workflow</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Describe the agent conflict.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Tell Korda what the canonical project truth is, what the agent currently believes, and the stale prompt it would use. Korda will run the full drift detection and reconciliation loop against your inputs.
            </p>
          </div>
          <button onClick={fillExample} className="group flex items-center gap-2 rounded-xl bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--accent)] shadow-sm ring-1 ring-inset ring-[var(--accent)]/30 transition hover:bg-[var(--accent)]/10 hover:ring-[var(--accent)]">
            Use example data
          </button>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-500">Canonical truth</span>
            <textarea
              value={inputs.canonicalTruth}
              onChange={(e) => setInputs({ ...inputs, canonicalTruth: e.target.value })}
              placeholder="What is the current agreed truth?  e.g. 'We migrated the database to PostgreSQL 16.'"
              className="min-h-24 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-emerald-500"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-rose-500">Agent belief</span>
            <textarea
              value={inputs.agentBelief}
              onChange={(e) => setInputs({ ...inputs, agentBelief: e.target.value })}
              placeholder="What does the agent incorrectly believe?  e.g. 'The database is still MySQL 5.7.'"
              className="min-h-24 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-rose-500"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-amber-500">Stale prompt</span>
            <textarea
              value={inputs.stalePrompt}
              onChange={(e) => setInputs({ ...inputs, stalePrompt: e.target.value })}
              placeholder="What prompt would the agent write using its stale belief?  e.g. 'Write the connection string for MySQL 5.7.'"
              className="min-h-20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-amber-500"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Context type <span className="normal-case font-normal">(optional)</span></span>
            <input
              type="text"
              value={inputs.contextType}
              onChange={(e) => setInputs({ ...inputs, contextType: e.target.value })}
              placeholder="e.g. Database Migration, API Versioning, Infrastructure"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => canStart && onStart(inputs)}
            disabled={!canStart}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(49,154,255,0.2)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            Start workflow →
          </button>
          {!canStart && <span className="text-xs text-[var(--text-muted)]">Fill all three fields to continue.</span>}
        </div>
      </div>
    </div>
  );
}

export function DemoStepper() {
  const [phase, setPhase] = useState<"setup" | "run">("setup");
  const [workflowInputs, setWorkflowInputs] = useState<CustomWorkflowInputs | null>(null);
  const [customApi, setCustomApi] = useState<ReturnType<typeof buildCustomApi> | null>(null);

  function handleStart(inputs: CustomWorkflowInputs) {
    const api = buildCustomApi(inputs);
    setWorkflowInputs(inputs);
    setCustomApi(api);
    setPhase("run");
  }

  function handleReset() {
    setPhase("setup");
    setWorkflowInputs(null);
    setCustomApi(null);
  }

  if (phase === "setup" || !customApi || !workflowInputs) {
    return <WorkflowSetup onStart={handleStart} />;
  }

  return <DemoStepperRunner api={customApi} inputs={workflowInputs} onReset={handleReset} />;
}

function DemoStepperRunner({ api, inputs, onReset }: { api: ReturnType<typeof buildCustomApi>; inputs: CustomWorkflowInputs; onReset: () => void }) {
  const steps = useMemo<WorkflowStep[]>(() => [
    { title: "Ingest canonical truth", receiptTitle: "Canonical truth ingested", endpoint: "POST /webhook/stream", action: api.ingestCanonical, payload: api.payloads.canonical },
    { title: "Add agent belief", receiptTitle: "Agent belief ingested", endpoint: "POST /webhook/stream", action: api.ingestDivergent, payload: api.payloads.divergent },
    { title: "Run alignment", receiptTitle: "Alignment completed", endpoint: "POST /api/v1/align", action: api.alignBefore, payload: api.payloads.align },
    { title: "Intercept stale prompt", receiptTitle: "Prompt intercepted", endpoint: "POST /api/v1/intercept", action: api.intercept, payload: api.payloads.intercept },
    { title: "Reconcile reality", receiptTitle: "Reconciliation completed", endpoint: "POST /api/v1/reconcile", action: api.reconcile, payload: api.payloads.reconcile },
    { title: "Verify recall", receiptTitle: "Recall verified", endpoint: "POST /api/v1/align", action: api.alignAfter, payload: api.payloads.align },
  ], [api]);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<Array<KordaApiResult | undefined>>([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [error, setError] = useState<BackendErrorDetails | null>(null);

  useEffect(() => {
    api.health()
      .then(() => setBackendStatus("connected"))
      .catch((requestError) => {
        setBackendStatus(requestError instanceof BackendRequestError ? "unavailable" : "unknown");
        if (requestError instanceof BackendRequestError) setError(requestError.details);
      });
  }, [api]);

  async function executeStep(index: number) {
    setActive(index);
    setError(null);
    const response = await steps[index].action();
    setBackendStatus("connected");
    setResults((current) => {
      const next = [...current];
      next[index] = response;
      return next;
    });
    setActive(Math.min(index + 1, steps.length - 1));
    return response;
  }

  async function runStep(index: number) {
    setLoading(true);
    try {
      await executeStep(index);
    } catch (requestError) {
      if (requestError instanceof BackendRequestError) {
        setBackendStatus("unavailable");
        setError(requestError.details);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runAll() {
    setLoading(true);
    try {
      for (let index = 0; index < steps.length; index += 1) {
        await executeStep(index);
      }
    } catch (requestError) {
      if (requestError instanceof BackendRequestError) {
        setBackendStatus("unavailable");
        setError(requestError.details);
      }
    } finally {
      setLoading(false);
    }
  }

  const selected = steps[active];
  const selectedResult = results[active];
  const statusTone = backendStatus === "connected" ? "good" : backendStatus === "unavailable" ? "bad" : "warn";
  const statusLabel = backendStatus === "connected" ? "Backend connected" : backendStatus === "unavailable" ? "Backend unavailable" : backendStatus === "checking" ? "Checking backend" : "Backend status unknown";

  return (
    <div className="space-y-6">
      <div className="liquid-glass rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="blue">{inputs.contextType || "Custom Workflow"}</StatusBadge>
          <div className="flex-1" />
          <button onClick={onReset} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-strong)]">
            ← New workflow
          </button>
        </div>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">Canonical truth</div>
            <div className="mt-1 text-[var(--text-primary)]">{inputs.canonicalTruth}</div>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">Agent belief</div>
            <div className="mt-1 text-[var(--text-primary)]">{inputs.agentBelief}</div>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Stale prompt</div>
            <div className="mt-1 text-[var(--text-primary)]">{inputs.stalePrompt}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="liquid-glass min-w-0 rounded-[28px] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
            <button onClick={runAll} disabled={loading || backendStatus === "unavailable"} className="rounded-lg bg-[var(--text-primary)] px-3 py-2 text-xs font-semibold text-[var(--background)] disabled:opacity-50">Run all</button>
          </div>
          <div className="mb-4 rounded-2xl bg-white/35 p-3 text-xs text-[var(--text-secondary)] dark:bg-white/5">
            Backend: {API_BASE.replace("http://", "")}
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button key={step.title} onClick={() => setActive(index)} className={cx("flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition", active === index ? "border-[var(--accent)] bg-blue-500/10" : "border-[var(--border)] hover:border-[var(--border-strong)]")}>
                <span className="text-sm font-medium">{step.title}</span>
                <StatusBadge tone={results[index] ? "good" : "neutral"}>{results[index] ? "live" : index + 1}</StatusBadge>
              </button>
            ))}
          </div>
        </div>
        <div className="liquid-glass min-w-0 rounded-[28px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{selected.title}</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Run each stage against the live Korda backend.</p>
            </div>
            <button onClick={() => runStep(active)} disabled={loading} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {loading ? "Running..." : selected.title}
            </button>
          </div>
          {error && <BackendErrorPanel error={error} />}
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Request</div>
              <pre className="max-h-[440px] w-full overflow-auto rounded-2xl bg-[var(--surface-muted)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
            <div className="min-w-0">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Response</div>
              <pre className="max-h-[440px] w-full overflow-auto rounded-2xl bg-[var(--surface-muted)] p-4 text-xs leading-relaxed text-[var(--text-secondary)]">{JSON.stringify(selectedResult?.body ?? { status: "waiting_for_backend_step" }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
      <RunEvidence steps={steps} results={results} />
      <ReconciliationVisual results={results} />
      <RunSummary results={results} />
    </div>
  );
}

export function ImplementationStatus() {
  const rows = [
    ["Backend", "Online-ready"],
    ["Memory layer", "Session-aware"],
    ["Frontend", "Production build passing"],
    ["Run recorder", "Ready to run"],
    ["Live validation", "Requires cloud credentials"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <StatusBadge tone="blue">Implementation status</StatusBadge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Built against the actual Korda backend.</h2>
            <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">The product surface stays clean while run reports preserve the technical evidence underneath.</p>
          </div>
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--border)]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="font-medium text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
