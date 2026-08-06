'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';

function ExternalLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const url = href || '';
  const safe = /^(https?:|mailto:|tel:)/i.test(url) ? url : undefined;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline underline-offset-2 decoration-blue-400/60 hover:text-blue-700 hover:decoration-blue-600 break-all transition-colors"
      {...rest}
    >
      {children}
    </a>
  );
}

const components: Components = {
  a: ExternalLink,
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 text-2xl font-bold leading-tight text-slate-900 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-3 text-xl font-bold leading-tight text-slate-900 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-2 text-lg font-semibold leading-snug text-slate-900 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 text-base font-semibold leading-snug text-slate-900 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-7 text-slate-700 first:mt-0 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-3 space-y-2 list-disc pl-5 marker:text-blue-500">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-2 list-decimal pl-5 marker:font-semibold marker:text-blue-600">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-slate-700 pl-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-blue-300 bg-blue-50/70 rounded-r-lg px-4 py-3 text-slate-700 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
  code: ({ className, children }) => {
    const isBlock = Boolean(className && className.includes('language-'));
    if (isBlock) {
      return (
        <code className="block bg-slate-900 text-slate-100 rounded-lg px-4 py-3 text-sm leading-6 overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-slate-100 text-blue-700 rounded px-1.5 py-0.5 text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-hidden rounded-lg">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-slate-900 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-slate-700 align-top border-t border-slate-100">
      {children}
    </td>
  ),
};

const compactComponents: Components = {
  ...components,
  p: ({ children }) => (
    <span className="leading-relaxed text-slate-700">{children}</span>
  ),
  ul: ({ children }) => (
    <ul className="my-1 space-y-1 list-disc pl-5 marker:text-blue-500">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 space-y-1 list-decimal pl-5 marker:font-semibold marker:text-blue-600">
      {children}
    </ol>
  ),
};

export default function Markdown({
  content,
  compact = false,
}: {
  content: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? '' : 'prose prose-slate max-w-none'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={compact ? compactComponents : components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
