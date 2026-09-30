import React, { useEffect, useRef, useState } from 'react';
import './GameEffects.css';

export interface ComboEffectData {
  id: number;
  type: 'CHOP' | 'FOUR_OF_KIND' | 'THREE_PAIRS' | 'FOUR_PAIRS' | 'STRAIGHT' | 'DRAGON_STRAIGHT' | 'HEO';
  title: string;
  subtext?: string;
  playerName?: string;
}

interface GameEffectsProps {
  effect: ComboEffectData | null;
  onEffectEnd?: () => void;
}

export const GameEffects: React.FC<GameEffectsProps> = ({ effect, onEffectEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeEffect, setActiveEffect] = useState<ComboEffectData | null>(null);

  // Audio Context Synthesizer for high quality sound effects
  const playComboAudio = (type: ComboEffectData['type']) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'CHOP') {
        // Heavy Bass Impact + Noise Explosion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);

        // Sub-bass thump
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, now);
        sub.frequency.exponentialRampToValueAtTime(20, now + 0.6);
        subGain.gain.setValueAtTime(1.2, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.65);
      } else if (type === 'FOUR_OF_KIND' || type === 'FOUR_PAIRS') {
        // Tứ quý Fanfare chord (C5 - E5 - G5 - C6)
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.08 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      } else if (type === 'HEO') {
        // Heo Golden Bell Sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'STRAIGHT' || type === 'THREE_PAIRS' || type === 'DRAGON_STRAIGHT') {
        // Straight Rising Arpeggio
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.4, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.3);
        });
      }
    } catch (e) {
      console.log('Audio synth error:', e);
    }
  };

  // Canvas Particle Burst Animation
  const launchParticles = (type: ComboEffectData['type']) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const particleCount = type === 'CHOP' ? 80 : type === 'FOUR_OF_KIND' ? 60 : 40;
    const particles: any[] = [];

    const colors = type === 'CHOP'
      ? ['#ff2a4b', '#ff7700', '#ffd700', '#ffffff']
      : type === 'FOUR_OF_KIND'
        ? ['#2ecc71', '#3498db', '#f1c40f', '#ffffff']
        : ['#ffd700', '#f39c12', '#ffffff', '#e74c3c'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: Math.random() * 40 + 40,
        currentLife: 0
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        if (p.currentLife < p.life) {
          aliveCount++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2; // Gravity
          p.vx *= 0.96; // Friction
          p.vy *= 0.96;
          p.currentLife++;
          p.alpha = 1 - p.currentLife / p.life;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();
  };

  useEffect(() => {
    if (!effect) return;

    setActiveEffect(effect);
    playComboAudio(effect.type);
    launchParticles(effect.type);

    const timer = setTimeout(() => {
      setActiveEffect(null);
      if (onEffectEnd) onEffectEnd();
    }, 1500);

    return () => clearTimeout(timer);
  }, [effect]);

  if (!activeEffect) return null;

  const isChop = activeEffect.type === 'CHOP';
  const isFourOfKind = activeEffect.type === 'FOUR_OF_KIND';
  const isHeo = activeEffect.type === 'HEO';

  const bannerClass = isChop ? 'chop' : isFourOfKind ? 'four-of-kind' : isHeo ? 'heo' : 'normal';

  return (
    <div className="effect-overlay-container">
      <canvas ref={canvasRef} className="effect-canvas" />
      <div className={`effect-shockwave ${isChop ? 'chop' : ''}`} />

      <div className="effect-banner">
        <div className={`banner-title ${bannerClass}`}>
          {activeEffect.title}
        </div>
        {activeEffect.subtext && (
          <div className="banner-subtext">
            {activeEffect.subtext}
          </div>
        )}
      </div>
    </div>
  );
};
