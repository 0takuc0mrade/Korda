/* eslint-disable */
'use client';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { MagneticButton } from './MagneticButton';

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 150 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 transition-all duration-500 ${
        scrolled ? "pt-4" : "pt-8"
      }`}
    >
      <div className={`flex items-center justify-between w-full max-w-5xl px-6 py-4 rounded-full transition-all duration-500 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border border-[var(--border)]" : "bg-transparent"
      }`}>
        
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 rounded bg-[var(--text-primary)] group-hover:scale-90 transition-transform" />
          <span className="font-bold tracking-tight text-xl text-[var(--text-primary)]">KORDA</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[var(--text-secondary)] font-medium text-sm">
          <Link href="/platform" className="hover:text-[var(--text-primary)] transition-colors">Platform</Link>
          <a href="/#how" className="hover:text-[var(--text-primary)] transition-colors">Architecture</a>
          <a href="https://github.com/cognee-ai/cognee" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
        </div>

        <MagneticButton>
          <a href="/#demo" className="btn-geo py-2 px-5 text-sm">
            Demo
          </a>
        </MagneticButton>
        
      </div>
    </motion.nav>
  );
};
