"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import WebGLFluidPrism from '@/components/WebGLFluidPrism';

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <motion.main 
      initial={false}
      animate={{ 
        backgroundColor: theme === 'light' ? '#F2F3F5' : '#030305',
        color: theme === 'light' ? '#0f172a' : '#ffffff' 
      }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-screen h-screen relative overflow-hidden font-sans"
    >
      
      {/* 
        ========================================================
        Z-INDEX 0: The Dynamic Canvas Background
        ======================================================== 
      */}
      <motion.div 
        animate={{ opacity: theme === 'light' ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,#FFFFFF_0%,transparent_60%)] pointer-events-none" 
      />
      
      <motion.div 
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(78,35,160,0.15)_0%,transparent_100%)] pointer-events-none" 
      />

      {/* 
        ========================================================
        Z-INDEX 10: STRICT RIGHT COLUMN (NATIVE WEBGL)
        ======================================================== 
        Constrained strictly to the right 50% of the screen. Zero overlap.
      */}
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2 z-10 pointer-events-auto cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={theme === 'light' ? 1.5 : 0.5} />
            <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 2 : 1} color={theme === 'light' ? '#ffffff' : '#8b5cf6'} />
            <directionalLight position={[-10, -10, -5]} intensity={theme === 'light' ? 0.5 : 0.2} color={theme === 'light' ? '#e2e8f0' : '#0ea5e9'} />
            
            {/* 
              PresentationControls makes the 3D object interactive. 
              The user can grab, spin, and play with the glass ribbon.
            */}
            <PresentationControls 
              global 
              snap={true} 
              rotation={[0, 0.3, 0]} 
              polar={[-Math.PI / 3, Math.PI / 3]} 
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <WebGLFluidPrism theme={theme} />
            </PresentationControls>
          </Suspense>
        </Canvas>
      </div>

      {/* 
        ========================================================
        Z-INDEX 20: STRICT LEFT COLUMN (EDITORIAL UI)
        ======================================================== 
        Constrained strictly to the left 50% of the screen.
      */}
      <div className="absolute inset-0 z-20 flex pointer-events-none">
        
        {/* Left Column (UI) */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-between p-8 md:p-16 pointer-events-none">
          
          {/* Top Nav Area */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-between items-center pointer-events-auto"
          >
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tighter">Ω Korda</span>
            </div>

            {/* Theme Toggle */}
            <div className="hidden md:flex items-center">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="relative flex items-center px-4 py-2 rounded-full border shadow-sm transition-colors duration-500 overflow-hidden"
                style={{
                  borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                }}
              >
                <div className="relative z-10 flex space-x-6 text-xs font-bold tracking-widest uppercase">
                  <span className={`transition-opacity duration-500 ${theme === 'light' ? 'opacity-100' : 'opacity-40'}`}>Light</span>
                  <span className={`transition-opacity duration-500 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`}>Dark</span>
                </div>
                
                <motion.div 
                  className="absolute top-1 bottom-1 w-[45%] rounded-full z-0"
                  style={{ backgroundColor: theme === 'light' ? '#0f172a' : '#ffffff' }}
                  animate={{ left: theme === 'light' ? '4px' : '52%', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-center pointer-events-auto">
            {/* High-End Editorial Serif Typography */}
            <motion.h1 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-[110px] font-normal tracking-tight leading-[0.95] mb-8 drop-shadow-sm transition-colors duration-1000"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Unlimited<br />Reasoning.<br />
              <span className="italic text-slate-400">One Plane.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="text-lg max-w-sm leading-relaxed mb-12 font-medium transition-colors duration-1000"
              style={{ color: theme === 'light' ? 'rgba(71, 85, 105, 1)' : 'rgba(148, 163, 184, 1)' }}
            >
              A collaborative intelligence platform designed to intercept, route, and sustain context for autonomous swarms.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-6"
            >
              <Link href="/dashboard">
                <motion.div 
                  animate={{ backgroundColor: theme === 'light' ? '#0f172a' : '#ffffff', color: theme === 'light' ? '#ffffff' : '#0f172a' }}
                  transition={{ duration: 1.5 }}
                  className="px-8 py-4 rounded-full text-sm font-bold shadow-2xl transition-transform hover:scale-105 duration-300 inline-flex items-center"
                >
                  Launch Interceptor
                  <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </motion.div>
              </Link>
              <span className="text-sm font-bold uppercase tracking-widest hover:opacity-70 cursor-pointer transition-opacity">Read Docs</span>
            </motion.div>
          </div>

          {/* Bottom Elements */}
          <div className="flex justify-between items-end pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-1000"
              style={{ color: theme === 'light' ? 'rgba(148, 163, 184, 1)' : 'rgba(71, 85, 105, 1)' }}
            >
              v2.0.0
            </motion.div>
          </div>
        </div>

        {/* Right Column (Empty to let Canvas shine, but houses the Scroll Badge) */}
        <div className="hidden md:flex w-1/2 h-full flex-col justify-end items-end p-16 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-36 h-36 rounded-full border shadow-sm relative group cursor-pointer transition-colors duration-1000 pointer-events-auto"
            style={{ 
              borderColor: theme === 'light' ? 'rgba(226, 232, 240, 1)' : 'rgba(51, 65, 85, 1)',
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
            }}
          >
            <svg className="w-6 h-6 mb-2 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight transition-colors duration-1000" style={{ color: theme === 'light' ? 'rgba(148, 163, 184, 1)' : 'rgba(100, 116, 139, 1)' }}>
              Drag 3D<br/>Object
            </span>
            
            <div className="absolute inset-0 animate-spin-slow pointer-events-none opacity-50">
               <svg viewBox="0 0 100 100" className="w-full h-full">
                <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                <text className="text-[10px] font-mono tracking-widest" style={{ fill: theme === 'light' ? 'rgba(100, 116, 139, 1)' : 'rgba(148, 163, 184, 1)' }}>
                  <textPath href="#circlePath" startOffset="0%">
                    INTERACTIVE WEBGL • RENDERED IN REALTIME • 
                  </textPath>
                </text>
              </svg>
            </div>
          </motion.div>
        </div>

      </div>

    </motion.main>
  );
}
