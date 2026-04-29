'use client';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
          imaging-101 is an open benchmark for evaluating coding agents on scientific imaging tasks.
          Contributions welcome.
        </p>
        <p className="text-[10px] text-slate-300 mt-3">
          &copy; {new Date().getFullYear()} imaging-101 Team
        </p>
      </div>
    </footer>
  );
}
