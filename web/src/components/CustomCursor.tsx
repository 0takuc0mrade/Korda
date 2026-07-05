/* eslint-disable */
'use client';
import { motion, useSpring } from 'framer-motion';
import { useMousePosition } from '@/lib/hooks';
import { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const { x, y } = useMousePosition();
  const [isVisible, setIsVisible] = useState(false);
  const [trails, setTrails] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const springX = useSpring(x - 12, { stiffness: 800, damping: 40 });
  const springY = useSpring(y - 12, { stiffness: 800, damping: 40 });

  useEffect(() => {
    if (x === 0 && y === 0) return;
    setIsVisible(true);

    // Add trail effect
    const newTrail = { id: Date.now(), x, y };
    setTrails(prev => [...prev.slice(-5), newTrail]);

    // Hide native cursor only when we know we are tracking
    document.body.style.cursor = 'none';

    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [x, y]);

  if (!isVisible) return null;

  return (
    <>
      {/* Trailing Elements */}
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          initial={{ opacity: 0.5, scale: 0.5 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[998]"
          style={{ x: trail.x - 8, y: trail.y - 8 }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" fill="var(--fluid-1)" />
          </svg>
        </motion.div>
      ))}

      {/* Main Cursor (A geometric star instead of a generic circle) */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[999] mix-blend-difference"
        style={{ x: springX, y: springY }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39L50 0Z" fill="white" />
        </svg>
      </motion.div>
    </>
  );
};
