'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import type { DomainData, FeaturedExampleData, TaskData } from '@/app/page';

const DOMAIN_COLORS: Record<string, string> = {
  A: '#8b5cf6',
  B: '#22c55e',
  C: '#3b82f6',
  D: '#f59e0b',
  E: '#06b6d4',
  F: '#ef4444',
};

const DOMAIN_BG: Record<string, string> = {
  A: 'rgba(139,92,246,0.08)',
  B: 'rgba(34,197,94,0.08)',
  C: 'rgba(59,130,246,0.08)',
  D: 'rgba(245,158,11,0.08)',
  E: 'rgba(6,182,212,0.08)',
  F: 'rgba(239,68,68,0.08)',
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function withBasePath(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

function getImagePath(task: TaskData): string {
  if (task.overview_image?.path) return withBasePath(task.overview_image.path);
  return `${BASE_PATH}/images/tasks/${task.images.filename}`;
}

interface FeaturedExamplesProps {
  examples: FeaturedExampleData[];
  allTasks: TaskData[];
  domains: [string, DomainData][];
  onSelectTask: (task: TaskData) => void;
}

function FeaturedExamples({ examples, allTasks, domains, onSelectTask }: FeaturedExamplesProps) {
  const domainLookup = useMemo(() => Object.fromEntries(domains), [domains]);
  const taskLookup = useMemo(
    () => new Map(allTasks.map((task) => [task.name, task])),
    [allTasks]
  );

  if (examples.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Star size={18} className="text-cyan-600" />
        <h3 className="text-xl font-semibold text-slate-900">Featured Examples</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {examples.map((example) => {
          const task = taskLookup.get(example.task_name);
          if (!task) return null;
          const domain = domainLookup[example.domain];
          const accent = DOMAIN_COLORS[example.domain] || '#06b6d4';
          return (
            <button
              key={`${example.domain}-${example.task_name}`}
              type="button"
              onClick={() => onSelectTask(task)}
              className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-cyan-300 hover:shadow-lg transition"
            >
              <div className="aspect-[4/3] bg-slate-50 border-b border-slate-100">
                <img
                  src={getImagePath(task)}
                  alt={task.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: accent }}>
                    {example.domain}
                  </span>
                  <span className="text-xs text-slate-400">{domain?.name_en || task.domain_name}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug mb-2">{task.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{example.classic_reason}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  domains: [string, DomainData][];
  getTasksForDomain: (key: string) => TaskData[];
  onSelectTask: (task: TaskData) => void;
  featuredExamples: FeaturedExampleData[];
  allTasks: TaskData[];
  isFiltering: boolean;
}

function TaskCard({
  task,
  accent,
  onSelectTask,
}: {
  task: TaskData;
  accent: string;
  onSelectTask: (task: TaskData) => void;
}) {
  return (
    <motion.div
      className="task-card rounded-xl overflow-hidden border border-slate-200 bg-white hover:bg-slate-50"
      onClick={(e) => {
        e.stopPropagation();
        onSelectTask(task);
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
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
  );
}

export default function DomainExplorer({
  domains,
  getTasksForDomain,
  onSelectTask,
  featuredExamples,
  allTasks,
  isFiltering,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));
  const matchingTasksByDomain = useMemo(
    () => domains.map(([key, domain]) => ({ key, domain, tasks: getTasksForDomain(key) })),
    [domains, getTasksForDomain]
  );
  const matchingTaskCount = matchingTasksByDomain.reduce((total, group) => total + group.tasks.length, 0);

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Explore Tasks</h2>
      <p className="text-slate-500 text-sm mb-10">
        Start from the classic example in each domain, or open a domain to browse every task.
      </p>

      {!isFiltering && (
        <FeaturedExamples
          examples={featuredExamples}
          allTasks={allTasks}
          domains={domains}
          onSelectTask={onSelectTask}
        />
      )}

      {isFiltering && (
        <div className="mb-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Matching Tasks</h3>
              <p className="text-sm text-slate-500 mt-1">
                {matchingTaskCount} task{matchingTaskCount === 1 ? '' : 's'} match the current search and filters.
              </p>
            </div>
          </div>

          {matchingTaskCount > 0 ? (
            <div className="space-y-8">
              {matchingTasksByDomain.map(({ key, domain, tasks }) => {
                if (tasks.length === 0) return null;
                const accent = DOMAIN_COLORS[key] || '#06b6d4';
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{domain.icon}</span>
                      <h4 className="text-sm font-semibold text-slate-800">{domain.name_en}</h4>
                      <span className="text-xs text-slate-400">{tasks.length} tasks</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          accent={accent}
                          onSelectTask={onSelectTask}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">No matching tasks</p>
              <p className="text-xs text-slate-500 mt-1">Try a broader keyword or clear one of the active filters.</p>
            </div>
          )}
        </div>
      )}

      {!isFiltering && (
        <div id="domains" className="mb-4 scroll-mt-8">
          <h3 className="text-xl font-semibold text-slate-900">Browse by Domain</h3>
        </div>
      )}

      {!isFiltering && <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {domains.map(([key, domain]) => {
          const isExpanded = expanded === key;
          const accent = DOMAIN_COLORS[key] || '#06b6d4';
          const bg = DOMAIN_BG[key] || 'rgba(6,182,212,0.08)';
          const tasks = isExpanded ? getTasksForDomain(key) : [];

          return (
            <div key={key} className={isExpanded ? 'col-span-1 sm:col-span-2' : 'col-span-1'}>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                      >
                        <TaskCard task={task} accent={accent} onSelectTask={onSelectTask} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>}
    </section>
  );
}
