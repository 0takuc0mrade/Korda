'use client';
import { motion } from 'framer-motion';
import { MagneticButton } from './MagneticButton';
import { ScrambleText } from './ScrambleText';

export const Footer = () => {
  return (
    <footer className="creative-gradient relative overflow-hidden border-t border-[var(--border)] px-6 py-24 lg:px-16">
      <div className="absolute inset-0 polar-grid opacity-25" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl"
        >
          <div className="mb-8 inline-flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-2 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--amber)] shadow-[0_0_18px_var(--amber)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]">
              <ScrambleText text="Keep the system in view" delay={0.1} />
            </span>
          </div>
          <h2 className="text-5xl font-extrabold leading-[0.95] tracking-normal md:text-8xl">
            Reality is the interface.
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed text-[var(--text-secondary)]">
            Korda gives agent teams a live instrument for memory, coherence, and intervention.
          </p>
          <div className="mt-10">
            <MagneticButton>
              <a href="#demo" className="btn-geo">
                Run the monitor
              </a>
            </MagneticButton>
          </div>
        </motion.div>

        <div className="mt-24 flex flex-col gap-6 border-t border-[var(--border)] pt-8 font-medium text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">KORDA</span>
          <span>Reality intelligence for agent systems</span>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[var(--text-primary)]">GitHub</a>
            <a href="#" className="hover:text-[var(--text-primary)]">Docs</a>
            <a href="#" className="hover:text-[var(--text-primary)]">Memory</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
