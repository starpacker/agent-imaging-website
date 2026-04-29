'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, TestTube2, BookOpen, Eye, Code2, Github, FileText } from 'lucide-react';
import type { TaskData } from '@/app/page';
import NotebookViewer from './NotebookViewer';

/* ── Domain accent colors (9 domains A–I) ── */
const DOMAIN_ACCENT: Record<string, string> = {
  A: '#8b5cf6', B: '#22c55e', C: '#3b82f6',
  D: '#f59e0b', E: '#06b6d4', F: '#ef4444',
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getImagePath(task: TaskData): string {
  return `${BASE_PATH}/images/tasks/${task.images.filename}`;
}

/* ── Metric Pill ── */
function MetricPill({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
      <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800 ml-auto">{value}</span>
    </div>
  );
}

/* ── Description Block ── */
function DescriptionBlock({ text, accent }: { text: string; accent: string }) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  return (
    <div className="space-y-2.5">
      {lines.map((line, idx) => {
        const item = line.match(/^(\d+)\.\s*(?:\*\*(.+?)\*\*|([^:]+)):\s*(.*)$/);
        if (item) {
          const num = item[1];
          const label = (item[2] || item[3] || '').trim();
          const content = item[4].trim();
          return (
            <div key={`${idx}-${num}`} className="text-sm text-slate-500 leading-relaxed">
              <span className="text-slate-700">{num}.</span>{' '}
              <span className="font-semibold" style={{ color: accent }}>{label}</span>
              {content ? <>: {content}</> : null}
            </div>
          );
        }
        const cleaned = line.replace(/\*\*(.*?)\*\*/g, '$1');
        return (
          <p key={idx} className="text-sm text-slate-500 leading-relaxed">
            {cleaned}
          </p>
        );
      })}
    </div>
  );
}

/* ── Tab Button ── */
function TabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
        active
          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Main Modal ── */
interface TaskModalProps { task: TaskData; onClose: () => void; }

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const accent = DOMAIN_ACCENT[task.domain] || '#06b6d4';
  const [activeTab, setActiveTab] = useState<'overview' | 'notebook'>('overview');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reset tab when task changes
  useEffect(() => { setActiveTab('overview'); }, [task.name]);

  const imagePath = getImagePath(task);
  const hasMetrics = task.metrics && (task.metrics.psnr || task.metrics.ssim || task.metrics.ncc || task.metrics.nrmse);
  const githubLink = `https://github.com/HeSunPU/imaging-101/tree/main/tasks/${task.name}`;
  const nbLink = `https://github.com/HeSunPU/imaging-101/tree/main/tasks/${task.name}/notebooks`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full h-full flex flex-col overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${accent}18`, color: accent }}>
              {task.id}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">{task.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${accent}18`, color: accent }}>
                  {task.domain_name}
                </span>
                <span>{task.name}</span>
                {task.difficulty && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    task.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                    task.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {task.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Eye size={14} />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'notebook'}
            onClick={() => setActiveTab('notebook')}
            icon={<Code2 size={14} />}
            label="Notebook"
          />
          <div className="flex-1" />
          <a
            href={nbLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-600 transition"
          >
            <BookOpen size={13} />
            GitHub
            <ExternalLink size={10} className="opacity-50" />
          </a>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x lg:divide-slate-200">
              {/* Left: Description */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Task Description</h3>
                  <DescriptionBlock text={task.description} accent={accent} />
                </div>

                {/* Links & Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {task.paper_link && (
                      <a
                        href={task.paper_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 text-xs font-medium text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition"
                      >
                        <FileText size={13} />
                        Paper
                        <ExternalLink size={10} className="opacity-50" />
                      </a>
                    )}
                    {task.source_github && (
                      <a
                        href={task.source_github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                      >
                        <Github size={13} />
                        Source Code
                        <ExternalLink size={10} className="opacity-50" />
                      </a>
                    )}
                    <a
                      href={githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 bg-cyan-50 text-xs font-medium text-cyan-700 hover:bg-cyan-100 hover:border-cyan-300 transition"
                    >
                      <BookOpen size={13} />
                      Task
                      <ExternalLink size={10} className="opacity-50" />
                    </a>
                  </div>
                  {task.has_tests && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <TestTube2 size={14} />
                      Has unit tests (function-mode evaluation)
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Image + Metrics */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Notebook Visualization</h3>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={imagePath} alt={task.title} className="w-full h-auto" loading="lazy" />
                  </div>
                </div>

                {hasMetrics && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Metrics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {task.metrics.ncc && <MetricPill label="NCC" value={task.metrics.ncc} accent={accent} />}
                      {task.metrics.nrmse && <MetricPill label="NRMSE" value={task.metrics.nrmse} accent={accent} />}
                      {task.metrics.psnr && <MetricPill label="PSNR" value={task.metrics.psnr} accent={accent} />}
                      {task.metrics.ssim && <MetricPill label="SSIM" value={task.metrics.ssim} accent={accent} />}
                    </div>
                  </div>
                )}

                {/* Domain Info */}
                <div className="metric-highlight">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: accent }} />
                    <span className="text-sm font-semibold text-slate-800">{task.domain_name}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Domain {task.domain} &bull; {task.title}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Notebook Tab */
            <div className="p-6">
              <NotebookViewer taskName={task.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
