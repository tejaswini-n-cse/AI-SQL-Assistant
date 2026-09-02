import React, { useState } from 'react';
import { Copy, Check, Terminal, Play, Sparkles, ExternalLink } from 'lucide-react';

interface SqlCodeBlockProps {
  code: string;
  dialect?: string;
  title?: string;
  showLineNumbers?: boolean;
  onCopy?: () => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
}

// Lightweight syntax highlighting token parser for SQL
function highlightSql(sql: string): React.ReactNode[] {
  if (!sql) return [];

  // Match SQL keywords, strings, numbers, comments, functions
  const lines = sql.split('\n');
  return lines.map((line, lineIdx) => {
    // Check if whole line is comment
    if (line.trim().startsWith('--')) {
      return (
        <div key={lineIdx} className="table-row">
          <span className="text-neutral-500 italic select-none">{line}</span>
        </div>
      );
    }

    // Tokenize
    const tokenRegex = /(--.*$|'[^']*'|"[^"]*"|\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AND|OR|NOT|IN|EXISTS|IS|NULL|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT|OFFSET|FETCH\s+FIRST|ROWS\s+ONLY|UNION|ALL|INTERSECT|EXCEPT|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|INSERT\s+INTO|VALUES|UPDATE|SET|DELETE|CREATE\s+TABLE|CREATE\s+INDEX|ALTER\s+TABLE|DROP|TABLE|VIEW|WITH|RECURSIVE|PARTITION\s+BY|OVER|BETWEEN|LIKE|ILIKE|ASC|DESC|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|CASCADE|DEFAULT|TOP)\b|\b(?:COUNT|SUM|AVG|MIN|MAX|DENSE_RANK|ROW_NUMBER|RANK|COALESCE|CONCAT|NOW|CURRENT_TIMESTAMP|UPPER|LOWER|TRIM|SUBSTRING|DATE_TRUNC|EXTRACT|CAST|ROUND|FLOOR|CEIL)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_][a-zA-Z0-9_]*|[^\s\w])/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      const token = match[0];
      const upper = token.toUpperCase();

      if (token.startsWith('--')) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-neutral-500 italic">
            {token}
          </span>
        );
      } else if (token.startsWith("'") || token.startsWith('"')) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-amber-300 dark:text-amber-300">
            {token}
          </span>
        );
      } else if (/^\d+(?:\.\d+)?$/.test(token)) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-emerald-400 dark:text-emerald-400">
            {token}
          </span>
        );
      } else if (
        [
          'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS',
          'ON', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'IS', 'NULL', 'GROUP BY', 'HAVING',
          'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 'AS', 'DISTINCT',
          'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
          'DELETE', 'CREATE TABLE', 'CREATE INDEX', 'ALTER TABLE', 'DROP', 'TABLE', 'VIEW',
          'WITH', 'RECURSIVE', 'PARTITION BY', 'OVER', 'BETWEEN', 'LIKE', 'ILIKE', 'ASC', 'DESC',
          'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'DEFAULT', 'TOP'
        ].includes(upper)
      ) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-indigo-400 dark:text-indigo-400 font-semibold">
            {token}
          </span>
        );
      } else if (
        [
          'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DENSE_RANK', 'ROW_NUMBER', 'RANK',
          'COALESCE', 'CONCAT', 'NOW', 'CURRENT_TIMESTAMP', 'UPPER', 'LOWER', 'TRIM',
          'SUBSTRING', 'DATE_TRUNC', 'EXTRACT', 'CAST', 'ROUND', 'FLOOR', 'CEIL'
        ].includes(upper)
      ) {
        parts.push(
          <span key={`${lineIdx}-${match.index}`} className="text-purple-400 dark:text-purple-400">
            {token}
          </span>
        );
      } else {
        parts.push(token);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return (
      <div key={lineIdx} className="table-row">
        <span className="table-cell select-none pr-4 text-right text-neutral-600 dark:text-neutral-600 font-mono text-xs w-8">
          {lineIdx + 1}
        </span>
        <span className="table-cell whitespace-pre font-mono text-xs sm:text-sm text-neutral-200">
          {parts.length > 0 ? parts : ' '}
        </span>
      </div>
    );
  });
}

export function SqlCodeBlock({
  code,
  dialect,
  title,
  showLineNumbers = true,
  onCopy,
  actions = [],
}: SqlCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          {title ? (
            <span className="text-xs font-medium text-neutral-300">{title}</span>
          ) : (
            <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span>SQL Query</span>
            </span>
          )}
          {dialect && (
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              {dialect}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {actions.map((act, i) => (
            <button
              key={i}
              onClick={act.onClick}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition"
            >
              {act.icon}
              <span>{act.label}</span>
            </button>
          ))}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-400" />
                <span>Copy SQL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed max-h-[420px] overflow-y-auto">
        <div className="table w-full">{highlightSql(code)}</div>
      </div>
    </div>
  );
}
