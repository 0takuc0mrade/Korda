'use client';

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  isGlitch: boolean;
}

interface Props {
  alignmentScore: number;
  theme: 'light' | 'dark';
}

export default function InteractiveRealityCanvas({ alignmentScore, theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      lastMouse.current.x = mouse.current.x;
      lastMouse.current.y = mouse.current.y;
      
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (lastMouse.current.x !== -1000) {
        mouse.current.vx = mouse.current.x - lastMouse.current.x;
        mouse.current.vy = mouse.current.y - lastMouse.current.y;
      }
      
      // Add point to trail
      points.current.push({
        x: mouse.current.x,
        y: mouse.current.y,
        age: 0,
        vx: mouse.current.vx,
        vy: mouse.current.vy
      });
      
      // If fractured, spawn shatter particles on fast movement
      const speed = Math.hypot(mouse.current.vx, mouse.current.vy);
      if (alignmentScore < 100 && speed > 5) {
        const numParticles = Math.floor(speed / 10);
        for (let i = 0; i < numParticles; i++) {
          const isGlitch = Math.random() > 0.5;
          particles.current.push({
            x: mouse.current.x + (Math.random() - 0.5) * 20,
            y: mouse.current.y + (Math.random() - 0.5) * 20,
            vx: (mouse.current.vx * 0.2) + (Math.random() - 0.5) * 10,
            vy: (mouse.current.vy * 0.2) + (Math.random() - 0.5) * 10,
            size: Math.random() * (isGlitch ? 40 : 10) + 2,
            color: isGlitch ? (Math.random() > 0.5 ? '#f43f5e' : '#06b6d4') : (theme === 'light' ? '#cbd5e1' : '#334155'),
            life: 0,
            maxLife: Math.random() * 30 + 10,
            isGlitch
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Fade out background for trailing effect
      ctx.fillStyle = theme === 'light' ? 'rgba(242, 243, 245, 0.2)' : 'rgba(3, 3, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const isFractured = alignmentScore < 100;
      const turbulence = (100 - alignmentScore) / 100;

      // Draw elegant trails
      if (points.current.length > 1) {
        ctx.beginPath();
        const startPoint = points.current[0];
        ctx.moveTo(startPoint.x, startPoint.y);
        
        for (let i = 1; i < points.current.length; i++) {
          const pt = points.current[i];
          
          if (isFractured) {
             // Jagged, glitchy line
             const offsetX = (Math.random() - 0.5) * turbulence * 20;
             const offsetY = (Math.random() - 0.5) * turbulence * 20;
             ctx.lineTo(pt.x + offsetX, pt.y + offsetY);
          } else {
             // Smooth bezier curve for fiber optic feel
             const prevPt = points.current[i - 1];
             const xc = (prevPt.x + pt.x) / 2;
             const yc = (prevPt.y + pt.y) / 2;
             ctx.quadraticCurveTo(prevPt.x, prevPt.y, xc, yc);
          }
        }
        
        if (isFractured) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.5 + turbulence * 0.5})`; // Rose/Danger color
          ctx.lineWidth = 2 + turbulence * 4;
        } else {
          ctx.strokeStyle = theme === 'light' ? 'rgba(14, 165, 233, 0.6)' : 'rgba(56, 189, 248, 0.6)'; // Cyan fiber optic
          ctx.lineWidth = 4;
          // Add glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = theme === 'light' ? '#38bdf8' : '#7dd3fc';
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      }

      // Update and draw particles (Shattered glass / data fragments)
      if (isFractured) {
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.life++;
          
          // Physics
          p.x += p.vx;
          p.y += p.vy;
          
          if (p.isGlitch) {
             // Snap movement like digital artifact
             if (p.life % 3 === 0) {
               p.x += (Math.random() - 0.5) * 30;
               p.y += (Math.random() - 0.5) * 10;
             }
          } else {
             // Float away
             p.vy -= 0.1; // gravity up
          }
          
          const alpha = 1 - (p.life / p.maxLife);
          ctx.globalAlpha = Math.max(0, alpha);
          
          if (p.isGlitch) {
            // Draw horizontal tech bands
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size * 2, p.size / 4);
          } else {
            // Draw glass shards (rectangles)
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.life * 0.1);
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
          }
          
          ctx.globalAlpha = 1.0;
          
          if (p.life >= p.maxLife) {
            particles.current.splice(i, 1);
          }
        }
      }

      // Age points and remove dead ones
      for (let i = points.current.length - 1; i >= 0; i--) {
        points.current[i].age++;
        // Shorter trail if fractured, longer if smooth
        const maxAge = isFractured ? 15 : 40; 
        if (points.current[i].age > maxAge) {
          points.current.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [alignmentScore, theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
      style={{ zIndex: 0 }}
    />
  );
}
