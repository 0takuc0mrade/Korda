'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InterceptionFeed from '@/components/InterceptionFeed';
import GuardrailInspector from '@/components/GuardrailInspector';

export default function Dashboard() {
  const [activeInterceptId, setActiveInterceptId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Dashboard defaults to dark mode
  const [alignmentScore, setAlignmentScore] = useState<number>(100); // 100 = perfect reality alignment
  const [EngineComponent, setEngineComponent] = useState<any>(null);

  useEffect(() => {
    import('@/components/AdvancedRealityEngine').then((mod) => {
      setEngineComponent(() => mod.default);
    });
  }, []);

  return (
    <motion.main 
      initial={false}
      animate={{ 
        backgroundColor: theme === 'light' ? '#F2F3F5' : '#030305',
        color: theme === 'light' ? '#0f172a' : '#ffffff' 
      }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen w-screen relative overflow-hidden font-sans"
    >
      
      {/* 
        ========================================================
        Z-INDEX 0: IMPERATIVE WEBGL ENGINE
        ======================================================== 
      */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {EngineComponent && <EngineComponent theme={theme} alignmentScore={alignmentScore} />}
      </div>
      
      {/* Global Cinematic Grain Overlay */}
      <div className="absolute inset-0 z-0 bg-noise mix-blend-overlay opacity-30 pointer-events-none" />

      {/* Subtle vignette for depth */}
      <motion.div 
        animate={{ opacity: theme === 'light' ? 0.2 : 0.6 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: theme === 'light' 
            ? 'radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.8) 100%)'
            : 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* 
        ========================================================
        Z-INDEX 10: DASHBOARD CONTENT
        ======================================================== 
        These are fluid, floating glass panels, not rigid grids.
      */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-6">
        
        {/* Floating Top Navigation Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto flex justify-between items-center px-6 py-3 mx-auto w-full max-w-7xl rounded-full shadow-2xl backdrop-blur-3xl border transition-colors duration-1000"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(25,25,35,0.6)',
            borderColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
          }}
        >
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
              Ω Korda
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Shared Reality Engine</span>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-xs font-bold tracking-widest uppercase hover:opacity-70 transition-opacity"
            >
              Toggle {theme === 'light' ? 'Dark' : 'Light'}
            </button>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${alignmentScore < 100 ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${alignmentScore < 100 ? 'bg-rose-600' : 'bg-emerald-500'}`}></span>
              </span>
              <span className={`text-xs font-mono font-bold ${alignmentScore < 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {alignmentScore < 100 ? 'REALITY FRACTURED' : 'SYSTEM ALIGNED'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Spatial UI Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto mt-6 flex flex-col space-y-6 relative">
          
          {/* Top Panel: Agent Fleet Matrix */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="w-full h-24 pointer-events-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[40px] border flex items-center px-8 transition-colors duration-1000"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,15,0.4)',
              borderColor: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)',
            }}
          >
             <div className="flex space-x-12 w-full">
                {/* Agent A */}
                <div className="flex flex-col cursor-pointer" onClick={() => setAlignmentScore(100)}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent A (Support)</span>
                  <span className="text-2xl font-black text-emerald-400">100% ALIGNED</span>
                </div>
                {/* Agent B */}
                <div className="flex flex-col cursor-pointer" onClick={() => setAlignmentScore(40)}>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent B (DevOps)</span>
                  <span className={`text-2xl font-black ${alignmentScore === 40 ? 'text-rose-500' : 'text-slate-300'}`}>
                    {alignmentScore === 40 ? '40% DIVERGED' : 'DRIFTING...'}
                  </span>
                </div>
                <div className="ml-auto flex items-center">
                   <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold backdrop-blur-md transition-all">
                     Run Reconciliation
                   </button>
                </div>
             </div>
          </motion.div>

          {/* Bottom Split: The Side-by-Side Reality Panel */}
          {alignmentScore < 100 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 w-full pointer-events-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[40px] border flex transition-colors duration-1000"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(10,10,15,0.6)',
                borderColor: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)',
              }}
            >
              {/* Left Side: Agent's Hallucinated Reality */}
              <div className="flex-1 border-r border-white/10 p-8 flex flex-col relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-8xl font-black">?</span>
                 </div>
                 <span className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">Agent B's Stale Perspective</span>
                 <h2 className="text-3xl font-black mb-2">AUTH_API_V1</h2>
                 <p className="text-slate-400 font-mono text-sm leading-relaxed">
                   Dependency graph shows agent operating on superseded connection pool logic.
                   Status: STALE.
                 </p>
                 <div className="mt-8 p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                   <span className="text-rose-400 font-mono text-xs">{"{"} "session_id": "agent_b", "node": "AUTH_API_V1" {"}"}</span>
                 </div>
              </div>

              {/* Center: The SUPERSEDES Edge */}
              <div className="w-16 flex items-center justify-center bg-black/20">
                 <div className="h-full w-px bg-white/10 absolute"></div>
                 <div className="bg-slate-800 border border-slate-700 p-2 rounded-full z-10 transform -rotate-90">
                    <span className="text-[10px] font-bold text-slate-300 tracking-widest">SUPERSEDES</span>
                 </div>
              </div>

              {/* Right Side: Canonical Truth */}
              <div className="flex-1 p-8 flex flex-col relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-8xl font-black">!</span>
                 </div>
                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Canonical Ground Truth</span>
                 <h2 className="text-3xl font-black mb-2">AUTH_API_V2</h2>
                 <p className="text-slate-400 font-mono text-sm leading-relaxed">
                   Replaced due to memory leak in search service. Rate limits enforced.
                   Status: ACTIVE.
                 </p>
                 <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                   <span className="text-emerald-400 font-mono text-xs">{"{"} "session_id": "global", "node": "AUTH_API_V2" {"}"}</span>
                 </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.main>
  );
}
