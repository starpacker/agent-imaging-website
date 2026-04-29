'use client';

import { useState, useMemo } from 'react';
import { Target } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

/* ── Model colors — maximally distinct hues ── */
const MODEL_COLORS: Record<string, string> = {
  'Claude-4.6-Opus': '#d97706',   // amber
  'Gemini-3.1-Pro': '#2563eb',   // blue
  'GPT-5.4': '#059669',           // emerald
  'Kimi-K2.5': '#7c3aed',         // violet
  'GLM-5': '#dc2626',             // red
  'DeepSeek-V3': '#0d9488',       // teal
  'Qwen3.6-Plus': '#c026d3',      // fuchsia
};

interface DomainRadarEntry {
  domain_name: string;
  [model: string]: string | number;
}

interface DomainRadarChartProps {
  data: Record<string, DomainRadarEntry> | undefined;
  models: string[];
}

const DEFAULT_SHOWN = new Set(['Claude-4.6-Opus', 'Gemini-3.1-Pro', 'GPT-5.4']);

export default function DomainRadarChart({ data, models }: DomainRadarChartProps) {
  const [activeModels, setActiveModels] = useState<Set<string>>(DEFAULT_SHOWN);

  const chartData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([key, entry]) => ({
      domain: entry.domain_name,
      ...Object.fromEntries(
        models.map((m) => [m, typeof entry[m] === 'number' ? entry[m] : 0])
      ),
    }));
  }, [data, models]);

  if (!data || chartData.length === 0) return null;

  const toggleModel = (modelName: string) => {
    setActiveModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelName)) {
        if (next.size > 1) next.delete(modelName);
      } else {
        next.add(modelName);
      }
      return next;
    });
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Target size={20} className="text-cyan-600" />
          <h2 className="text-xl font-bold text-slate-900">Domain Specialization</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Function-level task pass rate by scientific domain. Click legend to toggle models.
        </p>

        {/* Model toggle chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {models.map((m) => {
            const active = activeModels.has(m);
            const color = MODEL_COLORS[m] || '#666';
            return (
              <button
                key={m}
                onClick={() => toggleModel(m)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition"
                style={{
                  background: active ? `${color}15` : 'transparent',
                  borderColor: active ? color : '#e2e8f0',
                  color: active ? color : '#94a3b8',
                  opacity: active ? 1 : 0.5,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: active ? color : '#cbd5e1' }}
                />
                {m}
              </button>
            );
          })}
        </div>

        <div className="w-full flex justify-center" style={{ height: 540 }}>
          <ResponsiveContainer width="100%" height="100%" maxHeight={540}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickCount={6}
              />
              {models.filter((m) => activeModels.has(m)).map((m) => (
                <Radar
                  key={m}
                  name={m}
                  dataKey={m}
                  stroke={MODEL_COLORS[m] || '#666'}
                  fill={MODEL_COLORS[m] || '#666'}
                  fillOpacity={0.04}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: MODEL_COLORS[m] || '#666', strokeWidth: 0 }}
                />
              ))}
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => `${Number(value).toFixed(1)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
