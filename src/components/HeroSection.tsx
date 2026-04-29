'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical, Github, ExternalLink, ChevronRight,
  Microscope, Activity, Globe2, Telescope,
  Zap, Atom, Database
} from 'lucide-react';

/* ── Constants ── */
const COMPARE_TASKS = [
  { id: 'lensless_imaging', title: 'Lensless Camera Reconstruction', domain: 'Computational Photography', hasInput: true },
  { id: 'eht_black_hole_original', title: 'EHT Black Hole Imaging', domain: 'Radio Astronomy', hasInput: true },
  { id: 'microscope_denoising', title: 'Fluorescence Microscopy Denoising', domain: 'Biology / Microscopy', hasInput: true },
] as const;

const DOMAIN_ICONS = [Telescope, Microscope, Atom, FlaskConical, Globe2, Activity];
const DOMAIN_LABELS = [
  'Astronomy', 'Biology', 'Physics',
  'Chemistry & Material Science', 'Earth Science', 'Medicine',
];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/* ── Helper: Compare Teaser (custom implementation) ── */
function CompareTeaser({ taskId, title, hasInput }: { taskId: string; title: string; hasInput: boolean }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const leftImg = hasInput ? `${BASE_PATH}/images/compare/${taskId}_input.png` : `${BASE_PATH}/images/compare/${taskId}_gt.png`;
  const rightImg = `${BASE_PATH}/images/compare/${taskId}_recon.png`;
  const leftLabel = hasInput ? 'Input' : 'Ground Truth';
  const rightLabel = 'Reconstruction';

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="teaser-container relative select-none"
        style={{ height: '260px', cursor: isDragging ? 'col-resize' : 'ew-resize' }}
        onMouseDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
        onTouchStart={(e) => { setIsDragging(true); updatePosition(e.touches[0].clientX); }}
      >
        {/* Right (full) */}
        <img src={rightImg} alt={rightLabel} className="absolute inset-0 w-full h-full object-contain bg-black" draggable={false} />
        {/* Left (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
          <img src={leftImg} alt={leftLabel} className="absolute inset-0 w-full h-full object-contain bg-black" style={{ minWidth: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }} draggable={false} />
        </div>
        {/* Slider line */}
        <div className="absolute top-0 bottom-0" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
          <div className="w-0.5 h-full bg-white/80 shadow-lg" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L2 8L5 13M11 3L14 8L11 13" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        {/* Labels */}
        <div className="absolute bottom-2 left-3 bg-black/70 text-xs text-zinc-300 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
          {leftLabel}
        </div>
        <div className="absolute bottom-2 right-3 bg-black/70 text-xs text-cyan-300 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
          {rightLabel}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-slate-700">{title}</p>
        <p className="text-[11px] text-slate-500">{taskId.replace(/_/g, ' ')}</p>
      </div>
    </div>
  );
}

/* ── Main Component ── */
interface HeroProps { totalTasks: number; totalDomains: number; }

export default function HeroSection({ totalTasks, totalDomains }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-500/[0.04] blur-[120px] animate-pulse-slow-delay" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 relative z-10">
        {/* Conference badge */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in">
          <span className="badge">
            <FlaskConical size={14} className="text-cyan-600" />
            ICCP 2026
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 animate-slide-up">
          <span className="text-slate-900">imaging</span>
          <span className="text-slate-900">-</span>
          <span className="gradient-text">101</span>
        </h1>

        {/* Paper title as subtitle */}
        <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl leading-snug mb-4 animate-slide-up font-medium" style={{ animationDelay: '0.05s' }}>
          Benchmarking LLM Agents for Scientific Computational Imaging Problems
        </p>

        {/* Short description */}
        <p className="text-base text-slate-500 max-w-3xl leading-relaxed mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-slate-600">{totalTasks} expert-verified tasks</span> across{' '}
          <span className="text-slate-600">{totalDomains} scientific domains</span>, each grounded in a peer-reviewed paper
          and canonicalized into a standardized four-stage pipeline.
        </p>

        {/* Resource buttons */}
        <div className="flex flex-wrap gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <a href="https://github.com/HeSunPU/imaging-101" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-white hover:bg-slate-800 transition">
            <Github size={16} /> GitHub
          </a>
          <a href="https://huggingface.co/datasets/AI4Imaging/imaging-101" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition">
            <span className="text-base">&#x1F917;</span> HuggingFace
          </a>
          <a href={`${BASE_PATH}/guide/`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-cyan-300 transition">
            <ChevronRight size={16} className="text-teal-600" /> Guide
          </a>
          <a href="#leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition">
            <Activity size={16} /> Leaderboard
          </a>
        </div>

        {/* Abstract */}
        <div className="glass-card p-6 max-w-4xl mb-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ChevronRight size={14} className="text-cyan-600" /> Abstract
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            Computational imaging, which recovers hidden signals from indirect, noisy measurements, underpins
            quantitative discovery across scientific disciplines, yet building a correct reconstruction pipeline
            demands deep domain expertise and remains laborious even for domain scientists.
            We introduce <strong className="text-slate-800">Imaging-101</strong>, a benchmark of{' '}
            <strong className="text-slate-800">57 expert-verified computational imaging tasks</strong> spanning{' '}
            <strong className="text-slate-800">six scientific domains</strong>, each grounded in a peer-reviewed
            paper and canonicalized into a standardized four-stage pipeline (preprocessing, forward physics
            modeling, inverse solver, and visualization). Three evaluation tracks (planning, function-level
            unit tests, and end-to-end reconstruction) probe distinct agent capabilities across the full pipeline.
            Evaluating seven frontier LLMs uncovers systematic challenges in applying coding agents to
            computational imaging that go beyond those exposed by general coding benchmarks, spanning algorithm
            selection, physical convention handling, and pipeline integration.
          </p>
        </div>

        {/* Domain Icons */}
        <div className="flex flex-wrap gap-3 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {DOMAIN_ICONS.map((Icon, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-600 hover:border-cyan-300 hover:text-slate-800 transition">
              <Icon size={14} className="text-cyan-600" />
              {DOMAIN_LABELS[i]}
            </div>
          ))}
        </div>

        {/* Compare Sliders */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={14} className="text-cyan-600" /> Example Reconstructions — Drag to Compare
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMPARE_TASKS.map((t) => (
              <CompareTeaser key={t.id} taskId={t.id} title={t.title} hasInput={t.hasInput} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
