"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- MAIN PAGE ---
export default function LandingPage() {
  const [EngineComponent, setEngineComponent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    import('@/components/AdvancedRealityEngine').then((mod) => {
      setEngineComponent(() => mod.default);
    });
  }, []);

  if (!mounted) return null;

  return (
    <main className="w-screen h-screen relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* 
        ========================================================
        Z-INDEX -10: ATMOSPHERIC BACKGROUND
        ======================================================== 
        Rich, cinematic gradient (not plain) as requested.
      */}
      <div className="absolute inset-0 z-[-10] bg-[#07070F]" />
      <div className="absolute inset-0 z-[-10] bg-[radial-gradient(ellipse_at_center,rgba(80,40,150,0.25)_0%,rgba(20,10,40,0.8)_60%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 z-[-10] bg-noise mix-blend-overlay opacity-30 pointer-events-none" />

      {/* 
        ========================================================
        Z-INDEX 0: ETHEREAL 3D WEBGL ENGINE (CENTERPIECE)
        ======================================================== 
      */}
      <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-auto flex items-center justify-center">
        {/* We restrict the height slightly so it sits perfectly like the 'Beyond the prompt' sphere or 'Evoke' ribbon */}
        <div className="w-full h-[80vh] md:h-full relative opacity-90">
          {EngineComponent && <EngineComponent theme="dark" alignmentScore={100} />}
        </div>
      </div>

      {/* 
        ========================================================
        Z-INDEX 20: REFINED MINIMALIST UI ("Beyond the prompt" style)
        ======================================================== 
      */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-10">
        
        {/* Top Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex justify-between items-center pointer-events-auto w-full max-w-7xl mx-auto"
        >
          {/* Brand */}
          <div className="flex items-center space-x-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
             <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
             <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Korda</span>
          </div>

          {/* Micro-Nav */}
          <div className="hidden md:flex items-center space-x-10">
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer">Labs</span>
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer">Sessions</span>
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer">Resources</span>
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer">Community</span>
          </div>

          {/* CTA */}
          <Link href="/dashboard">
            <div className="px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-md">
              Join Today
            </div>
          </Link>
        </motion.div>

        {/* 
          Main Typography (Positioned cleanly at the bottom center, exactly like "Beyond the prompt")
        */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-end flex-1 pb-12 md:pb-20 pointer-events-auto text-center z-30"
        >
           <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 drop-shadow-2xl" style={{ fontFamily: 'var(--font-display)' }}>
             Reality Synchronized
           </h1>
           <p className="text-sm md:text-base font-normal tracking-wide text-white/60 max-w-lg mb-8 leading-relaxed px-4">
             This is for autonomous agents, orchestrators, and systems shaping how AI meets real-world context—with absolute truth and precision.
           </p>
           
           <Link href="/dashboard">
              <div className="group flex items-center space-x-3 px-6 py-3 bg-white text-black rounded-full text-[11px] font-bold tracking-widest uppercase hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <span>Deploy Engine</span>
                <svg className="w-3 h-3 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
           </Link>
        </motion.div>

      </div>
    </main>
  );
}
