'use client';

import React, { useState } from 'react';
import { Trophy, ChevronDown } from 'lucide-react';

/* ── Table 1 data from ICCP 2026 paper ── */
const MODELS = [
  {
    name: 'Claude-4.6-Opus',
    org: 'Anthropic',
    planning: { pre: 87.7, fwd: 93.0, inv: 91.2, overall: 78.9 },
    function: { pre: 80.6, fwd: 84.3, inv: 71.0, module_overall: 24.6, avg_rounds: 4.29 },
    e2e: { success: 31.6, avg_rounds: 2.11 },
  },
  {
    name: 'Gemini-3.1-Pro',
    org: 'Google',
    planning: { pre: 75.4, fwd: 80.7, inv: 71.9, overall: 43.9 },
    function: { pre: 97.6, fwd: 93.1, inv: 94.6, module_overall: 40.4, avg_rounds: 5.96 },
    e2e: { success: 19.3, avg_rounds: 4.49 },
  },
  {
    name: 'GPT-5.4',
    org: 'OpenAI',
    planning: { pre: 86.0, fwd: 89.5, inv: 84.2, overall: 68.4 },
    function: { pre: 91.7, fwd: 76.0, inv: 77.4, module_overall: 26.3, avg_rounds: 6.22 },
    e2e: { success: 14.0, avg_rounds: 1.12 },
  },
  {
    name: 'Kimi-k2.5',
    org: 'Moonshot AI',
    planning: { pre: 87.7, fwd: 93.0, inv: 89.5, overall: 75.4 },
    function: { pre: 82.9, fwd: 80.9, inv: 67.9, module_overall: 17.5, avg_rounds: 4.94 },
    e2e: { success: 10.5, avg_rounds: 4.58 },
  },
  {
    name: 'GLM-5',
    org: 'Zhipu AI',
    planning: { pre: 87.7, fwd: 84.2, inv: 57.9, overall: 47.4 },
    function: { pre: 93.5, fwd: 81.9, inv: 83.1, module_overall: 21.1, avg_rounds: 8.28 },
    e2e: { success: 8.8, avg_rounds: 4.72 },
  },
  {
    name: 'DeepSeek-V3',
    org: 'DeepSeek',
    planning: { pre: 80.7, fwd: 71.9, inv: 71.9, overall: 54.4 },
    function: { pre: 75.4, fwd: 86.9, inv: 57.6, module_overall: 12.3, avg_rounds: 4.22 },
    e2e: { success: 7.0, avg_rounds: 4.81 },
  },
  {
    name: 'Qwen3.6-Plus',
    org: 'Alibaba',
    planning: { pre: 80.7, fwd: 80.7, inv: 77.2, overall: 52.6 },
    function: { pre: 77.4, fwd: 75.1, inv: 68.5, module_overall: 17.5, avg_rounds: 8.58 },
    e2e: { success: 5.3, avg_rounds: 2.33 },
  },
];

/* Also include Claude Code as a separate reference */
const CLAUDE_CODE = {
  name: 'Claude Code',
  org: 'Anthropic',
  e2e_success: 56.1,
  note: 'Black-box agent with shell access (reported separately)',
};

type Track = 'e2e' | 'function' | 'planning';

function TrackTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function CellValue({ value, best, second }: { value: number; best: number; second: number }) {
  const isBest = Math.abs(value - best) < 0.05;
  const isSecond = !isBest && Math.abs(value - second) < 0.05;
  return (
    <span className={isBest ? 'text-cyan-700 font-bold' : isSecond ? 'text-teal-600 underline' : 'text-slate-600'}>
      {value.toFixed(1)}%
    </span>
  );
}

