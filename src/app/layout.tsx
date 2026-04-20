import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'imaging-101 — Scientific Imaging Benchmark',
  description: 'A benchmark suite for evaluating coding agents on computational and scientific imaging tasks. 57 tasks across 9 domains with standardized evaluation.',
  keywords: ['computational imaging', 'benchmark', 'inverse problems', 'coding agents', 'scientific imaging', 'MRI', 'CT', 'ptychography'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧪</text></svg>" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
