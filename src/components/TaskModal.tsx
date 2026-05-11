'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { X, Eye, Code2, BarChart3, Box } from 'lucide-react';
import type { TaskData } from '@/app/page';
import NotebookViewer from './NotebookViewer';
import TaskModelComparison from './TaskModelComparison';
import MarkdownContent from './MarkdownContent';
import ThreeDTaskViewer, { hasThreeDView } from './ThreeDTaskViewer';

const DOMAIN_ACCENT: Record<string, string> = {
  A: '#8b5cf6',
  B: '#22c55e',
  C: '#3b82f6',
  D: '#f59e0b',
  E: '#06b6d4',
  F: '#ef4444',
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getImagePath(task: TaskData): string {
  if (task.overview_image?.path) {
    return `${BASE_PATH}${task.overview_image.path}`;
  }
  return `${BASE_PATH}/images/tasks/${task.images.filename}`;
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
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

interface TaskModalProps {
  task: TaskData;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const accent = DOMAIN_ACCENT[task.domain] || '#06b6d4';
  const [activeTab, setActiveTab] = useState<'overview' | 'notebook' | 'threeD' | 'models'>('overview');
  const has3D = hasThreeDView(task.name);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    setActiveTab('overview');
  }, [task.name]);

  const imagePath = getImagePath(task);
  const readmeContent = task.readme_markdown || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full h-full flex flex-col overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: `${accent}18`, color: accent }}
            >
              {task.id}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">{task.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: `${accent}18`, color: accent }}
                >
                  {task.domain_name}
                </span>
                <span>{task.name}</span>
                {task.difficulty && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      task.difficulty === 'Hard'
                        ? 'bg-red-100 text-red-600'
                        : task.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {task.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition"
            aria-label="Close task details"
          >
            <X size={18} />
          </button>
        </div>

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
          {has3D && (
            <TabButton
              active={activeTab === 'threeD'}
              onClick={() => setActiveTab('threeD')}
              icon={<Box size={14} />}
              label="3D View"
            />
          )}
          <TabButton
            active={activeTab === 'models'}
            onClick={() => setActiveTab('models')}
            icon={<BarChart3 size={14} />}
            label="Model Results"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(340px,42vw)] min-h-full xl:divide-x xl:divide-slate-200">
              <section data-overview-readme-panel className="p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">README.md</h3>
                  {task.readme_url && (
                    <a
                      href={task.readme_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-700 hover:underline break-all"
                    >
                      Source README
                    </a>
                  )}
                </div>
                <div
                  data-readme-source-url={task.readme_url}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <MarkdownContent content={readmeContent} taskName={task.name} />
                </div>
              </section>

              <aside data-overview-image-panel className="p-6 bg-slate-50/60">
                <div className="xl:sticky xl:top-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Final Reconstruction
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <img
                      data-final-reconstruction-image
                      src={imagePath}
                      alt={`${task.title} final reconstruction`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
              </aside>
            </div>
          ) : activeTab === 'notebook' ? (
            <div className="p-6">
              <NotebookViewer taskName={task.name} />
            </div>
          ) : activeTab === 'threeD' ? (
            <div className="p-6">
              <ThreeDTaskViewer taskName={task.name} />
            </div>
          ) : (
            <div className="p-6">
              <TaskModelComparison taskName={task.name} accent={accent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
