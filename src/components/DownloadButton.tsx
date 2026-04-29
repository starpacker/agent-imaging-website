'use client';

import { Download } from 'lucide-react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function DownloadButton() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">Download benchmark data:</span>
        <a
          href={`${BASE_PATH}/data/model_results.json`}
          download="model_results.json"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <Download size={13} />
          Results (JSON)
        </a>
        <a
          href={`${BASE_PATH}/data/summary.csv`}
          download="summary.csv"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
        >
          <Download size={13} />
          Summary (CSV)
        </a>
      </div>
    </section>
  );
}
