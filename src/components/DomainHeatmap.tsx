'use client';

import { LayoutGrid } from 'lucide-react';

const MODEL_ORDER = [
  'Claude-4.6-Opus', 'Gemini-3.1-Pro', 'GPT-5.4', 'Kimi-K2.5',
  'GLM-5', 'DeepSeek-V3', 'Qwen3.6-Plus',
];

const MODEL_SHORT: Record<string, string> = {
  'Claude-4.6-Opus': 'Claude',
  'Gemini-3.1-Pro': 'Gemini',
  'GPT-5.4': 'GPT-5.4',
  'Kimi-K2.5': 'Kimi',
  'GLM-5': 'GLM-5',
  'DeepSeek-V3': 'DeepSeek',
  'Qwen3.6-Plus': 'Qwen',
};

const DOMAIN_ICONS: Record<string, string> = {
  A: '\uD83D\uDD2D', B: '\uD83E\uDDEC', C: '\u2697\uFE0F',
  D: '\uD83E\uDDEA', E: '\uD83C\uDF0D', F: '\u2695\uFE0F',
};

interface DomainRadarEntry {
  domain_name: string;
  [model: string]: string | number;
}

interface DomainHeatmapProps {
  data: Record<string, DomainRadarEntry> | undefined;
}

function getHeatColor(pct: number): string {
  // Gradient: red(0%) -> amber(30%) -> yellow(50%) -> lime(70%) -> green(100%)
  if (pct >= 80) return 'bg-emerald-100 text-emerald-800';
  if (pct >= 60) return 'bg-green-50 text-green-700';
  if (pct >= 40) return 'bg-yellow-50 text-yellow-700';
  if (pct >= 20) return 'bg-orange-50 text-orange-700';
  return 'bg-red-50 text-red-700';
}

function getBarWidth(pct: number): string {
  return `${Math.max(pct, 2)}%`;
}

function getBarColor(pct: number): string {
  if (pct >= 80) return '#10b981';
  if (pct >= 60) return '#22c55e';
  if (pct >= 40) return '#eab308';
  if (pct >= 20) return '#f97316';
  return '#ef4444';
}

export default function DomainHeatmap({ data }: DomainHeatmapProps) {
  if (!data) return null;

  const domains = Object.entries(data);

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid size={20} className="text-cyan-600" />
          <h2 className="text-xl font-bold text-slate-900">Performance Across Domains</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Percentage of tasks fully passed (function-level) per model and domain.
        </p>

        {/* Heatmap grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium w-28">Model</th>
                {domains.map(([key, d]) => (
                  <th key={key} className="text-center py-3 px-2 text-slate-500 font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base">{DOMAIN_ICONS[key]}</span>
                      <span className="text-[10px] leading-tight">{d.domain_name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODEL_ORDER.map((model, i) => (
                <tr
                  key={model}
                  className={`border-b border-slate-100 transition hover:bg-slate-50 ${i === 0 ? 'bg-cyan-50/30' : ''}`}
                >
                  <td className="py-2.5 px-3">
                    <span className="text-xs font-medium text-slate-800">
                      {MODEL_SHORT[model] || model}
                    </span>
                  </td>
                  {domains.map(([key, d]) => {
                    const pct = typeof d[model] === 'number' ? (d[model] as number) : 0;
                    return (
                      <td key={key} className="py-2.5 px-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getHeatColor(pct)}`}>
                            {pct.toFixed(0)}%
                          </span>
                          <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: getBarWidth(pct), background: getBarColor(pct) }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Color legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] text-slate-400">Legend:</span>
          {[
            { label: '0-19%', cls: 'bg-red-50 text-red-700' },
            { label: '20-39%', cls: 'bg-orange-50 text-orange-700' },
            { label: '40-59%', cls: 'bg-yellow-50 text-yellow-700' },
            { label: '60-79%', cls: 'bg-green-50 text-green-700' },
            { label: '80-100%', cls: 'bg-emerald-100 text-emerald-800' },
          ].map((l) => (
            <span key={l.label} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${l.cls}`}>
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
