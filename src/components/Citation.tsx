'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';

const BIBTEX = `@inproceedings{imaging101,
  title     = {Imaging-101: Benchmarking LLM Agents for
               Scientific Computational Imaging Problems},
  author    = {Anonymous},
  booktitle = {International Conference on Computational
               Photography (ICCP)},
  year      = {2026},
  note      = {Under review}
}`;

export default function Citation() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BIBTEX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="citation" className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={22} className="text-cyan-600" />
        <h2 className="text-2xl font-bold text-slate-900">Citation</h2>
      </div>

      <p className="text-sm text-slate-500 mb-4">
        If you find Imaging-101 useful in your research, please cite our paper:
      </p>

      <div className="code-block relative group">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition opacity-0 group-hover:opacity-100"
          title="Copy BibTeX"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>
        <pre className="p-5 text-[13px] leading-relaxed text-slate-600 overflow-x-auto font-mono">
          {BIBTEX}
        </pre>
      </div>
    </section>
  );
}
