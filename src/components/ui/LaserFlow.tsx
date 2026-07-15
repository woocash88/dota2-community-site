'use client';

import { useEffect, useRef } from 'react';

interface LaserFlowProps {
  color?: string;
  wispDensity?: number;
  wispIntensity?: number;
  flowStrength?: number;
  fogIntensity?: number;
}

interface Wisp {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  phase: number;
  baseOpacity: number;
}

export default function LaserFlow({
  color = '#ef4444',
  wispDensity = 1.7,
  wispIntensity = 1.7,
  flowStrength = 0.7,
  fogIntensity = 0.68,
}: LaserFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parse color to rgb
    const tmp = document.createElement('div');
    tmp.style.color = color;
    document.body.appendChild(tmp);
    const computed = getComputedStyle(tmp).color;
    document.body.removeChild(tmp);
    const rgb = computed.match(/\d+/g)?.slice(0, 3).join(',') ?? '239,68,68';

    let animId: number;
    let t = 0;

    const wispCount = Math.floor(18 * wispDensity);
    const wisps: Wisp[] = Array.from({ length: wispCount }, () => ({
      x: 0.5 + (Math.random() - 0.5) * 0.6,
      y: Math.random(),
      size: 2 + Math.random() * 6,
      speed: (0.0008 + Math.random() * 0.0012) * flowStrength,
      opacity: 0,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: (0.15 + Math.random() * 0.55) * wispIntensity,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = Math.max(rect.width, 64);
      canvas.height = Math.max(rect.height, 100);
    };

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    resize();

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;

      ctx.clearRect(0, 0, W, H);

      // Outer fog
      const outerGrad = ctx.createLinearGradient(0, 0, W, 0);
      outerGrad.addColorStop(0,   `rgba(${rgb},0)`);
      outerGrad.addColorStop(0.5, `rgba(${rgb},${0.08 * fogIntensity})`);
      outerGrad.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = outerGrad;
      ctx.fillRect(0, 0, W, H);

      // Inner glow
      const innerW = Math.max(W * 0.4, 16);
      const innerGrad = ctx.createLinearGradient(cx - innerW / 2, 0, cx + innerW / 2, 0);
      innerGrad.addColorStop(0,   `rgba(${rgb},0)`);
      innerGrad.addColorStop(0.5, `rgba(${rgb},${0.45 * fogIntensity})`);
      innerGrad.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = innerGrad;
      ctx.fillRect(cx - innerW / 2, 0, innerW, H);

      // Core beam
      const beamW = Math.max(2, W * 0.06);
      const beamGrad = ctx.createLinearGradient(cx - beamW, 0, cx + beamW, 0);
      beamGrad.addColorStop(0,   `rgba(${rgb},0)`);
      beamGrad.addColorStop(0.5, `rgba(${rgb},0.95)`);
      beamGrad.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(cx - beamW, 0, beamW * 2, H);

      // Wisps
      t += 0.012;
      for (const wisp of wisps) {
        wisp.y -= wisp.speed;
        if (wisp.y < 0) {
          wisp.y = 1;
          wisp.x = 0.5 + (Math.random() - 0.5) * 0.5;
        }

        const pulse = Math.sin(t * 2.5 + wisp.phase) * 0.5 + 0.5;
        wisp.opacity = wisp.baseOpacity * pulse * pulse;

        const wx = wisp.x * W;
        const wy = wisp.y * H;
        const r = wisp.size * 2;

        const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
        wg.addColorStop(0,   `rgba(${rgb},${wisp.opacity})`);
        wg.addColorStop(0.5, `rgba(${rgb},${wisp.opacity * 0.4})`);
        wg.addColorStop(1,   `rgba(${rgb},0)`);
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.arc(wx, wy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [color, wispDensity, wispIntensity, flowStrength, fogIntensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
