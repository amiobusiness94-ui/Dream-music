import { useEffect, useRef } from 'react';

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 120;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw 3 layered waves for depth
      const waves = [
        { amplitude: 35, frequency: 0.008, speed: 0.04, color: 'rgba(168, 85, 247, 0.4)' }, // purple
        { amplitude: 20, frequency: 0.015, speed: 0.06, color: 'rgba(59, 130, 246, 0.3)' },  // blue
        { amplitude: 10, frequency: 0.025, speed: 0.08, color: 'rgba(14, 165, 233, 0.2)' }   // cyan
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * wave.frequency + phase * wave.speed) * wave.amplitude * Math.sin(x * 0.003);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      phase += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="w-full relative py-2 overflow-hidden h-[120px] rounded-lg bg-slate-950/20 backdrop-blur-sm border border-slate-900/40">
      <div className="absolute top-2 left-4 text-[10px] font-mono tracking-widest text-purple-400 uppercase animate-pulse">
        Live Studio Waveform
      </div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
