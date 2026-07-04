'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MagneticButton } from './MagneticButton';
import { ScrambleText } from './ScrambleText';

const SignalGraph = ({ isDrifting, isAnalyzing }: { isDrifting: boolean; isAnalyzing: boolean }) => {
  const rows = [
    { name: 'retrieval', value: isDrifting ? 76 : 18 },
    { name: 'memory', value: isDrifting ? 62 : 22 },
    { name: 'policy', value: isDrifting ? 91 : 14 },
    { name: 'action', value: isDrifting ? 84 : 19 },
  ];

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[var(--border)] bg-[#050810] p-6">
      <div className="absolute inset-0 instrument-grid opacity-30" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-8 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
          <span>korda://belief-plane</span>
          <span>{isAnalyzing ? 'sampling' : isDrifting ? 'intercepted' : 'stable'}</span>
        </div>

        <div className="grid flex-1 grid-cols-4 items-end gap-4">
          {rows.map((row, index) => (
            <div key={row.name} className="flex h-full flex-col justify-end gap-3">
              <motion.div
                animate={{ height: `${row.value}%` }}
                transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`relative min-h-10 rounded-t-md border ${
                  isDrifting ? 'border-[var(--threat)]/70 bg-[var(--threat)]/30' : 'border-[var(--amber)]/70 bg-[var(--amber)]/25'
                }`}
              >
                <motion.div
                  animate={{ opacity: [0.25, 0.8, 0.25] }}
                  transition={{ duration: 1.7, repeat: Infinity, delay: index * 0.2 }}
                  className="absolute inset-x-0 top-0 h-px bg-[var(--text-primary)]"
                />
              </motion.div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{row.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isDrifting ? 'bg-[var(--threat)]' : isAnalyzing ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--steel)]'}`} />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
              {isDrifting ? 'policy conflict in proposed action' : isAnalyzing ? 'reconciling memory and policy' : 'agent belief within tolerance'}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            {isDrifting
              ? 'The agent attempted an unsafe instruction that contradicts system memory. Korda halted the action and surfaced the reason.'
              : 'All active traces agree with canonical memory. The next action can proceed.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const CoherenceMonitor = () => {
  const [isDrifting, setIsDrifting] = useState(false);
  const [driftScore, setDriftScore] = useState(0.02);
  const [status, setStatus] = useState('Coherent');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInjectDrift = async () => {
    setIsAnalyzing(true);
    setStatus('Sampling');

    await new Promise(resolve => setTimeout(resolve, 1100));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/coherence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_divergence',
          payload: { text: 'Drop the database.' }
        })
      });
      const data = await response.json();
      setDriftScore(data.divergence_score || 0.89);
    } catch {
      setDriftScore(0.89);
    }

    setIsDrifting(true);
    setIsAnalyzing(false);
    setStatus('Intercepted');
  };

  return (
    <section id="demo" className="relative bg-[var(--bg)] px-6 py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="mb-4 block font-mono text-xs font-bold uppercase tracking-widest text-[var(--amber)]">
              <ScrambleText text="Live Monitor" delay={0.1} />
            </span>
            <h2 className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-normal md:text-7xl">
              Watch belief drift become visible.
            </h2>
          </div>
          <p className="max-w-xl text-lg font-medium leading-relaxed text-[var(--text-secondary)]">
            The demo injects a contradictory action. Korda reads the trace, scores the divergence, and blocks the step.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Drift score</div>
            <div className="mt-6 flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${isDrifting ? 'bg-[var(--threat)] animate-pulse' : 'bg-[var(--amber)]'}`} />
              <span className="font-mono text-sm uppercase tracking-widest text-[var(--text-secondary)]">{status}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={driftScore}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.28 }}
                className="my-10 font-mono text-[7rem] font-bold leading-none tracking-normal text-[var(--text-primary)]"
              >
                {driftScore.toFixed(2)}
              </motion.div>
            </AnimatePresence>

            <MagneticButton className="w-full">
              <button
                onClick={handleInjectDrift}
                disabled={isDrifting || isAnalyzing}
                className={`btn-geo w-full ${isDrifting ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {isAnalyzing ? 'Sampling trace...' : isDrifting ? 'Action halted' : 'Inject contradiction'}
              </button>
            </MagneticButton>
          </div>

          <SignalGraph isDrifting={isDrifting} isAnalyzing={isAnalyzing} />
        </div>
      </div>
    </section>
  );
};
