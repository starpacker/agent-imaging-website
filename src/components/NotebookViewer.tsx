'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Image, Code2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import MarkdownContent from './MarkdownContent';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface NotebookCell {
  type: 'code' | 'markdown';
  source: string;
  images?: string[];
  text_output?: string;
}

interface NotebookData {
  task: string;
  notebook_file: string;
  cell_count: number;
  cells: NotebookCell[];
}

/* ── Cell Number Badge ── */
function CellBadge({ index, type }: { index: number; type: string }) {
  const isCode = type === 'code';
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-bold shrink-0 ${
      isCode ? 'bg-cyan-50 text-cyan-700' : 'bg-purple-50 text-purple-700'
    }`}>
      {isCode ? <Code2 size={10} /> : <FileText size={10} />}
      [{index}]
    </div>
  );
}

/* ── Single Cell ── */
function NotebookCellView({ cell, index, taskName }: { cell: NotebookCell; index: number; taskName: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const isCode = cell.type === 'code';
  const lines = cell.source.split('\n').length;

  return (
    <div className={`border rounded-xl overflow-hidden ${
      isCode ? 'border-slate-200' : 'border-slate-100'
    }`}>
      {/* Cell header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
        onClick={() => setCollapsed(!collapsed)}
      >
        <CellBadge index={index} type={cell.type} />
        {isCode && (
          <span className="text-[10px] text-slate-400 font-mono">
            {lines} lines
            {cell.images && cell.images.length > 0 && (
              <span className="text-amber-600 ml-2">&#x1f4ca; {cell.images.length} figure{cell.images.length > 1 ? 's' : ''}</span>
            )}
          </span>
        )}
        <div className="flex-1" />
        {collapsed
          ? <ChevronRight size={12} className="text-slate-400" />
          : <ChevronDown size={12} className="text-slate-400" />
        }
      </div>

      {/* Cell body */}
      {!collapsed && (
        <div>
          {isCode ? (
            <div className="text-[12px]">
              <SyntaxHighlighter
                language="python"
                style={oneLight}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: '12px 16px',
                  background: '#f8fafc',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  borderRadius: 0,
                }}
                lineNumberStyle={{ color: '#94a3b8', fontSize: '10px', minWidth: '2em' }}
              >
                {cell.source}
              </SyntaxHighlighter>
              {/* Text output */}
              {cell.text_output && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                  <pre className="text-[11px] text-slate-500 font-mono whitespace-pre-wrap">{cell.text_output}</pre>
                </div>
              )}
              {/* Image outputs */}
              {cell.images && cell.images.length > 0 && (
                <div className="border-t border-slate-200 bg-white">
                  {cell.images.map((imgFile, imgIdx) => (
                    <div key={imgIdx} className="p-3">
                      <img
                        src={`${BASE_PATH}/images/nb/${imgFile}`}
                        alt={`Output ${imgIdx}`}
                        className="max-w-full h-auto rounded-lg border border-slate-200"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              <MarkdownContent content={cell.source} taskName={taskName} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Notebook Viewer ── */
export default function NotebookViewer({ taskName }: { taskName: string }) {
  const [nb, setNb] = useState<NotebookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BASE_PATH}/data/notebooks/${taskName}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Notebook not found`);
        return r.json();
      })
      .then((data: NotebookData) => { setNb(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [taskName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Loading notebook...</p>
        </div>
      </div>
    );
  }

  if (error || !nb) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-sm">Notebook not available for this task.</p>
      </div>
    );
  }

  const codeCells = nb.cells.filter(c => c.type === 'code').length;
  const mdCells = nb.cells.filter(c => c.type === 'markdown').length;

  return (
    <div>
      {/* Notebook header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <Code2 size={14} className="text-cyan-600" />
          <span className="text-xs font-mono text-slate-500">{nb.notebook_file}</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {codeCells} code &bull; {mdCells} markdown
        </span>
      </div>

      {/* Cells */}
      <div className="space-y-2">
        {nb.cells.map((cell, i) => (
          <NotebookCellView key={i} cell={cell} index={i} taskName={taskName} />
        ))}
      </div>
    </div>
  );
}
