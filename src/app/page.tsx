'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import HeroSection from '@/components/HeroSection';
import Leaderboard from '@/components/Leaderboard';
import DomainRadarChart from '@/components/DomainRadarChart';
import DomainHeatmap from '@/components/DomainHeatmap';
import DomainExplorer from '@/components/DomainExplorer';
import StatsBar from '@/components/StatsBar';
import SearchFilterBar from '@/components/SearchFilterBar';
import TaskModal from '@/components/TaskModal';
import DownloadButton from '@/components/DownloadButton';
import Citation from '@/components/Citation';
import Footer from '@/components/Footer';
import MotionWrapper from '@/components/MotionWrapper';

/* ── Type definitions ── */
export interface TaskData {
  id: string;
  id_num: number;
  name: string;
  domain: string;
  domain_name: string;
  title: string;
  description: string;
  difficulty?: string;
  has_tests?: boolean;
  metrics: {
    psnr?: number | string;
    ssim?: number | string;
    ncc?: number | string;
    nrmse?: number | string;
    [key: string]: unknown;
  };
  images: { filename: string };
  overview_image?: {
    path: string;
    source: string;
    source_image?: string;
  };
  readme_markdown?: string;
  readme_url?: string;
  paper_link?: string;
  source_github?: string;
  references?: string;
}

export interface DomainData {
  name_en: string;
  name_zh: string;
  icon: string;
  desc: string;
  task_count: number;
  task_ids: number[];
}

export interface FeaturedExampleData {
  domain: string;
  task_name: string;
  classic_reason: string;
}

export interface TasksDB {
  meta: { title: string; total_tasks: number; total_domains: number };
  domains: Record<string, DomainData>;
  tasks: Record<string, TaskData>;
  featured_examples?: FeaturedExampleData[];
}

interface ModelResultsData {
  models: string[];
  function_mode: Record<string, unknown>;
  e2e_claude_code: Record<string, unknown>;
  domain_radar: Record<string, { domain_name: string; [key: string]: string | number }>;
}

/* ── Resolve basePath at runtime for fetch / img URLs ── */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function getTaskUrl(taskName: string): string {
  return `${BASE_PATH}/tasks/${taskName}/`;
}

function getHomeUrl(): string {
  return `${BASE_PATH}/`;
}

function getTaskNameFromPathname(pathname: string): string | null {
  const taskPrefix = `${BASE_PATH}/tasks/`;
  if (!pathname.startsWith(taskPrefix)) return null;

  const taskName = pathname.slice(taskPrefix.length).split('/')[0];
  return taskName ? decodeURIComponent(taskName) : null;
}

