"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InterceptPayload {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  status: "CLEAR" | "INTERCEPTED";
  targetNode?: string;
}

const MOCK_STREAM: InterceptPayload[] = [
  { id: "req_001", timestamp: "14:32:01", agent: "AGENT_7", action: "Query Structure", status: "CLEAR" },
  { id: "req_002", timestamp: "14:32:02", agent: "AGENT_7", action: "Extract Metadata", status: "CLEAR" },
  { id: "req_003", timestamp: "14:32:04", agent: "AGENT_7", action: "Draft Launch Plan", status: "INTERCEPTED", targetNode: "old rollout path" },
  { id: "req_004", timestamp: "14:32:05", agent: "AGENT_2", action: "Analyze DB Schema", status: "CLEAR" },
  { id: "req_005", timestamp: "14:32:08", agent: "AGENT_2", action: "Revise Release Notes", status: "INTERCEPTED", targetNode: "stale launch memory" },
];

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  theme: 'light' | 'dark';
}

export default function InterceptionFeed({ activeId, onSelect, theme }: Props) {
  const [stream, setStream] = useState<InterceptPayload[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < MOCK_STREAM.length) {
        setStream((prev) => [...prev, MOCK_STREAM[index]]);
        index++;
        
        // Auto-scroll
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
      }
    }, 2000); // Simulate incoming traffic

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b transition-colors duration-1000" style={{ borderColor: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
        <h2 className="text-xs font-mono tracking-widest uppercase flex items-center justify-between transition-colors duration-1000" style={{ color: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
          <span>Data Ingestion Stream</span>
          <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse shadow-[0_0_8px_var(--accent-cyan)]"></span>
        </h2>
      </div>

      {/* Stream List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {stream.map((item) => {
            if (!item) return null;
            const isIntercepted = item.status === "INTERCEPTED";
            const isActive = activeId === item.id;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                onClick={() => onSelect(item.id)}
                className={`
                  relative p-4 rounded-xl cursor-pointer transition-all duration-300 border
                  ${isActive 
                    ? isIntercepted 
                      ? 'bg-[var(--accent-purple)]/10 border-[var(--accent-purple)] shadow-[0_0_15px_rgba(157,78,221,0.2)]' 
                      : 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)] shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                    : theme === 'light' ? 'bg-black/5 border-transparent hover:border-black/10' : 'bg-white/5 border-transparent hover:border-white/10'
                  }
                `}
              >
                {/* Left Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300 ${isIntercepted ? 'bg-[var(--accent-neon-pink)] shadow-[0_0_10px_var(--accent-neon-pink)]' : 'bg-[var(--accent-cyan)] opacity-50'}`} />

                <div className="flex justify-between items-start ml-2">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-mono mb-1 ${isIntercepted ? 'text-[var(--accent-neon-pink)]' : (theme === 'light' ? 'text-black/60' : 'text-white/60')}`}>
                      [{item.timestamp}] {item.agent}
                    </span>
                    <span className={`text-sm font-medium ${isIntercepted ? (theme === 'light' ? 'text-black' : 'text-white') : (theme === 'light' ? 'text-black/80' : 'text-white/80')}`}>
                      {item.action}
                    </span>
                  </div>
                </div>

                {isIntercepted && (
                  <div className="mt-3 ml-2 flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[var(--accent-neon-pink)]/20 text-[var(--accent-neon-pink)] border border-[var(--accent-neon-pink)]/30">
                      INTERCEPTED
                    </span>
                    {item.targetNode && (
                      <span className={`text-[10px] font-mono truncate ${theme === 'light' ? 'text-black/40' : 'text-white/40'}`}>
                        {item.targetNode}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {stream.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs font-mono text-[var(--text-muted)] animate-pulse">Awaiting telemetry...</p>
          </div>
        )}
      </div>
    </div>
  );
}
