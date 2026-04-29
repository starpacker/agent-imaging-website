'use client';

import { useState, useMemo } from 'react';
import { Target } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

/* ── Model colors ── */
const MODEL_COLORS: Record<string, string> = {
  'Claude-4.6-Opus': '#E07A5F',
  'Gemini-3.1-Pro': '#4285F4',
  'GPT-5.4': '#10a37f',
  'Kimi-K2.5': '#7B2FF7',
  'GLM-5': '#FF6B35',
  'DeepSeek-V3': '#0066FF',
  'Qwen3.6-Plus': '#FF4500',
};

interface DomainRadarEntry {
  domain_name: string;
  [model: string]: string | number;
}

interface DomainRadarChartProps {
  data: Record<string, DomainRadarEntry> | undefined;
  models: string[];
}

export default function DomainRadarChart({ data, models }: DomainRadarChartProps) {
  const [activeModels, setActiveModels] = useState<Set<string>>(new Set(models));

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

        <div className="w-full" style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fontSize: 12, fill: '#475569' }}
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
                  fillOpacity={0.06}
                  strokeWidth={2}
                  dot={{ r: 3, fill: MODEL_COLORS[m] || '#666' }}
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