export default function Leaderboard() {
  const [track, setTrack] = useState<Track>('e2e');

  // Sort by the primary metric of the selected track
  const sorted = [...MODELS].sort((a, b) => {
    if (track === 'e2e') return b.e2e.success - a.e2e.success;
    if (track === 'function') return b.function.module_overall - a.function.module_overall;
    return b.planning.overall - a.planning.overall;
  });

  // Find best/second for highlighting
  const getBestTwo = (arr: number[]) => {
    const s = [...arr].sort((a, b) => b - a);
    return { best: s[0], second: s[1] };
  };

  const e2eBT = getBestTwo(MODELS.map(m => m.e2e.success));
  const funcBT = getBestTwo(MODELS.map(m => m.function.module_overall));
  const planBT = getBestTwo(MODELS.map(m => m.planning.overall));
  const funcPreBT = getBestTwo(MODELS.map(m => m.function.pre));
  const funcFwdBT = getBestTwo(MODELS.map(m => m.function.fwd));
  const funcInvBT = getBestTwo(MODELS.map(m => m.function.inv));

  return (
    <section id="leaderboard" className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={22} className="text-cyan-600" />
        <h2 className="text-2xl font-bold text-slate-900">Leaderboard</h2>
      </div>

      <p className="text-sm text-slate-500 mb-6 max-w-3xl">
        Results from evaluating 7 frontier LLMs on all 57 tasks.
        <span className="text-slate-400"> Bold = best, underline = second best.</span>
      </p>

      {/* Track tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-50 border border-slate-200 w-fit">
        <TrackTab label="End-to-End" active={track === 'e2e'} onClick={() => setTrack('e2e')} />
        <TrackTab label="Function-Level" active={track === 'function'} onClick={() => setTrack('function')} />
        <TrackTab label="Planning" active={track === 'planning'} onClick={() => setTrack('planning')} />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium w-8">#</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Model</th>
                {track === 'e2e' && (
                  <>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Success Rate</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Avg. Rounds</th>
                  </>
                )}
                {track === 'function' && (
                  <>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Preprocessing</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Forward Physics</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Inverse Solver</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Overall (Module)</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Avg. Rounds</th>
                  </>
                )}
                {track === 'planning' && (
                  <>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Preprocessing</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Forward Physics</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Inverse Solver</th>
                    <th className="text-right py-3 px-4 text-slate-500 font-medium">Overall</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr key={m.name} className={`border-b border-slate-100 ${i === 0 ? 'bg-cyan-50/50' : 'hover:bg-slate-50'} transition`}>
                  <td className="py-3 px-4 text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.org}</div>
                  </td>
                  {track === 'e2e' && (
                    <>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.e2e.success} best={e2eBT.best} second={e2eBT.second} />
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-slate-400">{m.e2e.avg_rounds.toFixed(2)}</td>
                    </>
                  )}
                  {track === 'function' && (
                    <>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.function.pre} best={funcPreBT.best} second={funcPreBT.second} />
                      </td>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.function.fwd} best={funcFwdBT.best} second={funcFwdBT.second} />
                      </td>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.function.inv} best={funcInvBT.best} second={funcInvBT.second} />
                      </td>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.function.module_overall} best={funcBT.best} second={funcBT.second} />
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-slate-400">{m.function.avg_rounds.toFixed(2)}</td>
                    </>
                  )}
                  {track === 'planning' && (
                    <>
                      <td className="text-right py-3 px-4 font-mono text-slate-600">{m.planning.pre.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 font-mono text-slate-600">{m.planning.fwd.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 font-mono text-slate-600">{m.planning.inv.toFixed(1)}%</td>
                      <td className="text-right py-3 px-4 font-mono">
                        <CellValue value={m.planning.overall} best={planBT.best} second={planBT.second} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Claude Code callout */}
        <div className="border-t border-slate-200 px-4 py-3 bg-teal-50/50 flex items-center gap-3">
          <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-medium shrink-0">Reference</span>
          <span className="text-sm text-slate-600">
            <strong className="text-slate-900">Claude Code</strong> (black-box, shell access): <strong className="text-cyan-700">56.1%</strong> end-to-end success rate — reported separately due to different execution environment.
          </span>
        </div>
      </div>
    </section>
  );
}
