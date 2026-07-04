'use client';
import { motion } from 'framer-motion';
import { SpatialCard } from './SpatialCard';
import { ScrambleText } from './ScrambleText';

const features = [
  {
    title: "Graph Memory Plane",
    desc: "Every agent interaction lands in a deterministic memory graph. It's a living reality, not a flat JSON log.",
    Icon: () => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle cx="24" cy="24" r="20" stroke="var(--fluid-3)" strokeWidth="2" strokeDasharray="6 6" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "24px 24px" }} />
        <circle cx="24" cy="24" r="8" fill="var(--fluid-3)" />
      </svg>
    )
  },
  {
    title: "Black Box Observability",
    desc: "Real-time coherence scoring checks RAG outputs and autonomous agent beliefs against your shared Enterprise ontology.",
    Icon: () => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path d="M12 36L24 16L36 36" stroke="var(--fluid-1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" animate={{ d: ["M12 36L24 16L36 36", "M12 24L24 36L36 24", "M12 36L24 16L36 36"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    )
  },
  {
    title: "Swarm Coordination",
    desc: "When logic drift is found in an agent swarm, pipelines pause and agents talk it out using the Mutual Agentic Reasoning protocol.",
    Icon: () => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.rect x="14" y="14" width="8" height="20" rx="4" fill="var(--fluid-2)" animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ transformOrigin: "18px 24px" }} />
        <motion.rect x="26" y="14" width="8" height="20" rx="4" fill="var(--fluid-2)" animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} style={{ transformOrigin: "30px 24px" }} />
      </svg>
    )
  },
  {
    title: "Enterprise Safety Net",
    desc: "Runs as a shadow observer via OpenServ. Just plug it in and it actively watches every Enterprise RAG pipeline without overhead.",
    Icon: () => (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path d="M24 12V36M12 24H36" stroke="var(--fluid-4)" strokeWidth="4" strokeLinecap="round" animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "anticipate" }} style={{ transformOrigin: "24px 24px" }} />
      </svg>
    )
  }
];

export const Features = () => {
  return (
    <section className="py-24 px-6 lg:px-16 relative bg-[var(--bg-mint)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-[var(--fluid-1)] mb-4 block">
              <ScrambleText text="Core Capabilities" delay={0.1} />
            </span>
            <h2 className="text-4xl md:text-5xl font-bold max-w-2xl text-[var(--text-primary)] tracking-tight">
              A safety net for production AI.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", bounce: 0.4 }}
              className="w-full h-full"
            >
              <SpatialCard className="h-full">
                <div className="card-premium h-full p-10 flex flex-col sm:flex-row gap-8 items-start group hover:bg-white pointer-events-auto">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <feat.Icon />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">{feat.title}</h3>
                    <p className="text-[var(--text-secondary)] font-medium leading-relaxed text-lg">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </SpatialCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
