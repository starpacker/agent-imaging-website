'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const BASE_TASK_URL = 'https://raw.githubusercontent.com/HeSunPU/imaging-101/main/tasks';

function resolveTaskAsset(taskName: string, src: string | undefined): string | undefined {
  if (!src) return src;
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src;
  return `${BASE_TASK_URL}/${taskName}/${src.replace(/^\.?\//, '')}`;
}

interface Props {
  content: string;
  taskName: string;
}

export default function MarkdownContent({ content, taskName }: Props) {
  const components: Components = {
    h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-950 mt-1 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-sm font-semibold text-slate-700 mt-5 mb-2">{children}</h4>,
    p: ({ children }) => <p className="text-sm leading-7 text-slate-600 mb-3">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-4 text-sm text-slate-600">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-sm text-slate-600">{children}</ol>,
    li: ({ children }) => <li className="leading-7">{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-700 hover:text-cyan-800 hover:underline break-words"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyan-200 bg-cyan-50/60 px-4 py-2 my-4 text-slate-600">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
    th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 align-top text-slate-600 border-b border-slate-100">{children}</td>,
    code: ({ children, className, ...props }) => {
      const isBlock = Boolean(className);
      if (!isBlock) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-slate-100 text-cyan-700 text-xs font-mono" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} text-xs font-mono text-slate-100`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-lg bg-slate-950 text-slate-100 p-4 my-4 text-xs leading-6">
        {children}
      </pre>
    ),
    img: ({ src, alt }) => (
      <img
        src={resolveTaskAsset(taskName, src)}
        alt={alt || ''}
        className="max-w-full rounded-lg border border-slate-200 bg-white my-4"
        loading="lazy"
      />
    ),
    hr: () => <hr className="my-6 border-slate-200" />,
  };

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
