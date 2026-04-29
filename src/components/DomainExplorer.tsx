'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { DomainData, TaskData } from '@/app/page';

/* ── Color Maps (9 domains A–I) ── */
const DOMAIN_COLORS: Record<string, string> = {
  A: '#8b5cf6', B: '#22c55e', C: '#3b82f6',
  D: '#f59e0b', E: '#06b6d4', F: '#ef4444',
};
const DOMAIN_BG: Record<string, string> = {
  A: 'rgba(139,92,246,0.08)', B: 'rgba(34,197,94,0.08)', C: 'rgba(59,130,246,0.08)',
  D: 'rgba(245,158,11,0.08)', E: 'rgba(6,182,212,0.08)', F: 'rgba(239,68,68,0.08)',
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getImagePath(task: TaskData): string {
  return `${BASE_PATH}/images/tasks/${task.images.filename}`;
}

interface Props {
  domains: [string, DomainData][];
  getTasksForDomain: (key: string) => TaskData[];
  onSelectTask: (task: TaskData) => void;
}

export default function DomainExplorer({ domains, getTasksForDomain, onSelectTask }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));

  return (
    <section className="max-w-6xl mx-auto px-6 py-12" id="domains">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Explore by Domain</h2>
      <p className="text-slate-500 text-sm mb-10">Click a domain to reveal its tasks. Click any task card for details.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {domains.map(([key, domain]) => {
          const isExpanded = expanded === key;
          const accent = DOMAIN_COLORS[key] || '#06b6d4';
          const bg = DOMAIN_BG[key] || 'rgba(6,182,212,0.08)';
          const tasks = isExpanded ? getTasksForDomain(key) : [];

          return (
            <div key={key} className={isExpanded ? 'col-span-1 sm:col-span-2' : 'col-span-1'}>
              {/* Domain Card */}
              <div
                className="domain-card glass-card neon-border p-5 rounded-2xl"
                style={{ borderColor: isExpanded ? `${accent}33` : undefined }}
                onClick={() => toggle(key)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{domain.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-wider" style={{ color: accent }}>
                          {key}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900">{domain.name_en}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{domain.name_zh}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: bg, color: accent }}>
                      {domain.task_count} tasks
                    </span>
                    {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{domain.desc}</p>
              </div>

              {/* Expanded Task Grid */}
              <AnimatePresence>
                {isExpanded && tasks.length > 0 && (
                  <motion.div
                    className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {tasks.map((task, idx) => (
                      <motion.div
                        key={task.id}
                        className="task-card rounded-xl overflow-hidden border border-slate-200 bg-white hover:bg-slate-50"
                        onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <div className="aspect-[4/3] relative bg-slate-50 overflow-hidden">
                          <img
                            src={getImagePath(task)}
                            alt={task.title}
                            className="w-full h-full object-contain opacity-90 hover:opacity-100 transition"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${accent}18`, color: accent }}>
                              {task.id}
                            </span>
                          </div>
                          {task.difficulty && (
                            <div className="absolute top-2 right-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                task.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                                task.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                                'bg-yellow-100 text-yellow-600'
                              }`}>
                                {task.difficulty}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug">{task.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{task.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
