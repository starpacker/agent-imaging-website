'use client';

import { Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/40 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">&#x1f9ea;</span>
            <div>
              <span className="text-sm font-semibold text-white">imaging-101</span>
              <p className="text-xs text-zinc-600">Scientific Imaging Benchmark</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/HeSunPU/imaging-101"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition"
            >
              <Github size={14} /> GitHub <ExternalLink size={11} className="opacity-50" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/30 text-center">
          <p className="text-[11px] text-zinc-600 leading-relaxed max-w-lg mx-auto">
            imaging-101 is an open benchmark for evaluating coding agents on scientific imaging tasks.
            Contributions welcome.
          </p>
          <p className="text-[10px] text-zinc-700 mt-3">
            &copy; {new Date().getFullYear()} imaging-101 Team
          </p>
        </div>
      </div>
    </footer>
  );
}
