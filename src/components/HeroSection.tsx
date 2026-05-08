'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Atom,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Github,
  Globe2,
  Microscope,
  Telescope,
} from 'lucide-react';

const DOMAIN_ICONS = [Telescope, Microscope, Atom, FlaskConical, Globe2, Activity];
const DOMAIN_LABELS = [
  'Astronomy',
  'Biology',
  'Physics',
  'Chemistry & Material Science',
  'Earth Science',
  'Medicine',
];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface HeroProps {
  totalTasks: number;
  totalDomains: number;
}

export default function HeroSection({ totalTasks, totalDomains }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={`${BASE_PATH}/images/hero_banner.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 relative z-10">
        <motion.div
          className="flex flex-wrap items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge">
            <FlaskConical size={14} className="text-cyan-600" />
            ICCP 2026
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-slate-900">imaging</span>
          <span className="text-slate-900">-</span>
          <span className="gradient-text">101</span>
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-slate-600 max-w-4xl leading-snug mb-4 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Benchmarking LLM Agents for Scientific Computational Imaging Problems
        </motion.p>

        <motion.p
          className="text-base text-slate-500 max-w-3xl leading-relaxed mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-slate-600">{totalTasks} expert-verified tasks</span> across{' '}
          <span className="text-slate-600">{totalDomains} scientific domains</span>, each grounded in a peer-reviewed paper
          and canonicalized into a standardized four-stage pipeline.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="https://github.com/HeSunPU/imaging-101"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            <Github size={16} /> GitHub
          </a>
          <a
            href="https://huggingface.co/datasets/starpacker52/imaging-101"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition"
          >
            <ExternalLink size={16} /> HuggingFace
          </a>
          <a
            href="#explore-tasks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-sm font-medium text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition"
          >
            <Microscope size={16} /> Explore Tasks
          </a>
          <a
            href="#leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition"
          >
            <Activity size={16} /> Leaderboard
          </a>
        </motion.div>

        <motion.div
          className="glass-card p-6 max-w-4xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ChevronRight size={14} className="text-cyan-600" /> Abstract
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            Computational imaging, which recovers hidden signals from indirect, noisy measurements, underpins
            quantitative discovery across scientific disciplines, yet building a correct reconstruction pipeline
            demands deep domain expertise and remains laborious even for domain scientists. We introduce{' '}
            <strong className="text-slate-800">Imaging-101</strong>, a benchmark of{' '}
            <strong className="text-slate-800">57 expert-verified computational imaging tasks</strong> spanning{' '}
            <strong className="text-slate-800">six scientific domains</strong>, each grounded in a peer-reviewed
            paper and canonicalized into a standardized four-stage pipeline.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {DOMAIN_ICONS.map((Icon, i) => (
            <motion.div
              key={DOMAIN_LABELS[i]}
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-600 hover:border-cyan-300 hover:text-slate-800 transition cursor-default"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={14} className="text-cyan-600" />
              {DOMAIN_LABELS[i]}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
