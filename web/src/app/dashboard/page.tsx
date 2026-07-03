'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PresentationControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import Link from 'next/link';
import InterceptionFeed from '@/components/InterceptionFeed';
import GuardrailInspector from '@/components/GuardrailInspector';
import WebGLFluidPrism from '@/components/WebGLFluidPrism';

export default function Dashboard() {
  const [activeInterceptId, setActiveInterceptId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Dashboard defaults to dark mode

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
        Z-INDEX 0: SPATIAL 3D ENVIRONMENT
        ======================================================== 
      */}
      <div className="absolute inset-0 z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={theme === 'light' ? 1.5 : 0.5} />
            <directionalLight position={[10, 10, 5]} intensity={theme === 'light' ? 2 : 1} color={theme === 'light' ? '#ffffff' : '#8b5cf6'} />
            <directionalLight position={[-10, -10, -5]} intensity={theme === 'light' ? 0.5 : 0.2} color={theme === 'light' ? '#e2e8f0' : '#0ea5e9'} />
            
            <PresentationControls 
              global 
              snap={true} 
              rotation={[0, 0, 0]} 
              polar={[-Math.PI / 4, Math.PI / 4]} 
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <WebGLFluidPrism theme={theme} />
            </PresentationControls>
          </Suspense>
        </Canvas>
      </div>

      {/* 
        ========================================================
        Z-INDEX 10: SPATIAL UI LAYERS
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
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Interceptor Engine</span>
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-500">SYSTEM ACTIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Spatial UI Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto mt-6 flex space-x-6 relative">
          
          {/* Floating Interception Feed Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="w-[350px] h-full pointer-events-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[40px] border transition-colors duration-1000"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,15,0.4)',
              borderColor: theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <InterceptionFeed 
              activeId={activeInterceptId} 
              onSelect={setActiveInterceptId} 
              theme={theme}
            />
          </motion.div>

          {/* Floating Guardrail Inspector Canvas */}
          <div className="flex-1 h-full pointer-events-auto relative">
            <GuardrailInspector activeId={activeInterceptId} theme={theme} />
          </div>

        </div>
      </div>
    </motion.main>
  );
}
