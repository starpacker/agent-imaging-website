'use client';

import { useState, useEffect } from 'react';
import { Check, X as XIcon, Minus, BarChart3 } from 'lucide-react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const MODEL_ORDER = [
  'Claude-4.6-Opus', 'Gemini-3.1-Pro', 'GPT-5.4', 'Kimi-K2.5',
  'GLM-5', 'DeepSeek-V3', 'Qwen3.6-Plus',
];

const MODEL_COLORS: Record<string, string> = {
  'Claude-4.6-Opus': '#E07A5F',
  'Gemini-3.1-Pro': '#4285F4',
  'GPT-5.4': '#10a37f',
  'Kimi-K2.5': '#7B2FF7',
  'GLM-5': '#FF6B35',
  'DeepSeek-V3': '#0066FF',
  'Qwen3.6-Plus': '#FF4500',
};

interface ModelResults {
  models: string[];
  function_mode: Record<string, Record<string, {
    score?: string;
    overall?: string;
    preprocessing?: string;
    physics_model?: string;
    solvers?: string;
    preprocessing_score?: string;
    physics_model_score?: string;
    solvers_score?: string;
  }>>;
  e2e_claude_code: Record<string, {
    ncc: number | null;
    nrmse: number | null;
    psnr: number | null;
    ssim: number | null;
    verdict: string;
  }>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return <Check size={14} className="text-green-600" />;
  if (status === 'fail') return <XIcon size={14} className="text-red-500" />;
  return <Minus size={14} className="text-slate-300" />;
}

function StatusCell({ status, score }: { status: string; score?: string }) {
  const bg = status === 'pass' ? 'bg-green-50' : status === 'fail' ? 'bg-red-50' : 'bg-slate-50';
  return (
    <td className={`text-center py-2 px-1.5 ${bg}`} title={score || ''}>
      <StatusIcon status={status} />
    </td>
  );
}

interface TaskModelComparisonProps {
  taskName: string;
  accent: string;
}

export default function TaskModelComparison({ taskName, accent }: TaskModelComparisonProps) {
  const [data, setData] = useState<ModelResults | null>(null);
  const [track, setTrack] = useState<'function' | 'e2e'>('function');

  useEffect(() => {
    fetch(`${BASE_PATH}/data/model_results.json`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
      </div>
    );
  }

  const funcTask = data.function_mode[taskName];
  const e2eTask = data.e2e_claude_code[taskName];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 size={18} style={{ color: accent }} />
        <h3 className="text-sm font-semibold text-slate-700">Model Comparison</h3>
      </div>

      {/* Track tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTrack('function')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            track === 'function'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              : 'text-slate-500 hover:text-slate-700 border border-transparent'
          }`}
        >
          Function-Level (7 models)
        </button>
        <button
          onClick={() => setTrack('e2e')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            track === 'e2e'
              ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
              : 'text-slate-500 hover:text-slate-700 border border-transparent'
          }`}
        >
          End-to-End (Claude Code)
        </button>
      </div>

      {track === 'function' ? (
        funcTask ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Model</th>
                  <th className="text-center py-2 px-1.5 text-slate-500 font-medium">Preprocessing</th>
                  <th className="text-center py-2 px-1.5 text-slate-500 font-medium">Physics Model</th>
                  <th className="text-center py-2 px-1.5 text-slate-500 font-medium">Solvers</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-medium">Overall</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {MODEL_ORDER.map((model) => {
                  const r = funcTask[model];
                  if (!r) return null;
                  const color = MODEL_COLORS[model];
                  return (
                    <tr key={model} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                          <span className="font-medium text-slate-800">{model}</span>
                        </div>
                      </td>
                      <StatusCell status={r.preprocessing || 'n/a'} score={r.preprocessing_score} />
                      <StatusCell status={r.physics_model || 'n/a'} score={r.physics_model_score} />
                      <StatusCell status={r.solvers || 'n/a'} score={r.solvers_score} />
                      <td className={`text-center py-2 px-2 font-semibold ${
                        r.overall === 'pass' ? 'text-green-600' : r.overall === 'fail' ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {r.overall === 'pass' ? 'PASS' : r.overall === 'fail' ? 'FAIL' : 'N/A'}
                      </td>
                      <td className="text-right py-2 px-2 font-mono text-slate-500">
                        {r.score || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">
            No function-level data available for this task.
          </p>
        )
      ) : (
        /* E2E tab */
        e2eTask ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              End-to-end reconstruction metrics from Claude Code (black-box agent with shell access).
              Other models evaluated via multi-agent pipeline — per-task E2E data not available.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {e2eTask.ncc != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                  <span className="text-xs text-slate-500">NCC</span>
                  <span className="text-sm font-semibold text-slate-800 ml-auto">{e2eTask.ncc.toFixed(4)}</span>
                </div>
              )}
              {e2eTask.nrmse != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                  <span className="text-xs text-slate-500">NRMSE</span>
                  <span className="text-sm font-semibold text-slate-800 ml-auto">{e2eTask.nrmse.toFixed(4)}</span>
                </div>
              )}
              {e2eTask.psnr != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                  <span className="text-xs text-slate-500">PSNR</span>
                  <span className="text-sm font-semibold text-slate-800 ml-auto">{e2eTask.psnr.toFixed(2)} dB</span>
                </div>
              )}
              {e2eTask.ssim != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                  <span className="text-xs text-slate-500">SSIM</span>
                  <span className="text-sm font-semibold text-slate-800 ml-auto">{e2eTask.ssim.toFixed(4)}</span>
                </div>
              )}
            </div>
            <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${
              e2eTask.verdict === 'pass' ? 'bg-green-50 text-green-700 border border-green-200' :
              e2eTask.verdict === 'partial' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
              e2eTask.verdict === 'fail' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-slate-50 text-slate-500 border border-slate-200'
            }`}>
              Verdict: {e2eTask.verdict.toUpperCase()}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-6">
            No end-to-end data available for this task.
          </p>
        )
      )}
    </div>
  );
}
