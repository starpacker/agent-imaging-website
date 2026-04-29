'use client';

import { Github, ExternalLink } from 'lucide-react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">&#x1f9ea;</span>
            <div>
              <span className="text-sm font-semibold text-slate-900">imaging-101</span>
              <p className="text-xs text-slate-400">Scientific Imaging Benchmark</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`${BASE_PATH}/guide/`}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition"
            >
              Guide
            </a>
            <a
              href="https://github.com/HeSunPU/imaging-101"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition"
            >
              <Github size={14} /> GitHub <ExternalLink size={11} className="opacity-50" />
            </a>
            <a
              href="https://huggingface.co/datasets/AI4Imaging/imaging-101"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 transition"
            >
              <span className="text-sm">&#x1F917;</span> HuggingFace <ExternalLink size={11} className="opacity-50" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
            imaging-101 is an open benchmark for evaluating coding agents on scientific imaging tasks.
            Contributions welcome.
          </p>
          <p className="text-[10px] text-slate-300 mt-3">
            &copy; {new Date().getFullYear()} imaging-101 Team
          </p>
        </div>
      </div>
    </footer>
  );
}
