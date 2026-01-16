
import React, { useEffect, useRef } from 'react';

interface Props {
  intensity: number; // 0 - 10
}

const SnowEffect: React.FC<Props> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; r: number; d: number }[] = [];
    
    // Density based on intensity (0-10)
    const maxParticles = Math.max(0, intensity * 30); 

    if (maxParticles === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 1, // Radius
          d: Math.random() * maxParticles // Density/Drop speed factor
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    const update = () => {
        for (let i = 0; i < maxParticles; i++) {
            const p = particles[i];
            // Update coordinates - Straight down vertical movement
            // Speed depends on radius (larger flakes fall slightly faster)
            p.y += 1 + (p.r / 2); 

            // Reset particles if they go off screen (bottom only)
            if (p.y > canvas.height) {
                p.x = Math.random() * canvas.width;
                p.y = -10;
            }
        }
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  if (intensity === 0) return null;

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ width: '100%', height: '100%' }}
    />
  );
};

export default SnowEffect;
