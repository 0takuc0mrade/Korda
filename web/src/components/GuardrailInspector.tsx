/* eslint-disable */
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  activeId: string | null;
  theme: 'light' | 'dark';
}

const MOCK_DATA: Record<string, any> = {
  "req_003": {
    id: "req_003",
    status: "INTERCEPTED",
    targetNode: "old rollout path",
    originalPrompt: `Draft the launch steps from the cached rollout plan.`,
    hardenedPrompt: `This request is leaning on an old rollout path.\nUse the approved release gate and hold for the current launch rule.\n\nDraft the launch steps from the approved release gate.`,
    confidence: "98.3%",
    anomalyId: "AI_CPT_392",
    severity: "Critical",
    tokensSaved: "4,205"
  },
  "req_005": {
    id: "req_005",
    status: "INTERCEPTED",
    targetNode: "stale launch memory",
    originalPrompt: `Revise the release notes using the prior launch assumptions.`,
    hardenedPrompt: `This release note is using stale launch memory.\nUse the canonical release gate before making downstream changes.`,
    confidence: "99.1%",
    anomalyId: "AI_CPT_814",
    severity: "High",
    tokensSaved: "2,150"
  }
};

export default function GuardrailInspector({ activeId, theme }: Props) {
  const data = activeId ? MOCK_DATA[activeId] : null;

  return (
    <div className="w-full h-full relative overflow-hidden pointer-events-none flex items-center justify-center">
      
      <AnimatePresence mode="wait">
        {!data ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center transition-colors duration-1000"
            style={{ color: theme === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }}
          >
            <div className="w-32 h-32 mb-8 rounded-full border flex items-center justify-center shadow-2xl transition-colors duration-1000"
              style={{
                borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-4xl animate-pulse">⌖</span>
            </div>
            <p className="text-xl font-light tracking-widest uppercase">Awaiting Interception</p>
            <p className="text-sm font-mono mt-2 opacity-50">Select a payload from the stream</p>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            {/* Floating Pill Callouts */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="absolute top-[10%] left-[5%] z-30 flex items-center space-x-3 pointer-events-auto"
            >
              <div className="px-5 py-2.5 rounded-full flex items-center shadow-2xl backdrop-blur-3xl border transition-colors duration-1000"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)',
                  borderColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] mr-3 animate-pulse"></span>
                <span className={`text-xs font-mono font-bold tracking-wider ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  ANOMALY: {data.anomalyId}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="absolute top-[25%] right-[5%] z-30 flex items-center space-x-3 pointer-events-auto"
            >
              <div className="px-5 py-2.5 rounded-full flex items-center shadow-2xl backdrop-blur-3xl border border-rose-500/30 transition-colors duration-1000"
                style={{ backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)' }}
              >
                <span className="text-xs font-mono font-bold text-rose-500 tracking-wider">SEVERITY: {data.severity.toUpperCase()}</span>
              </div>
            </motion.div>

            {/* Ultra-Premium Glass Diff Panel (Centered Bottom) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute bottom-10 z-40 w-[90%] max-w-3xl rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.2)] border backdrop-blur-[40px] pointer-events-auto transition-colors duration-1000"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(10,10,15,0.4)',
                borderColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="px-6 py-4 border-b flex justify-between items-center transition-colors duration-1000"
                style={{ 
                  backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)',
                  borderColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
                }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
                    <span className="text-[10px]">⚡</span>
                  </div>
                  <span className={`text-xs font-mono font-bold tracking-widest uppercase ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                    Guardrail Injection: {data.targetNode}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
              </div>

              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 h-72">
                  {/* Left: Original */}
                  <div className="rounded-2xl p-5 overflow-y-auto transition-colors duration-1000"
                    style={{ backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
                  >
                     <span className="text-[10px] uppercase font-mono tracking-widest text-rose-500 mb-4 flex items-center">
                       <div className="w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(243,67,54,0.8)]"></div>
                       Hallucinated Payload
                     </span>
                     <pre className={`text-xs font-mono leading-relaxed break-words whitespace-pre-wrap ${theme === 'light' ? 'text-black/70' : 'text-white/70'}`}>
                       {data.originalPrompt}
                     </pre>
                  </div>

                  {/* Right: Hardened */}
                  <div className="rounded-2xl p-5 overflow-y-auto relative transition-colors duration-1000"
                    style={{ backgroundColor: theme === 'light' ? 'rgba(56,189,248,0.05)' : 'rgba(56,189,248,0.1)' }}
                  >
                     <span className="text-[10px] uppercase font-mono tracking-widest text-sky-500 mb-4 flex items-center relative z-10">
                       <div className="w-2 h-2 rounded-full bg-sky-500 mr-2 shadow-[0_0_8px_var(--accent-cyan)]"></div>
                       Hardened Payload
                     </span>
                     <pre className={`text-xs font-mono leading-relaxed break-words whitespace-pre-wrap relative z-10 ${theme === 'light' ? 'text-black/80' : 'text-white/80'}`}>
                       {data.hardenedPrompt.split('\n').map((line: string, i: number) => {
                         if (line.includes('[KORDA GUARDRAIL]')) {
                           return <span key={i} className="text-sky-600 dark:text-sky-400 font-bold block mb-3 bg-sky-500/10 p-2 rounded border-l-2 border-sky-500 shadow-sm">{line}</span>
                         }
                         return <span key={i} className="block">{line}</span>
                       })}
                     </pre>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
