'use client';

import { Search, X } from 'lucide-react';
import type { DomainData } from '@/app/page';

const DOMAIN_COLORS: Record<string, string> = {
  A: '#8b5cf6', B: '#22c55e', C: '#3b82f6',
  D: '#f59e0b', E: '#06b6d4', F: '#ef4444',
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const DIFF_COLORS: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDomains: Set<string>;
  onToggleDomain: (key: string) => void;
  activeDifficulties: Set<string>;
  onToggleDifficulty: (d: string) => void;
  onClearAll: () => void;
  domains: [string, DomainData][];
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeDomains,
  onToggleDomain,
  activeDifficulties,
  onToggleDifficulty,
  onClearAll,
  domains,
}: SearchFilterBarProps) {
  const hasFilters = searchQuery || activeDomains.size > 0 || activeDifficulties.size > 0;

  return (
    <section className="max-w-6xl mx-auto px-6 py-4">
      <div className="glass-card p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by name, keyword, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-200 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Domain:</span>
          {domains.map(([key, domain]) => {
            const active = activeDomains.has(key);
            const color = DOMAIN_COLORS[key] || '#06b6d4';
            return (
              <button
                key={key}
                onClick={() => onToggleDomain(key)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition"
                style={{
                  background: active ? `${color}18` : 'transparent',
                  borderColor: active ? color : '#e2e8f0',
                  color: active ? color : '#64748b',
                }}
              >
                {domain.icon} {domain.name_en}
              </button>
            );
          })}

          <span className="text-slate-300 mx-1">|</span>
          <span className="text-xs text-slate-500 mr-1">Difficulty:</span>
          {DIFFICULTIES.map((d) => {
            const active = activeDifficulties.has(d);
            return (
              <button
                key={d}
                onClick={() => onToggleDifficulty(d)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                  active ? DIFF_COLORS[d] : 'border-slate-200 text-slate-400'
                }`}
              >
                {d}
              </button>
            );
          })}

          {hasFilters && (
            <button
              onClick={onClearAll}
              className="ml-2 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