/* ── Page Component ── */
export default function Home({ initialTaskName }: { initialTaskName?: string } = {}) {
  const [db, setDb] = useState<TasksDB | null>(null);
  const [modelResults, setModelResults] = useState<ModelResultsData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set());
  const [activeDifficulties, setActiveDifficulties] = useState<Set<string>>(new Set());

  // Open task: push history state so browser back closes the modal
  const openTask = useCallback((task: TaskData) => {
    setSelectedTask(task);
    history.pushState({ taskModal: true, taskName: task.name }, '', getTaskUrl(task.name));
  }, []);

  // Close task: just clear state (called from popstate or from modal's onClose)
  const closeTask = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // Close via explicit action (X button, overlay click, Escape): go back in history
  const closeTaskViaAction = useCallback(() => {
    if (history.state?.taskModal) {
      history.back();
      return;
    }

    setSelectedTask(null);
    history.pushState({}, '', getHomeUrl());
  }, []);

  useEffect(() => {
    if (!db || !initialTaskName) return;

    const taskFromUrl = Object.values(db.tasks).find((task) => task.name === initialTaskName);
    if (taskFromUrl) {
      setSelectedTask(taskFromUrl);
    }
  }, [db, initialTaskName]);

  // Keep the modal in sync with browser Back/Forward task URLs.
  useEffect(() => {
    if (!db) return;

    const syncTaskFromUrl = () => {
      const taskName = getTaskNameFromPathname(window.location.pathname);
      if (!taskName) {
        setSelectedTask(null);
        return;
      }

      const taskFromUrl = Object.values(db.tasks).find((task) => task.name === taskName);
      setSelectedTask(taskFromUrl ?? null);
    };

    window.addEventListener('popstate', syncTaskFromUrl);
    return () => window.removeEventListener('popstate', syncTaskFromUrl);
  }, [db]);

  // Fetch data
  useEffect(() => {
    fetch(`${BASE_PATH}/data/tasks_db.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: TasksDB) => setDb(data))
      .catch((e) => setError(e.message));

    fetch(`${BASE_PATH}/data/model_results.json`)
      .then((r) => r.json())
      .then((data: ModelResultsData) => setModelResults(data))
      .catch(() => {}); // non-critical
  }, []);

  const domainEntries = useMemo(
    () => (db ? Object.entries(db.domains) : []),
    [db]
  );

  const getTasksForDomain = useCallback(
    (domainKey: string): TaskData[] => {
      if (!db) return [];
      const domain = db.domains[domainKey];
      if (!domain) return [];
      return domain.task_ids
        .map((id) => {
          const padded = String(id).padStart(2, '0');
          return db.tasks[`task_${padded}`];
        })
        .filter(Boolean);
    },
    [db]
  );

  const getFilteredTasksForDomain = useCallback(
    (domainKey: string): TaskData[] => {
      const tasks = getTasksForDomain(domainKey);
      const q = searchQuery.trim().toLowerCase();
      return tasks.filter((t) => {
        if (activeDifficulties.size > 0 && t.difficulty && !activeDifficulties.has(t.difficulty)) {
          return false;
        }
        if (q) {
          return (
            t.name.toLowerCase().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.domain_name.toLowerCase().includes(q) ||
            (t.readme_markdown || '').toLowerCase().includes(q)
          );
        }
        return true;
      });
    },
    [getTasksForDomain, searchQuery, activeDifficulties]
  );

  const hasActiveFilters = searchQuery.trim().length > 0 || activeDomains.size > 0 || activeDifficulties.size > 0;

  // Filtered domain entries and tasks
  const filteredDomainEntries = useMemo(() => {
    const domainFiltered = activeDomains.size === 0
      ? domainEntries
      : domainEntries.filter(([key]) => activeDomains.has(key));

    if (!hasActiveFilters) return domainFiltered;
    return domainFiltered.filter(([key]) => getFilteredTasksForDomain(key).length > 0);
  }, [domainEntries, activeDomains, hasActiveFilters, getFilteredTasksForDomain]);

  // Filter toggles
  const toggleDomain = useCallback((key: string) => {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleDifficulty = useCallback((d: string) => {
    setActiveDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setActiveDomains(new Set());
    setActiveDifficulties(new Set());
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">&#x26a0;&#xfe0f;</div>
          <h2 className="text-lg font-semibold text-red-600 mb-2">Failed to load data</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm tracking-wide">Loading benchmark data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="grid-bg min-h-screen">
      <HeroSection totalTasks={db.meta.total_tasks} totalDomains={db.meta.total_domains} />

      <div id="explore-tasks">
        <MotionWrapper>
          <StatsBar domains={domainEntries} />
        </MotionWrapper>

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDomains={activeDomains}
          onToggleDomain={toggleDomain}
          activeDifficulties={activeDifficulties}
          onToggleDifficulty={toggleDifficulty}
          onClearAll={clearAllFilters}
          domains={domainEntries}
        />

        <DomainExplorer
          domains={filteredDomainEntries}
          getTasksForDomain={getFilteredTasksForDomain}
          onSelectTask={openTask}
          featuredExamples={db.featured_examples || []}
          allTasks={Object.values(db.tasks)}
          isFiltering={hasActiveFilters}
        />
      </div>

      <MotionWrapper>
        <Leaderboard />
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <DomainRadarChart
          data={modelResults?.domain_radar}
          models={modelResults?.models || []}
        />
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <DomainHeatmap data={modelResults?.domain_radar} />
      </MotionWrapper>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={closeTaskViaAction} />
      )}

      <MotionWrapper>
        <DownloadButton />
      </MotionWrapper>

      <MotionWrapper>
        <Citation />
      </MotionWrapper>

      <Footer />
    </main>
  );
}
