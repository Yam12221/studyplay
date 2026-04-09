'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { THEMES } from '@/lib/types';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  char?: string;
}

interface MatrixDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  currentChar: number;
}

export default function ThemeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const theme = useStore((state) => state.settings.theme);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const drawMatrix = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const particles: any[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 128, ${p.opacity})`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > height) p.y = -10;
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawStars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const stars: { x: number; y: number; size: number; twinkle: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0A0A1F');
      gradient.addColorStop(0.5, '#1A0A2E');
      gradient.addColorStop(1, '#0A0A1F');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.twinkle += 0.02;
        const opacity = 0.5 + Math.sin(star.twinkle) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawWaves = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const animate = () => {
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      for (let wave = 0; wave < 5; wave++) {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 10) {
          const y = height / 2 + Math.sin(x * 0.01 + time + wave) * (50 + wave * 20);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        if (wave % 2 === 0) {
          gradient.addColorStop(0, 'rgba(255, 105, 180, 0.3)');
          gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
        } else {
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 105, 180, 0.3)');
        }
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 20; i++) {
        const y = (height / 20) * i + Math.sin(time + i) * 10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawAurora = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const animate = () => {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.0005;

      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createLinearGradient(0, 0, width, height * 0.7);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 20) {
          const y = height * 0.5 +
            Math.sin(x * 0.003 + time + i) * 100 +
            Math.sin(x * 0.007 + time * 1.5) * 50 +
            Math.sin(x * 0.002 + time * 0.5) * 80;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawNeon = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random(),
        color: Math.random() > 0.5 ? '#FF0080' : '#00FFFF',
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += (Math.random() - 0.5) * 0.1;
        p.opacity = Math.max(0.2, Math.min(1, p.opacity));

        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 0, 128, 0.3)';
      ctx.lineWidth = 1;
      const time = Date.now() * 0.001;
      for (let i = 0; i < 5; i++) {
        const y = (height / 5) * i + Math.sin(time + i) * 20;
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          const yy = y + Math.sin(x * 0.02 + time) * 10;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawScanlines = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#2D1810');
      gradient.addColorStop(0.5, '#3D2015');
      gradient.addColorStop(1, '#2D1810');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 107, 53, 0.1)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 2);
      }

      const time = Date.now() * 0.002;
      ctx.fillStyle = 'rgba(255, 200, 100, 0.03)';
      ctx.fillRect(0, (time * 50) % height - 100, width, 100);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 3 + Math.random() * 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -0.5 - Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        color: currentTheme.particleColor,
      });
    }

    const animate = () => {
      ctx.fillStyle = currentTheme.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += (Math.random() - 0.5) * 0.02;
        p.opacity = Math.max(0.1, Math.min(0.7, p.opacity));

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [currentTheme]);

  const drawBubbles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bubbles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 30; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 5 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }

    const animate = () => {
      ctx.fillStyle = '#0C1929';
      ctx.fillRect(0, 0, width, height);

      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += Math.sin(Date.now() * 0.001 + b.y * 0.01) * 0.3;

        if (b.y < -b.size * 2) {
          b.y = height + b.size;
          b.x = Math.random() * width;
        }

        ctx.strokeStyle = `rgba(6, 182, 212, ${b.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawGradient = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const animate = () => {
      const time = Date.now() * 0.001;

      const gradient = ctx.createLinearGradient(
        Math.sin(time) * width * 0.5 + width * 0.5,
        0,
        Math.cos(time) * width * 0.5 + width * 0.5,
        height
      );
      gradient.addColorStop(0, '#1F0A1F');
      gradient.addColorStop(0.3, '#2D1020');
      gradient.addColorStop(0.6, '#3D1525');
      gradient.addColorStop(1, '#1F0A1F');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const sunGradient = ctx.createRadialGradient(
        width * 0.7 + Math.sin(time * 0.5) * 20,
        height * 0.6,
        0,
        width * 0.7,
        height * 0.6,
        150
      );
      sunGradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
      sunGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
      sunGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const drawGlitch = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const animate = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      if (Math.random() > 0.98) {
        const glitchY = Math.random() * height;
        const glitchHeight = 5 + Math.random() * 20;
        ctx.fillStyle = Math.random() > 0.5 ? '#FFE500' : '#FF0055';
        ctx.fillRect(0, glitchY, width, glitchHeight);
      }

      for (let i = 0; i < 3; i++) {
        const offset = Math.sin(time * 2 + i) * 10;
        ctx.strokeStyle = `rgba(255, 229, 0, ${0.1 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, (height / 3) * (i + 1) + offset);
        ctx.lineTo(width, (height / 3) * (i + 1) + offset);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255, 0, 85, 0.2)';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 50) {
        const y = Math.sin(x * 0.05 + time) * 20 + height / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    switch (currentTheme.animationType) {
      case 'matrix':
        drawMatrix(ctx, canvas.width, canvas.height);
        break;
      case 'stars':
        drawStars(ctx, canvas.width, canvas.height);
        break;
      case 'waves':
        drawWaves(ctx, canvas.width, canvas.height);
        break;
      case 'aurora':
        drawAurora(ctx, canvas.width, canvas.height);
        break;
      case 'neon':
        drawNeon(ctx, canvas.width, canvas.height);
        break;
      case 'scanlines':
        drawScanlines(ctx, canvas.width, canvas.height);
        break;
      case 'bubbles':
        drawBubbles(ctx, canvas.width, canvas.height);
        break;
      case 'gradient':
        drawGradient(ctx, canvas.width, canvas.height);
        break;
      case 'glitch':
        drawGlitch(ctx, canvas.width, canvas.height);
        break;
      default:
        drawParticles(ctx, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTheme, drawMatrix, drawStars, drawWaves, drawAurora, drawNeon, drawScanlines, drawParticles, drawBubbles, drawGradient, drawGlitch]);

  return (
    <canvas
      key={currentTheme.id}
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ opacity: 0.15 }}
    />
  );
}
